import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Mail, Lock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { VideoChat } from './Room/Main';
import { RootState, AppDispatch } from '../utils/store';
import { 
  addLocalTrack,
  selectCamera,
  selectMicrophone,
  setAudioTrack,
} from '../utils/slices/mediaSlice';
import {
  setConnecting,
  setRoomName,
  setRoomId,
  setPasscode,
  setError,
  setEmail,
} from '../utils/slices/meetingSlice';
import {
  addJoinee,
  removeJoinee,
} from '../utils/slices/participantsSlice';
import { BACKEND_URL } from '../config';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { MeetingEnd } from './MeetingEnd';
import { useJitsi } from '../hooks/use-jitsi';

const Meeting = ({ page }: { page: "create" | "join" }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    connect,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    Duration,
    Participants,
  } = useJitsi();
  
  const {
    localTracks,
    cameras,
    microphones,
  } = useSelector((state: RootState) => state.media);
  
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
    joinees,
  } = useSelector((state: RootState) => state.participants);

  const selectedCamera = useSelector((state: RootState) => state.media.selectedCamera);
  const audioTrack = useSelector((state: RootState) => 
    state.media.localTracks.find(track => track?.getType?.() === 'audio')
  );
  const selectedMicrophone = useSelector((state: RootState) => state.media.selectedMicrophone);


  // Refs
  const conferenceRef = useRef<any>(null);
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
        dispatch(setRoomId(response.data.meetingId));
        await connect(response.data.meetingId, response.data.name);
        window.history.pushState(null, '', `/meeting/${response.data.meetingId}`);
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

  // Render loading state if Jitsi is not loaded yet
  if (!jitsiLoaded && !error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">{error}</p>
          <p className="text-gray-700">Kindly refresh the page and try again.</p>
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
      <div className="flex justify-center items-center min-h-screen bg-background">
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