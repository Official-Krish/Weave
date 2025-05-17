import { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users } from 'lucide-react';
import { Input } from './ui/input';
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

const Meeting = (page: "Join" | "Create") => {
    const [isConnecting, setIsConnecting] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [roomName, setRoomName] = useState<string>('');
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

    // Initialize JitsiMeetJS on component mount
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

    const connect = async (roomName: string, displayName: string) => {
        setDisplayName(displayName);
        setRoomName(roomName);
        if (!roomName || !displayName) {
            setError('Room name and display name are required');
            return;
        }
        
        if (!jitsiLoaded || !window.JitsiMeetJS) {
            setError('Jitsi Meet library is not loaded yet. Please wait or refresh the page.');
            return;
        }
        
        setIsConnecting(true);
        setError('');
        
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
                onConnectionSuccess
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

    const onConnectionSuccess = async () => {
        console.log('Connection established successfully!');
        
        try {
            if (!connectionRef.current) {
                throw new Error('No connection established');
            }

            setIsConnected(true);
            
            console.log('Initializing conference for room:', roomName);
            const conference = connectionRef.current.initJitsiConference(roomName, {
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
                
                tracks.forEach(track => {
                    console.log(`Adding ${track.getType()} track to conference`);
                    conference.addTrack(track);
                });
                
                setLocalTracks(tracks);
                } catch (tracksError) {
                console.error('Error creating local tracks:', tracksError);
                setError(`Camera/microphone error: ${tracksError instanceof Error ? tracksError.message : 'Permission denied or device unavailable'}`);
            }
            
            // Set display name and join the conference
            conference.setDisplayName(displayName);
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
    const onConnectionFailed = (error) => {
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
    const onRemoteTrackAdded = (track) => {
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
    const onRemoteTrackRemoved = (track) => {
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
    const onUserJoined = (id, user) => {
        console.log(`User joined: ${id}, name: ${user.getDisplayName() || 'Unnamed'}`);
        setParticipants(prevParticipants => ({
            ...prevParticipants,
            [id]: {
            id,
            displayName: user.getDisplayName() || 'Unnamed Participant',
            isAudioMuted: true,
            isVideoMuted: true
            }
        }));
    };
    
        // Handler for user leaving
    const onUserLeft = (id) => {
        console.log(`User left: ${id}`);
        setParticipants(prevParticipants => {
            const newParticipants = { ...prevParticipants };
            delete newParticipants[id];
            return newParticipants;
        });
    };

    // Handler for track mute status changes
    const onTrackMuteChanged = (track) => {
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
    const onDisplayNameChanged = (id, displayName) => {
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
            if (audioTrack.isMuted()) {
            audioTrack.unmute();
            } else {
            audioTrack.mute();
            }
        } else {
            console.warn('No audio track found to toggle');
        }
    };

        // Toggle video mute status
    const toggleVideo = () => {
        const videoTrack = localTracks.find(track => track && track.getType && track.getType() === 'video');
        
        if (videoTrack) {
            console.log(`${videoTrack.isMuted() ? 'Unmuting' : 'Muting'} video`);
            if (videoTrack.isMuted()) {
            videoTrack.unmute();
            } else {
            videoTrack.mute();
            }
        } else {
            console.warn('No video track found to toggle');
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

    const RemoteParticipant = ({ tracks, participant }) => {
        const videoRef = useRef<HTMLVideoElement>(null);
        const audioRef = useRef<HTMLAudioElement>(null);
        
        useEffect(() => {
        // Check if tracks exist before trying to find video/audio
        if (!tracks || !tracks.length) return;
        
        const videoTrack = tracks.find(t => t && t.getType && t.getType() === 'video');
        const audioTrack = tracks.find(t => t && t.getType && t.getType() === 'audio');
        
        if (videoTrack && videoRef.current) {
            try {
                videoTrack.attach(videoRef.current);
            } catch (e) {
                console.error('Error attaching remote video track:', e);
            }
        }
        
        if (audioTrack && audioRef.current) {
            try {
            audioTrack.attach(audioRef.current);
            } catch (e) {
            console.error('Error attaching remote audio track:', e);
            }
        }
        
        return () => {
            if (videoTrack && videoRef.current) {
                try {
                    videoTrack.detach(videoRef.current);
                } catch (e) {
                    console.error('Error detaching remote video track:', e);
                }
            }
            
            if (audioTrack && audioRef.current) {
                try {
                    audioTrack.detach(audioRef.current);
                } catch (e) {
                    console.error('Error detaching remote audio track:', e);
                }
            }
        };
        }, [tracks]);

        return (
            <div className="flex flex-col bg-gray-800 rounded-lg overflow-hidden">
                <div className="relative">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                    />
                    <audio ref={audioRef} autoPlay />
                    
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md flex items-center space-x-2">
                        <span className="text-white text-sm truncate max-w-xs">
                            {participant?.displayName || 'Unnamed Participant'}
                        </span>
                        {participant?.isAudioMuted && (
                            <MicOff size={16} className="text-red-500" />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Render loading indicator while Jitsi loads
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

    // Render login screen if not yet connected
    if (!isConnected) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900">Video Conference</h2>
                        <p className="mt-2 text-sm text-gray-600">Enter details to join a conference</p>
                    </div>
                    
                    <div className="mt-8 space-y-6">
                        <div className="rounded-md shadow-sm space-y-4">
                            <div>
                                <label htmlFor="room-name" className="block text-sm font-medium text-gray-700 mb-1">Room Name</label>
                                <Input
                                    id="roomName"
                                    name="roomName"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Room Name"
                                    value={roomName}
                                    onChange={e => setRoomName(e.target.value)}
                                    disabled={isConnecting}
                                />
                            </div>
                        
                            <div className='text-black'>
                                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                <input
                                    id="displayName"
                                    name="displayName"
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Your Name"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    disabled={isConnecting}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isConnecting || !roomName || !displayName || !jitsiLoaded}
                                onClick={() => {
                                    if (!roomName || !displayName) {
                                        alert('Please enter both room name and your name.');
                                        return;
                                    }
                                    connect(roomName, displayName);
                                }}
                                >
                                {isConnecting ? (
                                    <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connecting...
                                    </>
                                ) : (
                                    'Join Conference'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main conference view
    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <header className="bg-gray-800 shadow px-4 py-2">
                <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-white">Room: {roomName}</h1>
                    <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                        Participants: {Object.keys(participants).length + 1}
                    </span>
                    <Users size={16} className="text-gray-300" />
                    </div>
                </div>
            </header>
            
            <div className="flex-grow p-4 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Local video */}
                    <div className="flex flex-col bg-gray-800 rounded-lg overflow-hidden">
                        <div className="relative">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover"
                            />
                            
                                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded-md flex items-center space-x-2">
                                <span className="text-white text-sm">
                                    {displayName} (You)
                                </span>
                                {isMuted && (
                                    <MicOff size={16} className="text-red-500" />
                                )}
                            </div>
                        </div>
                    </div>
                
                    {/* Remote participants */}
                    {Object.keys(participants).map(participantId => (
                        <RemoteParticipant
                            key={participantId}
                            tracks={remoteTracks[participantId]}
                            participant={participants[participantId]}
                        />
                    ))}
                </div>
            </div>
            
            <div className="bg-gray-800 py-3 px-4">
                <div className="flex justify-center space-x-4">
                    <button 
                        onClick={toggleAudio}
                        className={`flex flex-col items-center justify-center p-2 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button 
                        onClick={toggleVideo}
                        className={`flex flex-col items-center justify-center p-2 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                        >
                        {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                    
                    <button 
                        onClick={toggleScreenShare}
                        className={`flex flex-col items-center justify-center p-2 rounded-full ${isScreenSharing ? 'bg-green-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                        title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                    >
                        <Monitor size={20} />
                    </button>
                    
                    <button 
                        onClick={leaveConference}
                        className="flex flex-col items-center justify-center p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                        title="Leave Conference"
                    >
                        <PhoneOff size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
export default Meeting;