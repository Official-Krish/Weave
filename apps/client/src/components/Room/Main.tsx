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
  toggleScreenShare
}: VideoChatProps) => {

  const dispatch = useDispatch<AppDispatch>();
  
  // Select state from Redux
  const {
    participants,
    localTracks,
    isScreenSharing,
    isMuted,
    isVideoOff,
    displayName
  } = useSelector((state: RootState) => ({
    participants: state.participants.participants,
    localTracks: state.media.localTracks,
    isScreenSharing: state.media.isScreenSharing,
    isMuted: state.media.isMuted,
    isVideoOff: state.media.isVideoOff,
    displayName: state.meeting.displayName
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

  const getDimensionStyles = (isMainView: boolean) => {
    const ratio = layout === "screenShare" 
      ? userPreferences.screenShareRatio 
      : userPreferences.focusedViewRatio;
    
    if (isMainView) {
      return {
        width: layout === "focus" ? "100%" : `${ratio}%`,
        height: layout === "focus" ? `${ratio}%` : "100%"
      };
    } else {
      return {
        width: layout === "focus" ? "100%" : `${100 - ratio}%`,
        height: layout === "focus" ? `${100 - ratio}%` : "100%"
      };
    }
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
      const mainDimensions = getDimensionStyles(true);
      const sideDimensions = getDimensionStyles(false);

      return (
        <div className="w-full h-full flex">
          <div 
            className={`${getSpacingClass()}`}
            style={{ width: mainDimensions.width, height: mainDimensions.height }}
          >
            <ScreenShareTile 
              participant={sharingParticipant} 
              screenShareRef={screenShareRef} 
            />
          </div>
          
          <div 
            className={`overflow-y-auto ${getSpacingClass()}`}
            style={{ width: sideDimensions.width, height: sideDimensions.height }}
          >
            <div className="space-y-2">
              {otherParticipants.map(participant => (
                <VideoTile
                  key={participant.id}
                  participant={participant}
                  onClick={() => handleParticipantClick(participant.id)}
                  tracks={participant.tracks}
                />
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

      const mainDimensions = getDimensionStyles(true);
      const sideDimensions = getDimensionStyles(false);
      const { cols } = calculateGridLayout(otherParticipants.length);

      return (
        <div className="w-full h-full flex flex-col">
          <div 
            className={getSpacingClass()}
            style={{ height: mainDimensions.height, width: mainDimensions.width }}
          >
            <VideoTile
              participant={focusedParticipant}
              isLarge
              onClick={() => handleParticipantClick(focusedParticipant.id)}
              tracks={focusedParticipant.tracks}
            />
          </div>
          
          <div 
            className={getSpacingClass()}
            style={{ height: sideDimensions.height, width: sideDimensions.width }}
          >
            <div 
              className="grid h-full"
              style={{ 
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: userPreferences.compactView ? '4px' : '8px'
              }}
            >
              {otherParticipants.map(participant => (
                <VideoTile
                  key={participant.id}
                  participant={participant}
                  onClick={() => handleParticipantClick(participant.id)}
                  tracks={participant.tracks}
                />
              ))}
            </div>
          </div>
        </div>
      );
    } else {
      const participantCount = Object.keys(allParticipants).length;
      const { cols } = calculateGridLayout(participantCount);

      return (
        <div className={`w-full h-full ${getSpacingClass()}`}>
          <div 
            className="grid h-full"
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
                tracks={participant.tracks}
              />
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="relative w-full h-full bg-videochat-bg overflow-hidden">
      <MeetingInfo 
        meetingId={meetingId}
        password={passcode}
        hostName={localParticipant.displayName}
        participantCount={Object.keys(allParticipants).length}
      />
      
      <LayoutGroup>
        <motion.div
          layout
          className="w-full h-full"
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