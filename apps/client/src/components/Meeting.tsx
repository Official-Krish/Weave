import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, Mail, Lock, X } from 'lucide-react';
import { BACKEND_URL, JITSI_URL } from '../config';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import axios from 'axios';
import { VideoChat } from './Room/Main';
import { Participant } from '../types/videoChat';

// interface Participant {
//     id: string;
//     displayName: string;
//     isAudioMuted: boolean;
//     isVideoMuted: boolean;
// }
  
interface RemoteTracks {
    [participantId: string]: any[]; 
}

interface Joinee {
    email: string;
}

const Meeting = ({ page }: { page: "create" | "join" }) => {
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


    const [email, setEmail] = useState<string>('');
    const [joinees, setJoinees] = useState<Joinee[]>([]);
    const [passcode, setPasscode] = useState<string>('');
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [roomId, setRoomId] = useState<string>('');


    // Create a new meeting
    useEffect(() => {
        const fetchCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setCameras(videoDevices);
            } catch (error) {
                console.error('Error fetching cameras:', error);
            }
        };

        fetchCameras();
    }, []);



    const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        const fetchMicrophones = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioDevices = devices.filter(device => device.kind === 'audioinput');
                setMicrophones(audioDevices);
            } catch (error) {
                console.error('Error fetching microphones:', error);
            }
        };

        fetchMicrophones();
    }, []);


    const videoRef = useRef<HTMLVideoElement>(null);
    
    useEffect(() => {
        let videoTrack: JitsiMeetJS.JitsiTrack;
        
        const getTracks = async () => {
            try {
                const tracks = await window.JitsiMeetJS.createLocalTracks({
                    devices: ['video']
                });
                videoTrack = tracks[0];
                
                // Attach the track after it's created
                if (videoTrack && videoRef.current) {
                    try {
                        videoTrack.attach(videoRef.current);
                    } catch (e) {
                        console.error('Error attaching local video track:', e);
                    }
                }
            } catch (error) {
                console.error('Error creating local video track:', error);
            }
        }
        
        // Only create tracks if Jitsi is loaded
        if (window.JitsiMeetJS && jitsiLoaded) {
            getTracks();
        }
        
        return () => {
            if (videoTrack && videoRef.current) {
                try {
                    videoTrack.detach(videoRef.current);
                    videoTrack.dispose(); // Don't forget to dispose the track
                } catch (e) {
                    console.error('Error detaching/disposing local video track:', e);
                }
            }
        };
    }, [jitsiLoaded]);

    const handleAddParticipant = () => {
        if (email && email.includes('@')) {
          setJoinees([...joinees, { email }]);
          setEmail('');
        }
    };
    
    const handleRemoveParticipant = (emailToRemove: string) => {
        setJoinees(joinees.filter(p => p.email !== emailToRemove));
    };

    const CreateMeet = async () => {
        try {
            const response = await axios.post(`${BACKEND_URL}/meeting/create`, {
                roomName,
                participants: joinees.map(p => p.email),
                passcode
            }, {
                headers: {
                    "Authorization": `${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                console.log('Meeting created successfully:', response.data);
                setPasscode(response.data.passcode);
                await connect(response.data.id, response.data.name);
                window.history.pushState(null, '', `/meeting/${response.data.id}`);
            } else {
                console.error('Error creating meeting:', response.data);
                setError('Failed to create meeting. Please try again.');
            }
        } catch (error) {
            console.error('Error creating meeting:', error);
            setError('Failed to create meeting. Please try again.');
        }
    }


    // Join an existing meeting
    const JoinMeet = async () => {
        console.log('Joining meeting with ID:', roomId);
        try {
            const response = await axios.post(`${BACKEND_URL}/meeting/join/${roomId}`, {
                passcode
            }, {
                headers: {
                    "Authorization": `${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                console.log('Meeting joined successfully:', response.data);
                setPasscode(response.data.passcode);
                await connect(response.data.id, response.data.name);
                setIsConnecting(false);
                window.history.pushState(null, '', `/meeting/${response.data.id}`);
            } else {
                console.error('Error joining meeting:', response.data);
                setError('Failed to join meeting. Please try again.');
            }
        } catch (error) {
            console.error('Error joining meeting:', error);
            setError('Failed to join meeting. Please try again.');
        }
    };


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
                    name: user.getDisplayName() || 'Unnamed',
                    isScreenSharing: false,
                    isMuted: false,
                    isVideoOff: false,
                    stream: null,
                    screenStream: null,
                    tracks: remoteTracks[id],
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
                        isAudioMuted: trackType === 'audio' ? isMuted : prevParticipants[participantId].isMuted,
                        isVideoMuted: trackType === 'video' ? isMuted : prevParticipants[participantId].isVideoOff
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

    // Debug logging
    useEffect(() => {
        const debugInfo = getDebugInfo();
        console.log("Meeting component - Debug info:", debugInfo);
        console.log("Participants:", participants);
        console.log("Remote tracks:", remoteTracks);
    }, [participants, remoteTracks]);

    const RemoteParticipant = ({ participantId, tracks, participant }) => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const audioRef = useRef<HTMLAudioElement>(null);
        
        useEffect(() => {
            console.log(`Setting up remote participant ${participantId} with tracks:`, tracks);
            
            if (!tracks || !tracks.length) {
                console.log(`No tracks for participant ${participantId}`);
                return;
            }
            
            const videoTrack = tracks.find(t => t && t.getType && t.getType() === 'video');
            const audioTrack = tracks.find(t => t && t.getType && t.getType() === 'audio');
            
            console.log(`Found video track: ${!!videoTrack}, audio track: ${!!audioTrack} for participant ${participantId}`);
            
            if (videoTrack && videoRef.current) {
                try {
                    console.log(`Attaching video track for participant ${participantId}`);
                    videoTrack.attach(videoRef.current);
                } catch (e) {
                    console.error(`Error attaching remote video track for participant ${participantId}:`, e);
                }
            }
            
            if (audioTrack && audioRef.current) {
                try {
                    console.log(`Attaching audio track for participant ${participantId}`);
                    audioTrack.attach(audioRef.current);
                } catch (e) {
                    console.error(`Error attaching remote audio track for participant ${participantId}:`, e);
                }
            }
            
            return () => {
                console.log(`Cleaning up tracks for participant ${participantId}`);
                
                if (videoTrack && videoRef.current) {
                    try {
                        videoTrack.detach(videoRef.current);
                    } catch (e) {
                        console.error(`Error detaching remote video track for participant ${participantId}:`, e);
                    }
                }
                
                if (audioTrack && audioRef.current) {
                    try {
                        audioTrack.detach(audioRef.current);
                    } catch (e) {
                        console.error(`Error detaching remote audio track for participant ${participantId}:`, e);
                    }
                }
            };
        }, [participantId, tracks]);

        return (
            <div className="flex flex-col bg-gray-800 rounded-lg overflow-hidden">
                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                    <audio ref={audioRef} autoPlay />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md flex items-center space-x-2">
                        <span className="text-white text-sm">
                            {participant?.displayName || 'Unknown'}
                        </span>
                        {participant?.isAudioMuted && (
                            <MicOff size={16} className="text-red-500" />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render loading state if Jitsi is not loaded yet
    if (!jitsiLoaded && !error) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-700">Loading video conference library...</p>
                </div>
            </div>
        );
    }

    // Create / Join meeting UI
    if (!isConnected) {
        return (
            <div className="max-w-5xl mx-auto p-6 mt-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="text-center space-y-4">
                        {page === "create" ? (
                            <h1 className="text-5xl font-light">Create Meeting</h1>
                        ) : (
                            <h1 className="text-5xl font-light">Join Meeting</h1>
                        )}  
                        <p className="text-xl text-primary-400 max-w-2xl mx-auto">
                            Experience premium video conferencing with crystal-clear quality and automatic local recording.
                            Perfect for professional meetings, webinars, and team collaborations.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Media Preview */}
                        <div className="space-y-6">
                            <div className="relative aspect-video bg-primary-900/50 rounded-xl overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Camera Device" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>{localVideoRef.current ? 'Local Video' : 'No Video Available'}</SelectLabel>
                                                {cameras.map(camera => (
                                                    <SelectItem key={camera.deviceId} value={camera.deviceId || `camera-${Math.random()}`}>
                                                        {camera.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                    <Select>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Microphone Device" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>{localVideoRef.current ? 'Local Audio' : 'No Audio Available'}</SelectLabel>
                                                {microphones.map(mic => (
                                                    <SelectItem key={mic.deviceId} value={mic.deviceId || `mic-${Math.random()}`}>
                                                        {mic.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Meeting Setup Form */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                {page === "create" ? (
                                    <label className="text-sm text-primary-400">Room Name</label>
                                ) : (
                                    <label className="text-sm text-primary-400">Room Id</label>
                                )}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={page === "create" ? roomName : roomId}
                                        onChange={(e) => {
                                            if (page === "create") {
                                                setRoomName(e.target.value)
                                            } else {
                                                setRoomId(e.target.value)
                                            }
                                        }}
                                        placeholder="team-sync-room"
                                        className="input-field"
                                    />
                                    <Users className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {page === "create" ? (
                                    <label className="text-sm text-primary-400">Room Password (Optional)</label>
                                ) : (
                                    <label className="text-sm text-primary-400">Room Password (If You are not added as a participant)</label>
                                )}
                                <div className="relative">
                                    <input
                                    type="password"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="Set a password to lock the room"
                                    className="input-field"
                                    />
                                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                                </div>
                            </div>
                            
                            {page === "create" && 
                                <div className="space-y-4">
                                    <label className="text-sm text-primary-400">Invite Participants</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter email address"
                                                className="input-field"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
                                            />
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-400" />
                                        </div>
                                        <button
                                            onClick={handleAddParticipant}
                                            disabled={!email.includes('@')}
                                            className="bg-white text-gray-800 font-normal py-2 px-4 shadow-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {joinees.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm text-primary-400">Participants ({joinees.length})</p>
                                            <div className="space-y-2">
                                                {joinees.map((participant) => (
                                                    <motion.div
                                                        key={participant.email}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="flex items-center justify-between p-3 bg-primary-900/50 rounded-xl"
                                                    >
                                                        <span className="text-sm">{participant.email}</span>
                                                        <button
                                                        onClick={() => handleRemoveParticipant(participant.email)}
                                                        className="p-1 hover:bg-primary-800 rounded-full"
                                                        >
                                                        <X className="h-4 w-4" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                    {error}
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                    if (page === "create") {
                                        await CreateMeet();
                                    } else {
                                        await JoinMeet();
                                    }
                                }}
                                disabled={page === "create" ? !roomName : !roomId}
                                className="w-full bg-white text-gray-800 font-normal py-3 px-4 rounded-xl shadow-md hover:bg-gray-100 transition duration-200 cursor-pointer"
                            >
                                {page === "create" ? "Create Meeting" : "Join Meeting"}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (localTracks.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-700">Setting up local tracks...</p>
                </div>
            </div>
        );
    }
    const localParticipant = {
        id: "local",
        name: displayName,
        isScreenSharing: false,
        isMuted: false,
        isVideoOff: false,
        stream: null,
        screenStream: null,
        tracks: localTracks ?? "Nothing",
    };

    // Main conference view
    return (
            <VideoChat participants={participants} toggleMute={toggleAudio} toggleVideo={toggleVideo} toggleScreenShare={toggleScreenShare} localParticipant={localParticipant} leaveConfrence={leaveConference} screenShareRef={screenshareTrackRef} />
        // <div className="flex flex-col h-screen bg-gray-900">
        //     <header className="bg-gray-800 shadow px-4 py-2">
        //         <div className="flex justify-between items-center">
        //             <h1 className="text-xl font-semibold text-white">Room: {roomName}</h1>
        //             <div className="flex items-center space-x-2">
        //                 <span className="text-sm text-gray-300">
        //                     Participants: {Object.keys(participants).length + 1}
        //                 </span>
        //                 <Users size={16} className="text-gray-300" />
        //             </div>
        //         </div>
        //     </header>
            
        //     <div className="flex-grow p-4 overflow-y-auto">
        //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        //             {/* Local video */}
        //             <div className="flex flex-col bg-gray-800 rounded-lg overflow-hidden">
        //                 <div className="relative">
        //                     <video
        //                         ref={localVideoRef}
        //                         autoPlay
        //                         playsInline
        //                         muted
        //                         className="w-full h-full object-cover"
        //                     />
                            
        //                         <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md flex items-center space-x-2">
        //                         <span className="text-white text-sm">
        //                             {displayName} (You)
        //                         </span>
        //                         {isMuted && (
        //                             <MicOff size={16} className="text-red-500" />
        //                         )}
        //                     </div>
        //                 </div>
        //             </div>
                
        //             {/* Remote participants */}
        //             {Object.keys(participants).map(participantId => (
        //                 <RemoteParticipant
        //                     key={participantId}
        //                     participantId={participantId}
        //                     tracks={remoteTracks[participantId] || []}
        //                     participant={participants[participantId]}
        //                 />
        //             ))}
        //         </div>
        //     </div>
            
        //     <div className="bg-gray-800 py-3 px-4">
        //         <div className="flex justify-center space-x-4">
        //             <button 
        //                 onClick={toggleAudio}
        //                 className={`flex flex-col items-center justify-center p-2 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        //                 title={isMuted ? "Unmute" : "Mute"}
        //             >
        //                 {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        //             </button>
                    
        //             <button 
        //                 onClick={toggleVideo}
        //                 className={`flex flex-col items-center justify-center p-2 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        //                 title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
        //                 >
        //                 {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        //             </button>
                    
        //             <button 
        //                 onClick={toggleScreenShare}
        //                 className={`flex flex-col items-center justify-center p-2 rounded-full ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
        //                 title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
        //             >
        //                 <Monitor size={20} />
        //             </button>
                    
        //             <button 
        //                 onClick={leaveConference}
        //                 className="flex flex-col items-center justify-center p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
        //                 title="Leave Conference"
        //             >
        //                 <PhoneOff size={20} />
        //             </button>
        //         </div>
        //     </div>
        // </div>
    );
}
export default Meeting;