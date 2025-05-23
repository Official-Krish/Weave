import { useEffect, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../utils/store";
import { VideoTile } from "./Video";
import { ScreenShareTile } from "./ScreenShare";
import { VideoControls } from "./VideoControls";
import { ParticipantsSidebar } from "./ParticipantSidebar";
import { MeetingInfo } from "./MeetingInfo";
import { 
  setLayout,
  setActiveScreenShareId,
  setFocusedParticipantId,
  toggleParticipantsSidebar
} from "../../utils/slices/videoChatSlice";


interface VideoChatProps {
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  leaveConference: () => void;
  screenShareRef?: React.RefObject<HTMLVideoElement>;
  meetingId: string;
  passcode: string;
  toggleAudio: () => void;
}



export const VideoChat = ({ 
  toggleMute,  
  leaveConference, 
  screenShareRef,
  meetingId,
  passcode,
  toggleVideo,
  toggleScreenShare,
}: VideoChatProps) => {

  const dispatch = useDispatch<AppDispatch>();
  
  // Select state from Redux
  const {
    participants,
    localTracks,
    isScreenSharing,
    isMuted,
    isVideoOff,
    displayName,
    remoteTracks
  } = useSelector((state: RootState) => ({
    participants: state.participants.participants,
    localTracks: state.media.localTracks,
    isScreenSharing: state.media.isScreenSharing,
    isMuted: state.media.isMuted,
    isVideoOff: state.media.isVideoOff,
    displayName: state.meeting.displayName,
    remoteTracks: state.media.remoteTracks
  }));

  const {
    layout,
    activeScreenShareId,
    focusedParticipantId,
    showParticipantsSidebar,
    userPreferences
  } = useSelector((state: RootState) => state.videoChat);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  const localParticipant = {
    id: "local",
    displayName,
    isAudioMuted: isMuted,
    isVideoMuted: isVideoOff,
    isScreenSharing,
    tracks: localTracks,
    name: displayName, 
    isMuted: isMuted,  
    isVideoOff: isVideoOff 
  };

  const allParticipants = { 
    ...participants, 
    [localParticipant.id]: localParticipant 
  };

  const getParticipantTracks = (participantId: string) => {
    if (participantId === "local") {
      return localTracks;
    } else {
      // Get tracks from remoteTracks in media slice, not from participant object
      return remoteTracks[participantId] || [];
    }
  };

  
  // Responsive window size tracking
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get all screen sharing participants
  const screenSharingParticipants = Object.values(allParticipants).filter(
    participant => participant.isScreenSharing
  );
  
  // Determine the layout based on screen sharing status
  useEffect(() => {
    if (screenSharingParticipants.length > 0) {
      dispatch(setLayout("screenShare"));
      dispatch(setActiveScreenShareId(screenSharingParticipants[0].id));
    } else if (focusedParticipantId) {
      dispatch(setLayout("focus"));
    } else {
      dispatch(setLayout("grid"));
    }
  }, [screenSharingParticipants.length, focusedParticipantId, dispatch]);

  const handleParticipantClick = (id: string) => {
    if (layout === "screenShare") {
      const participant = allParticipants[id];
      if (participant?.isScreenSharing) {
        dispatch(setActiveScreenShareId(id));
      }
    } else if (layout === "grid") {
      dispatch(setFocusedParticipantId(id));
    } else if (layout === "focus" && id === focusedParticipantId) {
      dispatch(setFocusedParticipantId(null));
    } else if (layout === "focus") {
      dispatch(setFocusedParticipantId(id));
    }
  };

  // Dynamic grid calculation based on participant count and screen size
  const calculateGridLayout = (count: number) => {
    if (count === 2) {
      return { cols: 2, rows: 1 };
    }
    const isSmallScreen = windowSize.width < 768;
    const isMediumScreen = windowSize.width >= 768 && windowSize.width < 1280;
    
    let cols;
    if (isSmallScreen) {
      cols = count <= 1 ? 1 : 2;
    } else if (isMediumScreen) {
      if (count <= 1) cols = 1;
      else if (count <= 4) cols = 2;
      else cols = 3;
    } else {
      if (count < 2) cols = 1;
      else if (count <= 4) cols = 2;
      else if (count <= 9) cols = 3;
      else cols = Math.min(Math.ceil(Math.sqrt(count)), userPreferences.gridMaxColumns);
    }
    
    const rows = Math.ceil(count / cols);
    return { cols, rows };
  };

  const getSpacingClass = () => {
    return userPreferences.compactView ? "gap-1 p-1" : "gap-2 p-2";
  };

  // Calculate sidebar tile dimensions based on participant count (like Google Meet)
  const calculateSidebarTileHeight = (participantCount: number) => {
    const containerHeight = window.innerHeight - 200; // Account for controls, meeting info, and padding
    const maxTileHeight = 140; // Maximum height per tile
    const minTileHeight = 90;  // Minimum height per tile
    
    // Calculate how many tiles can fit vertically
    const availableHeight = containerHeight * 0.85; // Use 85% of available height
    const calculatedHeight = Math.max(
      minTileHeight, 
      Math.min(maxTileHeight, availableHeight / participantCount)
    );
    
    return calculatedHeight;
  };

  const renderLayout = () => {
    if (layout === "screenShare") {
      const sharingParticipant = Object.values(allParticipants).find(
        p => p.id === activeScreenShareId
      );
      
      if (!sharingParticipant) return null;
      
      const otherParticipants = Object.values(allParticipants).filter(
        p => p.id !== activeScreenShareId
      );

      const sidebarTileHeight = calculateSidebarTileHeight(otherParticipants.length);

      return (
        <div className="w-full h-screen flex">
          {/* Main screen share - 75% width */}
          <div 
            className={`${getSpacingClass()}`}
            style={{ width: "75%", height: "100vh" }}
          >
            <ScreenShareTile 
              participant={sharingParticipant} 
              screenShareRef={screenShareRef} 
            />
          </div>
          
          {/* Other participants sidebar - 25% width */}
          <div 
            className={`overflow-y-auto ${getSpacingClass()} flex flex-col`}
            style={{ width: "25%", height: "100vh" }}
          >
            <div className="flex flex-col gap-2">
              {otherParticipants.map(participant => (
                <div
                  key={participant.id}
                  style={{ 
                    height: `${sidebarTileHeight}px`,
                    minHeight: '90px',
                    maxHeight: '140px'
                  }}
                >
                  <VideoTile
                    participant={participant}
                    onClick={() => handleParticipantClick(participant.id)}
                    tracks={getParticipantTracks(participant.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else if (layout === "focus") {
      const focusedParticipant = Object.values(allParticipants).find(
        p => p.id === focusedParticipantId
      );
      const otherParticipants = Object.values(allParticipants).filter(
        p => p.id !== focusedParticipantId
      );
      
      if (!focusedParticipant) return null;
      
      if (otherParticipants.length === 0) {
        return (
          <div className="w-full h-full flex">
            <VideoTile
              participant={focusedParticipant}
              isLarge
              onClick={() => handleParticipantClick(focusedParticipant.id)}
              tracks={getParticipantTracks(focusedParticipant.id)}
            />
          </div>
        );
      }

      const sidebarTileHeight = calculateSidebarTileHeight(otherParticipants.length);

      return (
        <div className="w-full h-screen flex">
          {/* Focused participant - 75% width */}
          <div 
            className={getSpacingClass()}
            style={{ width: "75%", height: "100vh" }}
          >
            <VideoTile
              participant={focusedParticipant}
              isLarge
              onClick={() => handleParticipantClick(focusedParticipant.id)}
              tracks={getParticipantTracks(focusedParticipant.id)}
            />
          </div>
          
          {/* Other participants sidebar - 25% width */}
          <div 
            className={`overflow-y-auto ${getSpacingClass()} flex flex-col`}
            style={{ width: "25%", height: "100vh" }}
          >
            <div className="flex flex-col gap-2">
              {otherParticipants.map(participant => (
                <div
                  key={participant.id}
                  style={{ 
                    height: `${sidebarTileHeight}px`,
                    minHeight: '90px',
                    maxHeight: '140px'
                  }}
                >
                  <VideoTile
                    participant={participant}
                    onClick={() => handleParticipantClick(participant.id)}
                    tracks={getParticipantTracks(participant.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      const participantCount = Object.keys(allParticipants).length;
      const { cols } = calculateGridLayout(participantCount);
      const containerClass = participantCount < 3
      ? "flex h-screen" 
      : `w-full min-h-screen ${getSpacingClass()}`;

      return (
        <div className={containerClass}>
          <div 
            className={`grid h-full w-full ${participantCount < 3 ? getSpacingClass() : ''}`}
            style={{ 
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: userPreferences.compactView ? '4px' : '8px'
            }}
          >
            {Object.values(allParticipants).map(participant => (
              <VideoTile
                key={participant.id}
                participant={participant}
                onClick={() => handleParticipantClick(participant.id)}
                tracks={getParticipantTracks(participant.id)}
                // Add fullHeight prop if needed for VideoTile component
                fullHeight={participantCount < 3}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-screen bg-videochat-bg overflow-hidden">
      <MeetingInfo 
        meetingId={meetingId}
        password={passcode}
        hostName={localParticipant.displayName}
        participantCount={Object.keys(allParticipants).length}
      />
      
      <LayoutGroup>
        <motion.div
          layout
          className="w-full h-screen"
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {renderLayout()}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <VideoControls
        isMuted={localParticipant.isAudioMuted}
        isVideoOff={localParticipant.isVideoMuted}
        isScreenSharing={localParticipant.isScreenSharing}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={toggleScreenShare}
        onShowParticipants={() => dispatch(toggleParticipantsSidebar())}
        onLeaveCall={leaveConference}
      />

      <ParticipantsSidebar
        participants={Object.values(allParticipants)}
        isOpen={showParticipantsSidebar}
        onClose={() => dispatch(toggleParticipantsSidebar())}
      />
    </div>
  );
};