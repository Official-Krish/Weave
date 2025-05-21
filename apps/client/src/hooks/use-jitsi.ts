import { useState } from "react";
import { useEffect, useRef } from 'react';
import { JITSI_URL } from '../config';

interface Participant {
    id: string;
    displayName: string;
    isAudioMuted: boolean;
    isVideoMuted: boolean;
}
  
interface RemoteTracks {
    [participantId: string]: any[]; 
}

export const useJitsi = () => {
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>("");
    const [displayName, setDisplayName] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [jitsiLoaded, setJitsiLoaded] = useState<boolean>(false);
    
    // Participant/tracks state
    const [localTracks, setLocalTracks] = useState<any[]>([]); 
    const [remoteTracks, setRemoteTracks] = useState<RemoteTracks>({});
    const [participants, setParticipants] = useState<Record<string, Participant>>({});
    const [isMuted, setIsMuted] = useState<boolean>(false);
    const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
    const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
    
    // Refs
    const connectionRef = useRef<any>(null);
    const conferenceRef = useRef<any>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const screenshareTrackRef = useRef<any>(null);

    // Setup jitsi library
    useEffect(() => {
        if (window.JitsiMeetJS) {
            initJitsi();
            return;
        }

        const script = document.createElement('script');
        script.src = `https://${JITSI_URL}/libs/lib-jitsi-meet.min.js`;
        script.async = true;
        
        script.onload = () => {
            console.log('JitsiMeetJS loaded successfully');
            initJitsi();
        };
        
        script.onerror = () => {
            console.error('Failed to load Jitsi Meet library');
            setError('Failed to load Jitsi Meet library. Please refresh and try again.');
        };
        
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
            cleanup();
        };
    }, []);

    const initJitsi = () => {
        if (!window.JitsiMeetJS) {
            setError('JitsiMeetJS failed to load properly');
            return;
        }

        try {
            window.JitsiMeetJS.init({
                disableAudioLevels: true,
                disableSimulcast: false,
            });
            window.JitsiMeetJS.setLogLevel(window.JitsiMeetJS.logLevels.ERROR);
            setJitsiLoaded(true);
            console.log('JitsiMeetJS initialized successfully');
        } catch (e) {
            console.error('JitsiMeetJS initialization error:', e);
            setError(`Failed to initialize Jitsi: ${e instanceof Error ? e.message : 'Unknown error'}`);
        }
    };

    const cleanup = () => {
        console.log('Cleaning up resources...');
        
        // Dispose local tracks
        localTracks.forEach(track => {
            try {
                if (track && typeof track.dispose === 'function') {
                    track.dispose();
                }
            } catch (e) {
                console.error('Error disposing local track:', e);
            }
        });
        
        // Dispose screenshare track
        if (screenshareTrackRef.current) {
            try {
                screenshareTrackRef.current.dispose();
                screenshareTrackRef.current = null;
            } catch (e) {
                console.error('Error disposing screenshare track:', e);
            }
        }
        
        // Leave conference
        if (conferenceRef.current) {
            try {
                conferenceRef.current.leave();
                conferenceRef.current = null;
            } catch (e) {
                console.error('Error leaving conference:', e);
            }
        }
        
        // Disconnect
        if (connectionRef.current) {
            try {
                connectionRef.current.disconnect();
                connectionRef.current = null;
            } catch (e) {
                console.error('Error disconnecting:', e);
            }
        }
    
        setLocalTracks([]);
        setRemoteTracks({});
        setParticipants({});
        setIsConnected(false);
    };

    // Add local video to DOM when local tracks change
    useEffect(() => {
        const videoTrack = localTracks.find(track => track && track.getType && track.getType() === 'video');
        
        if (videoTrack && localVideoRef.current) {
            try {
                videoTrack.attach(localVideoRef.current);
            } catch (e) {
                console.error('Error attaching local video track:', e);
            }
        }
        
        return () => {
            if (videoTrack && localVideoRef.current) {
                try {
                    videoTrack.detach(localVideoRef.current);
                } catch (e) {
                    console.error('Error detaching local video track:', e);
                }
            }
        };
    }, [localTracks]);

    // Check if audio is muted when local tracks change
    useEffect(() => {
        const audioTrack = localTracks.find(track => track && track.getType && track.getType() === 'audio');
        if (audioTrack) {
            setIsMuted(audioTrack.isMuted());
        }
    }, [localTracks]);

    // Check if video is muted when local tracks change
    useEffect(() => {
        const videoTrack = localTracks.find(track => track && track.getType && track.getType() === 'video');
        if (videoTrack) {
            setIsVideoOff(videoTrack.isMuted());
        }
    }, [localTracks]);

    const connect = async (roomNameParam: string, displayNameParam: string) => {
        console.log('Connecting to Jitsi with room name:', roomNameParam, 'and display name:', displayNameParam);
        
        if (!roomNameParam || !displayNameParam) {
            setError('Room name and display name are required');
            return;
        }
        
        if (!jitsiLoaded || !window.JitsiMeetJS) {
            setError('Jitsi Meet library is not loaded yet. Please wait or refresh the page.');
            return;
        }
        
        setIsConnecting(true);
        setError('');
        setRoomName(roomNameParam);
        setDisplayName(displayNameParam);
        
        try {
            console.log('Creating new JitsiConnection...');
            const connection = new window.JitsiMeetJS.JitsiConnection(null, null, {
                hosts: {
                    domain: JITSI_URL,
                    muc: `conference.${JITSI_URL}`, 
                },
                serviceUrl: `wss://${JITSI_URL}/xmpp-websocket`,
                clientNode: 'http://jitsi.org/jitsimeet'
            });
            
            connectionRef.current = connection;
            
            // Set up connection event listeners
            connection.addEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                () => onConnectionSuccess(roomNameParam, displayNameParam)
            );
            connection.addEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
                onConnectionFailed
            );
            connection.addEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                onDisconnected
            );
            
            console.log('Connecting to Jitsi server...');
            connection.connect();
        } catch (error) {
            console.error('Connection error:', error);
            setError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsConnecting(false);
        }
    };

    const onConnectionSuccess = async (roomNameParam: string, displayNameParam: string) => {
        console.log('Connection established successfully!');
        
        try {
            if (!connectionRef.current) {
                throw new Error('No connection established');
            }

            // Set connected flag
            setIsConnected(true);
            
            console.log('Initializing conference for room:', roomNameParam);
            const conference = connectionRef.current.initJitsiConference(roomNameParam, {
                openBridgeChannel: true
            });
            
            conferenceRef.current = conference;
            
            // Set up conference event listeners
            conference.on(
                window.JitsiMeetJS.events.conference.TRACK_ADDED,
                onRemoteTrackAdded
            );
            conference.on(
                window.JitsiMeetJS.events.conference.TRACK_REMOVED,
                onRemoteTrackRemoved
            );
            conference.on(
                window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
                onConferenceJoined
            );
            conference.on(
                window.JitsiMeetJS.events.conference.USER_JOINED,
                onUserJoined
            );
            conference.on(
                window.JitsiMeetJS.events.conference.USER_LEFT,
                onUserLeft
            );
            conference.on(
                window.JitsiMeetJS.events.conference.TRACK_MUTE_CHANGED,
                onTrackMuteChanged
            );
            conference.on(
                window.JitsiMeetJS.events.conference.DISPLAY_NAME_CHANGED,
                onDisplayNameChanged
            );
            
            // Create local tracks
            console.log('Creating local audio and video tracks...');
            try {
                const tracks = await window.JitsiMeetJS.createLocalTracks({
                    devices: ['audio', 'video']
                });
                
                console.log(`Created ${tracks.length} local tracks`);
                
                // Add tracks to conference and update state
                tracks.forEach(track => {
                    console.log(`Adding ${track.getType()} track to conference`);
                    conference.addTrack(track);
                });
                
                // Save local tracks in state
                setLocalTracks(tracks);
            } catch (tracksError) {
                console.error('Error creating local tracks:', tracksError);
                setError(`Camera/microphone error: ${tracksError instanceof Error ? tracksError.message : 'Permission denied or device unavailable'}`);
            }
            
            // Set display name and join the conference
            conference.setDisplayName(displayNameParam);
            console.log('Joining conference...');
            conference.join();
        } catch (error) {
            console.error('Conference error:', error);
            setError(`Error joining conference: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setIsConnecting(false);
            
            // Attempt to clean up on error
            cleanup();
        }
    };

    // Handler for connection failure
    const onConnectionFailed = (error: any) => {
        console.error('Connection failed:', error);
        setError(`Connection to server failed: ${error || 'Unknown error'}`);
        setIsConnecting(false);
    };

    // Handler for disconnection
    const onDisconnected = () => {
        console.log('Connection disconnected');
        setIsConnected(false);
        setParticipants({});
        setRemoteTracks({});
    };

    // Handler for joining conference
    const onConferenceJoined = () => {
        console.log('Conference joined successfully!');
        setIsConnecting(false);
    };

    // Handler for remote track being added
    const onRemoteTrackAdded = (track: any) => {
        if (!track || track.isLocal()) {
            return;
        }
        
        const participantId = track.getParticipantId();
        console.log(`Remote track added from participant ${participantId}, type: ${track.getType()}`);
        
        setRemoteTracks(prevTracks => {
            const newTracks = { ...prevTracks };
            
            if (!newTracks[participantId]) {
                newTracks[participantId] = [];
            }
            
            newTracks[participantId] = [...newTracks[participantId], track];
            return newTracks;
        });
    };

    // Handler for remote track being removed
    const onRemoteTrackRemoved = (track: any) => {
        if (!track || track.isLocal()) {
            return;
        }
        
        const participantId = track.getParticipantId();
        console.log(`Remote track removed from participant ${participantId}, type: ${track.getType()}`);
        
        setRemoteTracks(prevTracks => {
            const newTracks = { ...prevTracks };
            
            if (newTracks[participantId]) {
                newTracks[participantId] = newTracks[participantId].filter(
                    t => t.getId() !== track.getId()
                );
                
                if (newTracks[participantId].length === 0) {
                    delete newTracks[participantId];
                }
            }
            
            return newTracks;
        });
    };

    // Handler for user joining
    const onUserJoined = (id: string, user: any) => {
        console.log(`User joined: ${id}, name: ${user.getDisplayName() || 'Unnamed'}`);
        
        // Debug
        console.log('Current participants before adding:', participants);
        
        setParticipants(prevParticipants => {
            const newParticipants = {
                ...prevParticipants,
                [id]: {
                    id,
                    displayName: user.getDisplayName() || 'Unnamed Participant',
                    isAudioMuted: true,
                    isVideoMuted: true
                }
            };
            
            // Debug
            console.log('New participants state:', newParticipants);
            
            return newParticipants;
        });
    };
    
    // Handler for user leaving
    const onUserLeft = (id: string) => {
        console.log(`User left: ${id}`);
        setParticipants(prevParticipants => {
            const newParticipants = { ...prevParticipants };
            delete newParticipants[id];
            return newParticipants;
        });
    };

    // Handler for track mute status changes
    const onTrackMuteChanged = (track: any) => {
        if (!track) return;
        
        const participantId = track.getParticipantId();
        const trackType = track.getType();
        const isMuted = track.isMuted();
        
        console.log(`Track mute changed for ${participantId}, type: ${trackType}, muted: ${isMuted}`);
        
        if (track.isLocal()) {
            if (trackType === 'audio') {
                setIsMuted(isMuted);
            } else if (trackType === 'video') {
                setIsVideoOff(isMuted);
            }
        } else {
            setParticipants(prevParticipants => {
                if (!prevParticipants[participantId]) {
                    return prevParticipants;
                }
                
                return {
                    ...prevParticipants,
                    [participantId]: {
                        ...prevParticipants[participantId],
                        isAudioMuted: trackType === 'audio' ? isMuted : prevParticipants[participantId].isAudioMuted,
                        isVideoMuted: trackType === 'video' ? isMuted : prevParticipants[participantId].isVideoMuted
                    }
                };
            });
        }
    };

    // Handler for display name changes
    const onDisplayNameChanged = (id: string, displayName: string) => {
        console.log(`Display name changed for ${id}: ${displayName}`);
        setParticipants(prevParticipants => {
            if (!prevParticipants[id]) {
                return prevParticipants;
            }
            
            return {
                ...prevParticipants,
                [id]: {
                    ...prevParticipants[id],
                    displayName: displayName || 'Unnamed Participant'
                }
            };
        });
    };

    // Toggle audio mute status
    const toggleAudio = () => {
        const audioTrack = localTracks.find(track => track && track.getType && track.getType() === 'audio');
        
        if (audioTrack) {
            console.log(`${audioTrack.isMuted() ? 'Unmuting' : 'Muting'} audio`);
            try {
                if (audioTrack.isMuted()) {
                    audioTrack.unmute();
                } else {
                    audioTrack.mute();
                }
            } catch (e) {
                console.error("Error toggling audio:", e);
                setError(`Failed to toggle audio: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        } else {
            console.warn('No audio track found to toggle');
            // Try to recreate audio track if missing
            if (conferenceRef.current && window.JitsiMeetJS) {
                try {
                    window.JitsiMeetJS.createLocalTracks({
                        devices: ['audio']
                    }).then(tracks => {
                        if (tracks && tracks.length > 0) {
                            const audioTrack = tracks[0];
                            conferenceRef.current.addTrack(audioTrack);
                            setLocalTracks(prevTracks => [...prevTracks, audioTrack]);
                            console.log("Created new audio track");
                        }
                    }).catch(e => {
                        console.error("Failed to create audio track:", e);
                    });
                } catch (e) {
                    console.error("Error creating audio track:", e);
                }
            }
        }
    };

    // Toggle video mute status
    const toggleVideo = () => {
        const videoTrack = localTracks.find(track => track && track.getType && track.getType() === 'video');
        
        if (videoTrack) {
            console.log(`${videoTrack.isMuted() ? 'Unmuting' : 'Muting'} video`);
            try {
                if (videoTrack.isMuted()) {
                    videoTrack.unmute();
                } else {
                    videoTrack.mute();
                }
            } catch (e) {
                console.error("Error toggling video:", e);
                setError(`Failed to toggle video: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        } else {
            console.warn('No video track found to toggle');
            // Try to recreate video track if missing
            if (conferenceRef.current && window.JitsiMeetJS) {
                try {
                    window.JitsiMeetJS.createLocalTracks({
                        devices: ['video']
                    }).then(tracks => {
                        if (tracks && tracks.length > 0) {
                            const videoTrack = tracks[0];
                            conferenceRef.current.addTrack(videoTrack);
                            setLocalTracks(prevTracks => [...prevTracks, videoTrack]);
                            console.log("Created new video track");
                        }
                    }).catch(e => {
                        console.error("Failed to create video track:", e);
                    });
                } catch (e) {
                    console.error("Error creating video track:", e);
                }
            }
        }
    };

    // Toggle screen sharing
    const toggleScreenShare = async () => {
        if (!window.JitsiMeetJS) {
            setError('JitsiMeetJS is not available');
            return;
        }
        
        if (isScreenSharing) {
            // Stop screen sharing
            if (screenshareTrackRef.current) {
                console.log('Stopping screen sharing');
                try {
                    conferenceRef.current.removeTrack(screenshareTrackRef.current);
                    screenshareTrackRef.current.dispose();
                    screenshareTrackRef.current = null;
                    setIsScreenSharing(false);
                } catch (e) {
                    console.error('Error stopping screen sharing:', e);
                    setError(`Failed to stop screen sharing: ${e instanceof Error ? e.message : 'Unknown error'}`);
                }
            }
        } else {
            try {
                // Start screen sharing
                console.log('Starting screen sharing...');
                const desktopTrack = await window.JitsiMeetJS.createLocalTracks({
                    devices: ['desktop']
                });
                
                if (desktopTrack && desktopTrack.length > 0) {
                    conferenceRef.current.addTrack(desktopTrack[0]);
                    screenshareTrackRef.current = desktopTrack[0];
                    setIsScreenSharing(true);
                    
                    // Set up listener for when user stops sharing via browser UI
                    desktopTrack[0].addEventListener(
                        window.JitsiMeetJS.events.conference.LOCAL_TRACK_STOPPED,
                        () => {
                            console.log('Screen sharing stopped via browser UI');
                            if (screenshareTrackRef.current) {
                                conferenceRef.current.removeTrack(screenshareTrackRef.current);
                                screenshareTrackRef.current.dispose();
                                screenshareTrackRef.current = null;
                                setIsScreenSharing(false);
                            }
                        }
                    );
                }
            } catch (error) {
                console.error('Screen sharing error:', error);
                setError(`Screen sharing failed: ${error instanceof Error ? error.message : 'User denied permission or browser not supported'}`);
            }
        }
    };

    // Leave the conference
    const leaveConference = () => {
        console.log('Leaving conference...');
        cleanup();
    };

    // Get participant counts for debugging
    const getDebugInfo = () => {
        return {
            remoteTracksCount: Object.keys(remoteTracks).length,
            participantsCount: Object.keys(participants).length,
            localTracksCount: localTracks.length,
            conferenceActive: !!conferenceRef.current,
            connectionActive: !!connectionRef.current
        };
    };

    return {
        isConnecting,
        isConnected,
        roomName,
        displayName,
        error,
        localTracks,
        remoteTracks,
        participants,
        isMuted,
        isVideoOff,
        isScreenSharing,
        localVideoRef,
        connect,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        leaveConference,
        setError,
        setRoomName,
        jitsiLoaded,
        setIsConnecting,
        getDebugInfo
    };
};