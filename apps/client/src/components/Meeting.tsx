import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, Users, Mail, Lock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { VideoChat } from './Room/Main';
import { RootState, AppDispatch } from '../utils/store';
import { 
  setMute,
  setVideoTrack,
  setVideoOff,
  setLocalTracks,
  addLocalTrack,
  addRemoteTrack,
  removeRemoteTrack,
  setCameras,
  setMicrophones,
  selectCamera,
  selectMicrophone,
  resetMediaState,
  removeLocalTrack,
  setAudioTrack,
} from '../utils/slices/mediaSlice';
import {
  setConnecting,
  setConnected,
  setRoomName,
  setDisplayName,
  setRoomId,
  setPasscode,
  setError,
  setJitsiLoaded,
  setEmail,
  resetMeetingState,
  setIsEnded,
} from '../utils/slices/meetingSlice';
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
  addJoinee,
  removeJoinee,
  resetParticipantsState,
} from '../utils/slices/participantsSlice';
import { BACKEND_URL, JITSI_URL } from '../config';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { Link } from 'react-router-dom';
import { MeetingEnd } from './MeetingEnd';

const Meeting = ({ page }: { page: "create" | "join" }) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Select all state from Redux
  const {
    isMuted,
    isVideoOff,
    isScreenSharing,
    localTracks,
    remoteTracks,
    cameras,
    microphones,
  } = useSelector((state: RootState) => state.media);
  
  const {
    isConnecting,
    isConnected,
    roomName,
    displayName,
    roomId,
    passcode,
    error,
    jitsiLoaded,
    email,
    isEnded,
  } = useSelector((state: RootState) => state.meeting);
  
  const {
    participants,
    joinees,
  } = useSelector((state: RootState) => state.participants);

  const videoTrack = useSelector((state: RootState) => state.media.videoTrack);
  const selectedCamera = useSelector((state: RootState) => state.media.selectedCamera);
  const audioTrack = useSelector((state: RootState) => 
    state.media.localTracks.find(track => track?.getType?.() === 'audio')
  );
  const selectedMicrophone = useSelector((state: RootState) => state.media.selectedMicrophone);

  // Meeting End State
  const [Participants, setParticipants] = useState(0);
  const [Duration, setDuration] = useState("");


  // Refs
  const connectionRef = useRef<any>(null);
  const conferenceRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenshareTrackRef = useRef<any>(null);
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

  // Handle adding/removing participants
  const handleAddParticipant = () => {
    if (email && email.includes('@')) {
      dispatch(addJoinee({ email }));
      dispatch(setEmail(''));
    }
  };

  const handleRemoveParticipant = (emailToRemove: string) => {
    dispatch(removeJoinee(emailToRemove));
  };

  // Media control functions
  const toggleAudio = async () => {
    console.log('Toggling audio');
    
    // If we have an audio track, toggle its mute state
    if (audioTrack) {
      try {
        if (audioTrack.isMuted()) {
          await audioTrack.unmute();
          dispatch(setMute(false));
        } else {
          await audioTrack.mute();
          dispatch(setMute(true));
        }
        return;
      } catch (e) {
        console.error("Error toggling audio:", e);
        dispatch(setError('Failed to toggle audio'));
      }
    }
    
    // If no audio track exists, create one
    try {
      const tracks = await window.JitsiMeetJS.createLocalTracks({ 
        devices: ['audio'],
        micDeviceId: selectedMicrophone 
      });
      
      if (tracks && tracks.length > 0) {
        const newAudioTrack = tracks[0];
        dispatch(setAudioTrack(newAudioTrack));
        dispatch(addLocalTrack(newAudioTrack));
        
        if (conferenceRef.current) {
          conferenceRef.current.addTrack(newAudioTrack);
        }
        
        // Start unmuted by default
        await newAudioTrack.unmute();
        dispatch(setMute(false));
      }
    } catch (error) {
      console.error("Failed to create audio track:", error);
      dispatch(setError('Failed to access microphone. Please check permissions.'));
    }
  };

  const toggleVideo = async () => {
    console.log('Toggling video');
    
    if (videoTrack) {
      try {
        if (videoTrack.isMuted()) {
          videoTrack.unmute();
          dispatch(setVideoOff(false));
        } else {
          videoTrack.mute();
          dispatch(setVideoOff(true));
        }
      } catch (e) {
        console.error("Error toggling video:", e);
        // If there's an error, the track might be disposed, recreate it
        await createVideoTrack();
      }
    } else {
      // Track doesn't exist, create it
      await createVideoTrack();
    }
  };

  const createVideoTrack = async () => {
    try {
      // First, remove and dispose the old video track
      if (videoTrack) {
        // Remove from conference if connected
        if (conferenceRef.current) {
          conferenceRef.current.removeTrack(videoTrack);
        }
        
        // Remove from local tracks in Redux
        const oldTrackId = videoTrack.getId();
        dispatch(removeLocalTrack(oldTrackId));
        
        // Dispose the old track
        videoTrack.dispose();
      }
      
      const tracks = await window.JitsiMeetJS.createLocalTracks({
        devices: ['video', 'audio'],
        cameraDeviceId: selectedCamera,
        micDeviceId: selectedMicrophone
      });
      
      if (tracks && tracks.length > 0) {
        const newVideoTrack = tracks[0];
        
        // Update Redux state with new track
        dispatch(setVideoTrack(newVideoTrack));
        dispatch(addLocalTrack(newVideoTrack));
        
        // Add to conference if connected
        if (conferenceRef.current) {
          conferenceRef.current.addTrack(newVideoTrack);
        }
        
        // Attach to preview video (setup phase)
        if (videoRef.current && !isConnected) {
          newVideoTrack.attach(videoRef.current);
        }
        
        dispatch(setVideoOff(false));
      }
    } catch (error) {
      console.error("Error creating video track:", error);
      dispatch(setError('Failed to create video track'));
    }
  }

  const toggleScreenShare = async () => {
    if (!window.JitsiMeetJS) {
      dispatch(setError('JitsiMeetJS is not available'));
      return;
    }
    
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenshareTrackRef.current) {
        try {
          conferenceRef.current?.removeTrack(screenshareTrackRef.current);
          screenshareTrackRef.current.dispose();
          screenshareTrackRef.current = null;
          dispatch(toggleScreenShare);
        } catch (e) {
          console.error('Error stopping screen sharing:', e);
          dispatch(setError('Failed to stop screen sharing'));
        }
      }
    } else {
      try {
        const desktopTrack = await window.JitsiMeetJS.createLocalTracks({
          devices: ['desktop']
        });
        
        if (desktopTrack?.[0]) {
          conferenceRef.current?.addTrack(desktopTrack[0]);
          screenshareTrackRef.current = desktopTrack[0];
          dispatch(toggleScreenShare);
        }
      } catch (error) {
        console.error('Screen sharing error:', error);
        dispatch(setError('Screen sharing failed'));
      }
    }
  };

  // Jitsi event handlers
  const onRemoteTrackAdded =  (track: any) => {
    if (!track || track.isLocal()){
        console.log('Local track added, ignoring');
        return;
    }
    console.log('Remote track added:', track);
    const participantId = track.getParticipantId();
    dispatch(addRemoteTrack({ participantId, track }));
    const currentParticipant = participants[participantId];

    const currentTracks = currentParticipant?.tracks || [];
  
    // Check if this track already exists (avoid duplicates)
    const trackExists = currentTracks.some(existingTrack => 
      existingTrack && existingTrack.getId && existingTrack.getId() === track.getId()
    );
    
    if (!trackExists) {
      // Update participant with new track
      dispatch(updateParticipant({
        id: participantId,
        changes: {
          tracks: [...currentTracks, track],
          // Update mute states based on track type and state
          ...(track.getType() === 'audio' && { isMuted: track.isMuted() }),
          ...(track.getType() === 'video' && { isVideoOff: track.isMuted() })
        }
      }));
      
      console.log('Remote track added to participant:', { 
        participantId, 
        trackType: track.getType(), 
        trackId: track.getId(),
        isMuted: track.isMuted()
      });
    } else {
      console.log('Track already exists for participant:', participantId);
    }
  };

  const onRemoteTrackRemoved = (track: any) => {
    if (!track || track.isLocal()) return;
    const participantId = track.getParticipantId();
    const trackId = track.getId();

    dispatch(removeRemoteTrack({ participantId, trackId: trackId }));
    const currentParticipant = participants[participantId];
    if (currentParticipant && currentParticipant.tracks) {
      const updatedTracks = currentParticipant.tracks.filter(t => 
        !t || !t.getId || t.getId() !== trackId
      );
      
      dispatch(updateParticipant({
        id: participantId,
        changes: {
          tracks: updatedTracks
        }
      }));
      
      console.log('Remote track removed from participant:', { participantId, trackId });
    }

  };

  const onUserJoined = (id: string, user: any) => {
    console.log("user joines with tracks", remoteTracks[id])
    dispatch(addParticipant({
      id,
      name: user.getDisplayName() || 'Unnamed',
      isMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      tracks: [],
    }));
  };

  const onUserLeft = (id: string) => {
    dispatch(removeParticipant(id));
  };

  const onTrackMuteChanged = (track: any) => {
    if (!track) return;
    
    const participantId = track.getParticipantId();
    const trackType = track.getType();
    const isMuted = track.isMuted();
    
    if (track.isLocal()) {
      if (trackType === 'audio') {
        dispatch(setMute(isMuted));
      } else if (trackType === 'video') {
        dispatch(setVideoOff(isMuted));
      }
    } else {
      dispatch(updateParticipant({
        id: participantId,
        changes: {
          isMuted: trackType === 'audio' ? isMuted : undefined,
          isVideoOff: trackType === 'video' ? isMuted : undefined,
        }
      }));
    }
  };

  const onDisplayNameChanged = (id: string, displayName: string) => {
    dispatch(updateParticipant({
      id,
      changes: {
        name: displayName || 'Unnamed Participant'
      }
    }));
  };

  // Device management
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput').map(({ deviceId, label, kind, groupId }) => ({ deviceId, label, kind, groupId }));
        const audioDevices = devices.filter(device => device.kind === 'audioinput').map(({ deviceId, label, kind, groupId }) => ({ deviceId, label, kind, groupId }));        ;
        
        dispatch(setCameras(videoDevices));
        dispatch(setMicrophones(audioDevices));
      } catch (error) {
        console.error('Error fetching devices:', error);
      }
    };

    fetchDevices();
  }, [dispatch]);

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
      dispatch(setError('Failed to load Jitsi Meet library. Please refresh and try again.'));
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
      dispatch(setError('JitsiMeetJS failed to load properly'));
      return;
    }

    try {
      window.JitsiMeetJS.init({
        disableAudioLevels: true,
        disableSimulcast: false,
      });
      window.JitsiMeetJS.setLogLevel(window.JitsiMeetJS.logLevels.ERROR);
      dispatch(setJitsiLoaded(true));
      console.log('JitsiMeetJS initialized successfully');
    } catch (e) {
      console.error('JitsiMeetJS initialization error:', e);
      dispatch(setError(`Failed to initialize Jitsi: ${e instanceof Error ? e.message : 'Unknown error'}`));
    }
  };

  // Create a new meeting
  const CreateMeet = async () => {
    try {
      dispatch(setConnecting(true));
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
        dispatch(setPasscode(response.data.passcode));
        dispatch(setRoomId(response.data.id));
        await connect(response.data.id, response.data.name);
        window.history.pushState(null, '', `/meeting/${response.data.id}`);
      } else {
        console.error('Error creating meeting:', response.data);
        dispatch(setError('Failed to create meeting. Please try again.'));
      }
    } catch (error) {
      console.error('Error creating meeting:', error);
      dispatch(setError('Failed to create meeting. Please try again.'));
    } finally {
      dispatch(setConnecting(false));
    }
  };

  // Join an existing meeting
  const JoinMeet = async () => {
    try {
      dispatch(setConnecting(true));
      const response = await axios.post(`${BACKEND_URL}/meeting/join/${roomId}`, {
        passcode
      }, {
        headers: {
          "Authorization": `${localStorage.getItem('token')}`
        }
      });
      
      if (response.status === 200) {
        dispatch(setPasscode(response.data.passcode));
        await connect(response.data.id, response.data.name);
        window.history.pushState(null, '', `/meeting/${response.data.id}`);
      } else {
        console.error('Error joining meeting:', response.data);
        dispatch(setError('Failed to join meeting. Please try again.'));
      }
    } catch (error) {
      console.error('Error joining meeting:', error);
      dispatch(setError('Failed to join meeting. Please try again.'));
    } finally {
      dispatch(setConnecting(false));
    }
  };

  const connect = async (roomNameParam: string, displayNameParam: string) => {
    if (!roomNameParam || !displayNameParam) {
      dispatch(setError('Room name and display name are required'));
      return;
    }
    
    if (!window.JitsiMeetJS) {
      dispatch(setError('Jitsi Meet library is not loaded yet. Please wait or refresh the page.'));
      return;
    }
    
    dispatch(setConnecting(true));
    dispatch(setError(''));
    dispatch(setRoomName(roomNameParam));
    dispatch(setDisplayName(displayNameParam));
    
    try {
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
      
      connection.connect();
    } catch (error) {
      console.error('Connection error:', error);
      dispatch(setError(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`));
      dispatch(setConnecting(false));
    }
  };

  const onConnectionSuccess = async (roomNameParam: string, displayNameParam: string) => {
    try {
      if (!connectionRef.current) {
        throw new Error('No connection established');
      }

      dispatch(setConnected(true));
      
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
      conference.on(
        window.JitsiMeetJS.events.conference.END_CONFERENCE,
        onConferenceEnded
      )
      
      // Create local tracks
      try {
        const tracks = await window.JitsiMeetJS.createLocalTracks({
          devices: ['audio', 'video'],
          cameraDeviceId: selectedCamera,
          micDeviceId: selectedMicrophone
        }, 5000);
        
        tracks.forEach(track => {
          conference.addTrack(track);
            if (track.getType() === 'video') {
                dispatch(setVideoTrack(track)); // Store the video track reference
            }
            if (track.getType() === 'audio') {
                dispatch(setAudioTrack(track)); // Store the audio track reference
                try {
                  track.unmute();
                } catch (e) {
                  console.error('Error unmuting audio:', e);
                }
                dispatch(setMute(false));
            }
        });
        
        dispatch(setLocalTracks(tracks));
      } catch (tracksError) {
        console.error('Error creating local tracks:', tracksError);
        dispatch(setError(`Camera/microphone error: ${tracksError instanceof Error ? tracksError.message : 'Permission denied or device unavailable'}`));
      }
      
      conference.setDisplayName(displayNameParam);
      conference.join();
    } catch (error) {
      console.error('Conference error:', error);
      dispatch(setError(`Error joining conference: ${error instanceof Error ? error.message : 'Unknown error'}`));
      dispatch(setConnecting(false));
      cleanup();
    }
  };

  const onConnectionFailed = (error: any) => {
    console.error('Connection failed:', error);
    dispatch(setError(`Connection to server failed: ${error || 'Unknown error'}`));
    dispatch(setConnecting(false));
  };

  const onDisconnected = () => {
    dispatch(setConnected(false));
    dispatch(resetParticipantsState());
  };

  const onConferenceJoined = () => {
    dispatch(setConnecting(false));
  };

  const onConferenceEnded = () => {
    dispatch(setConnected(false));
    if (connectionRef.current) {
      connectionRef.current.disconnect();
      connectionRef.current = null;
    }
  };

  // Add local video to DOM when local tracks change
  useEffect(() => {
    const videoTrack = localTracks.find(track => track?.getType?.() === 'video');
    
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

  // Cleanup function
  const cleanup = () => {
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
  
    // Reset all state
    dispatch(resetMediaState());
    dispatch(resetMeetingState());
    dispatch(resetParticipantsState());
  };

  // Cleanup function on component unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  // Leave the conference
  const leaveConference = async () => {
    const res = await axios.post(`${BACKEND_URL}/meeting/end/${roomId}`,{}, {
      headers: {
        "Authorization": `${localStorage.getItem('token')}`
      }
    });
    setParticipants(res.data.participants);
    setDuration(res.data.duration);

    dispatch(setIsEnded(true));

    if (res.status === 200) {
      conferenceRef.current?.end();
      console.log('Meeting ended successfully');
    }
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
              Experience premium video conferencing with crystal-clear quality.
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
                  <Select
                    value={selectedCamera || ''}
                    onValueChange={(value) => dispatch(selectCamera(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Camera" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Cameras</SelectLabel>
                        {cameras.map(camera => (
                          <SelectItem key={camera.deviceId || "1"} value={camera.deviceId || "2"}>
                            {camera.label || `Camera ${camera.deviceId.slice(0, 5)}`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedMicrophone || ''}
                    onValueChange={async (value) => {
                      dispatch(selectMicrophone(value));
                      
                      // Recreate audio track with new device
                      if (conferenceRef.current && audioTrack) {
                        try {
                          // Remove old track
                          conferenceRef.current.removeTrack(audioTrack);
                          audioTrack.dispose();
                          
                          // Create new track
                          const tracks = await window.JitsiMeetJS.createLocalTracks({
                            devices: ['audio'],
                            micDeviceId: value
                          });
                          
                          if (tracks && tracks.length > 0) {
                            const newAudioTrack = tracks[0];
                            conferenceRef.current.addTrack(newAudioTrack);
                            dispatch(setAudioTrack(newAudioTrack));
                            dispatch(addLocalTrack(newAudioTrack));
                          }
                        } catch (error) {
                          console.error('Error switching microphone:', error);
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Microphone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Microphones</SelectLabel>
                        {microphones.map(mic => (
                          <SelectItem key={mic.deviceId || "1"} value={mic.deviceId || "2"}>
                            {mic.label || `Mic ${mic.deviceId.slice(0, 5)}`}
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
                        dispatch(setRoomName(e.target.value));
                      } else {
                        dispatch(setRoomId(e.target.value));
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
                    onChange={(e) => dispatch(setPasscode(e.target.value))}
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
                        onChange={(e) => dispatch(setEmail(e.target.value))}
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
                {isConnecting ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></span>
                    {page === "create" ? "Creating..." : "Joining..."}
                  </span>
                ) : (
                  page === "create" ? "Create Meeting" : "Join Meeting"
                )}
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

  if (isEnded) {
    return (
      <MeetingEnd Duration={Duration} Participants={Participants} MeetingId={roomId} />
    );
  }

  // Main conference view
  return (
    <VideoChat leaveConference={leaveConference} screenShareRef={screenshareTrackRef} toggleMute={toggleAudio} toggleVideo={toggleVideo} toggleScreenShare={toggleScreenShare} meetingId={roomId} passcode={passcode} toggleAudio={toggleAudio}/>
  );
};

export default Meeting;