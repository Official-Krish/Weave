import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
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
  resetMediaState,
  removeLocalTrack,
  setAudioTrack,
  setSccreenShareTracks,
  setRemoteScreenShares,
} from '../utils/slices/mediaSlice';
import {
  setConnecting,
  setConnected,
  setRoomName,
  setDisplayName,
  setError,
  setJitsiLoaded,
  resetMeetingState,
  setIsEnded,
} from '../utils/slices/meetingSlice';
import {
  addParticipant,
  removeParticipant,
  updateParticipant,
  resetParticipantsState,
} from '../utils/slices/participantsSlice';
import { BACKEND_URL, JITSI_URL, WORKER_URL, WS_RELAY_URL } from '../config';
import { setActiveScreenShareId, setLayout } from '../utils/slices/videoChatSlice';
import { setIsRecording } from '../utils/slices/mediaSlice';
import { toast } from 'sonner';

export const useJitsi = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isRecording } = useSelector((state: RootState) => state.media);
  
    // Select all state from Redux
    const {
      isScreenSharing,
      localTracks,
      remoteTracks,
    } = useSelector((state: RootState) => state.media);

    const { activeScreenShareId } = useSelector((state: RootState) => ({
      activeScreenShareId: state.videoChat.activeScreenShareId,
    }));
    
    const {
      isConnecting,
      isConnected,
      roomName,
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


    // Recording State
    const recordingIntervalRef = useRef(null);
    const currentRecorderRef = useRef(null);
    const currentStreamRef = useRef(null);

    const wsRef = useRef<WebSocket | null>(null);
    const ws = new WebSocket(WS_RELAY_URL);

    useEffect(() => {
      if (!roomId) return;
  
      const setupWebSocket = () => {
        wsRef.current = ws;
  
        ws.onopen = () => {
          console.log('WebSocket connected');
          ws.send(JSON.stringify({
            type: 'join-room',
            roomId,
            displayName: email || 'Anonymous'
          }));
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'joined-room') {
            console.log(`Joined room: ${data.roomId}`);
            toast(`${data.displayName} joined the meeting`, {
              duration: 3000,
            })
          } else if (data.type === 'recording-state') {
            console.log(`Recording state for room ${data.roomId}: ${data.isRecording}`);
            dispatch(setIsRecording(data.isRecording));
            if (data.isRecording) {
              startRecording(false);
            } else {
              stopRecording(false);
            }
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          ws.send(JSON.stringify({
            type: 'leave-room',
            roomId,
          }));
          console.log('WebSocket disconnected');
        };
  
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          wsRef.current = null;
          setTimeout(() => {
            console.log('Reconnecting WebSocket...');
            setupWebSocket();
          }, 5000); 
        };
      }
      setupWebSocket();
      return () => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          console.log('Closing WebSocket connection...');
          ws.close(1000, 'Component unmounting');
        }
        wsRef.current = null;
      };
    }, [roomId, email, dispatch]);

    

    const startRecording = async (isHost: boolean) => {
      if (!isConnected || !roomId) {
        console.log('Cannot start recording: not connected or no roomId');
        return;
      }

      if(isHost && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'recording-state',
          roomId,
          isRecording: true
        }));
      }

      try {
        console.log('Starting periodic recording...');
        // Start first recording immediately
        await recordAndUpload();
        
        recordingIntervalRef.current = setInterval(async () => {
          await recordAndUpload();
        }, 60 * 1000); // 60 seconds
        dispatch(setIsRecording(true));
        console.log('Periodic recording started successfully');
      } catch (error) {
        console.error('Failed to start recording:', error);
        dispatch(setError('Failed to start recording'));
      }
    };


    const recordAndUpload = async () => {
      try {
        console.log('Starting new recording chunk...');
        
        // Stop any existing recording
        if (currentRecorderRef.current && currentRecorderRef.current.state === 'recording') {
          currentRecorderRef.current.stop();
        }

        // Stop existing stream
        if (currentStreamRef.current) {
          currentStreamRef.current.getTracks().forEach(track => track.stop());
        }

        // Get fresh media stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1920 }, 
            height: { ideal: 1080 },
            frameRate: { ideal: 60 }
          }, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        currentStreamRef.current = stream;
        
        // Create new recorder
        const recorder = new MediaRecorder(stream, {
          mimeType: getSupportedMimeType()
        });
        
        currentRecorderRef.current = recorder;
        const chunks = [];

        // Set up event handlers
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          console.log('Recording chunk stopped, processing...');
          
          try {
            // Create blob from chunks
            const blob = new Blob(chunks, { 
              type: recorder.mimeType || 'video/webm' 
            });
            
            // Stop all tracks to free up camera/mic
            if (currentStreamRef.current) {
              currentStreamRef.current.getTracks().forEach(track => track.stop());
              currentStreamRef.current = null;
            }
            
            // Upload the recording
            await uploadRecording(blob);
          } catch (error) {
            console.error('Error processing recording chunk:', error);
          }
        };

        recorder.onerror = (event) => {
          console.error('Recording error:', event);
        };

        // Start recording
        recorder.start();
        
        // Record for 30 seconds (you can adjust this duration)
        setTimeout(() => {
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }, 60000); // 60 seconds recording duration

      } catch (error) {
        console.error('Error during recording:', error);
        // Don't show error to user for individual chunk failures
      }
    };

    const uploadRecording = async (blob) => {
      try {
        console.log(`Uploading recording chunk (${(blob.size / 1024 / 1024).toFixed(2)} MB)...`);
        
        // Create FormData for file upload
        const formData = new FormData();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `chunk_${timestamp}.webm`;
        
        formData.append('video', blob, filename);
        formData.append('meetingId', roomId);
        
        // Get auth token
        const token = localStorage.getItem('token');
        
        // Upload via axios
        const response = await axios.post(`${WORKER_URL}/api/v1/upload-chunk`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token
          },
          timeout: 60000, // 60 second timeout
        });
        
        console.log('Upload successful:', response.data);
        
      } catch (error) {
        console.error('Upload failed:', error);
        
        // Could implement retry logic here
        if (error.response?.status === 401) {
          dispatch(setError('Authentication failed. Please login again.'));
        } else if (error.response?.status === 404) {
          console.error('Meeting not found for recording upload');
        } else {
          console.error('Failed to upload recording chunk, will retry next cycle');
        }
      }
    };

    const getSupportedMimeType = () => {
      const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus', 
        'video/webm',
      ];
      
      for (let type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          return type;
        }
      }
      
      return 'video/webm';
    };

    const stopRecording = (isHost: boolean) => {
      console.log('Stopping recording...');

      if (isHost && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'recording-state',
          roomId,
          isRecording: false
        }));
      }
      
      // Clear interval
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
      
      // Stop current recording if active
      if (currentRecorderRef.current && currentRecorderRef.current.state === 'recording') {
        currentRecorderRef.current.stop();
      }
      
      // Stop current stream
      if (currentStreamRef.current) {
        currentStreamRef.current.getTracks().forEach(track => track.stop());
        currentStreamRef.current = null;
      }
      
      dispatch(setIsRecording(false));
      console.log('Recording stopped');
    };

    // Cleanup recording on unmount or component cleanup
    useEffect(() => {
      return () => {
        stopRecording(false);
      };
    }, []);
  
  
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
            dispatch(setLayout('grid')); 
            dispatch(setSccreenShareTracks(null));
            dispatch(setActiveScreenShareId(null)); 

            const localParticipantId = conferenceRef.current?.myUserId();
            if (localParticipantId) {
              dispatch(setRemoteScreenShares( localParticipantId, null ));
            }
          } catch (e) {
            console.error('Error stopping screen sharing:', e);
            dispatch(setError('Failed to stop screen sharing'));
          }
        }
      } else {
        try {
          const desktopTracks = await window.JitsiMeetJS.createLocalTracks({
            devices: ['desktop']
          });
          
          if (desktopTracks && desktopTracks.length > 0) {
            const videoTrack = desktopTracks.find(track => track.getType() === 'video');
            const audioTrack = desktopTracks.find(track => track.getType() === 'audio');
            
            if (videoTrack) {
              conferenceRef.current?.addTrack(videoTrack);
              screenshareTrackRef.current = videoTrack;
              
              if (audioTrack) {
                audioTrack.dispose();
              }
              
              dispatch(setSccreenShareTracks({ local: videoTrack }));
              dispatch(setActiveScreenShareId('local'));
            } else {
              throw new Error('No video track found in desktop capture');
            }
          } else {
            throw new Error('No tracks created for desktop capture');
          }
        } catch (error) {
          console.error('Screen sharing error:', error);
          
          if (error.message && error.message.includes('user_canceled')) {
            dispatch(setError('Screen sharing was cancelled'));
          } else if (error.message && error.message.includes('permission')) {
            dispatch(setError('Screen sharing permission denied'));
          } else {
            dispatch(setError('Screen sharing failed. Please try again.'));
          }
        }
      }
    };
  
    // Jitsi event handlers
    const onRemoteTrackAdded = (track: any) => {
      if (!track || track.isLocal()) {
        console.log('Local track added, ignoring');
        return;
      }
      
      console.log('Remote track added:', track);
      const participantId = track.getParticipantId();
      dispatch(addRemoteTrack({ participantId, track }));
      const currentParticipant = participants[participantId];
    
      const currentTracks = currentParticipant?.tracks || [];
    
      const trackExists = currentTracks.some(existingTrack => 
        existingTrack && existingTrack.getId && existingTrack.getId() === track.getId()
      );
      
      if (!trackExists) {
        // Check if this is a screen share track
        const isScreenShare = track.getVideoType && track.getVideoType() === 'desktop';
        
        dispatch(updateParticipant({
          id: participantId,
          changes: {
            tracks: [...currentTracks, track],
            isScreenSharing: track.getType() === 'video' ? isScreenShare : currentParticipant?.isScreenSharing,
            ...(track.getType() === 'audio' && { isMuted: track.isMuted() }),
            ...(track.getType() === 'video' && !isScreenShare && { isVideoOff: track.isMuted() })
          }
        }));
        
        console.log('Remote track added to participant:', { 
          participantId, 
          trackType: track.getType(), 
          trackId: track.getId(),
          isScreenShare,
          isMuted: track.isMuted()
        });
      }
    };
  
    const onRemoteTrackRemoved = (track: any) => {
      if (!track || track.isLocal()) return;
      
      const participantId = track.getParticipantId();
      const trackId = track.getId();
      const isScreenShare = track.getVideoType?.() === 'desktop';
    
      dispatch(removeRemoteTrack({ participantId, trackId }));
      
      if (isScreenShare) {
        dispatch(setRemoteScreenShares(participantId, null));
        
        if (activeScreenShareId === participantId) {
          dispatch(setActiveScreenShareId(null));
          dispatch(setLayout('grid'));
        }
      }
      
      const currentParticipant = participants[participantId];
      if (currentParticipant?.tracks) {
        const updatedTracks = currentParticipant.tracks.filter(t => 
          !t || !t.getId || t.getId() !== trackId
        );
        
        dispatch(updateParticipant({
          id: participantId,
          changes: {
            tracks: updatedTracks,
            isScreenSharing: isScreenShare ? false : currentParticipant.isScreenSharing
          }
        }));
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
          (track) => {
            onRemoteTrackAdded(track);
            
            if (track && 
                track.getType() === 'video' && 
                typeof track.getVideoType === 'function' && 
                track.getVideoType() === 'desktop') {
              const participantId = track.getParticipantId();
              console.log('Screen share track detected:', { participantId, track });
              dispatch(setRemoteScreenShares(participantId, track));
            }
          }
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
        );
        conference.on(
          window.JitsiMeetJS.events.conference.STARTRED_RECORDING,
          () => {
            console.log('Recording started');
            dispatch(setIsRecording(true));
          }
        );
        conference.on(
          window.JitsiMeetJS.events.conference.STOPPED_RECORDING,
          () => {
            console.log('Recording stopped');
            dispatch(setIsRecording(false));
          }
        );
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

    return { 
        connect,
        leaveConference,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        localVideoRef,
        videoRef,
        isConnecting,
        isConnected,
        roomName,
        roomId,
        passcode,
        error,
        jitsiLoaded,
        email,
        isEnded,
        participants,
        joinees,
        Duration,
        Participants,
        setIsRecording,
        startRecording,
        stopRecording,
        isRecording,
    }
  
};