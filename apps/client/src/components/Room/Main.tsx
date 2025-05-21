import { useState, useEffect } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { VideoTile } from "./Video";
import { ScreenShareTile } from "./ScreenShare";
import { VideoControls } from "./VideoControls";
import { ParticipantsSidebar } from "./ParticipantSidebar";
import { MeetingInfo } from "./MeetingInfo";
import { Participant, VideoLayout } from "../../types/videoChat";

interface VideoChatProps {
  participants: Record<string, Participant>; 
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  localParticipant: Participant;
  leaveConfrence: () => void;
  screenShareRef?: React.RefObject<HTMLVideoElement>;
  userPreferences?: {
    focusedViewRatio?: number; // Percentage for focused participant (50-90)
    gridMaxColumns?: number;   // Maximum columns in grid view
    screenShareRatio?: number; // Percentage for screen share (50-90)
    compactView?: boolean;     // Use more compact spacing
  };
}

export const VideoChat = ({ 
    participants,
    toggleMute, 
    toggleVideo, 
    toggleScreenShare, 
    localParticipant, 
    leaveConfrence, 
    screenShareRef,
    userPreferences = {} // Default to empty object if not provided
  } : VideoChatProps) => {

  // Default values merged with user preferences
  const preferences = {
    focusedViewRatio: userPreferences.focusedViewRatio || 70,
    gridMaxColumns: userPreferences.gridMaxColumns || 4,
    screenShareRatio: userPreferences.screenShareRatio || 70,
    compactView: userPreferences.compactView || false
  };

  const [layout, setLayout] = useState<VideoLayout>("grid");
  const [activeScreenShareId, setActiveScreenShareId] = useState<string | null>(null);
  const [focusedParticipantId, setFocusedParticipantId] = useState<string | null>(null);
  const [showParticipantsSidebar, setShowParticipantsSidebar] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

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

  const allParticipants = { 
    ...participants, 
    [localParticipant.id]: localParticipant 
  };
  
  // Get all screen sharing participants
  const screenSharingParticipants = Object.values(allParticipants).filter(participant => participant.isScreenSharing);
  
  // Determine the layout based on screen sharing status
  useEffect(() => {
    if (screenSharingParticipants.length > 0) {
      setLayout("screenShare");
      setActiveScreenShareId(screenSharingParticipants[0].id);
    } else if (focusedParticipantId) {
      setLayout("focus");
    } else {
      setLayout("grid");
    }
  }, [screenSharingParticipants.length, focusedParticipantId]);

  const handleParticipantClick = (id: string) => {
    if (layout === "screenShare") {
      // If in screen share mode and clicked on a participant that is sharing,
      // make that participant's screen share active
      const participant = allParticipants[id];
      if (participant?.isScreenSharing) {
        setActiveScreenShareId(id);
      }
    } else if (layout === "grid") {
      // If in grid mode, focus on the clicked participant
      setFocusedParticipantId(id);
    } else if (layout === "focus" && id === focusedParticipantId) {
      // If already focused on this participant, go back to grid
      setFocusedParticipantId(null);
    } else if (layout === "focus") {
      // If already in focus mode but on a different participant, switch focus
      setFocusedParticipantId(id);
    }
  };

  // Dynamic grid calculation based on participant count and screen size
  const calculateGridLayout = (count) => {
    // Base calculation on window size
    const isSmallScreen = windowSize.width < 768;
    const isMediumScreen = windowSize.width >= 768 && windowSize.width < 1280;
    
    // Calculate columns based on screen width and participant count
    let cols;
    if (isSmallScreen) {
      cols = count <= 1 ? 1 : 2; // Max 2 columns on small screens
    } else if (isMediumScreen) {
      if (count <= 1) cols = 1;
      else if (count <= 4) cols = 2;
      else cols = 3; // Max 3 columns on medium screens
    } else {
      // Large screens
      if (count < 2) cols = 1;
      else if (count <= 4) cols = 2;
      else if (count <= 9) cols = 3;
      else cols = Math.min(Math.ceil(Math.sqrt(count)), preferences.gridMaxColumns);
    }
    
    // Calculate rows based on columns and count
    const rows = Math.ceil(count / cols);
    
    return { cols, rows };
  };

  // Get spacing class based on compact view preference
  const getSpacingClass = () => {
    return preferences.compactView ? "gap-1 p-1" : "gap-2 p-2";
  };

  // Get dimension styles for focused/screenshare views
  const getDimensionStyles = (isMainView) => {
    const ratio = layout === "screenShare" ? preferences.screenShareRatio : preferences.focusedViewRatio;
    
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
      // Screen sharing layout
      const sharingParticipant = Object.values(allParticipants).find(p => p.id === activeScreenShareId);
      
      if (!sharingParticipant) return null;
      
      const otherParticipants = Object.values(allParticipants).filter(p => p.id !== activeScreenShareId);
      const mainDimensions = getDimensionStyles(true);
      const sideDimensions = getDimensionStyles(false);

      return (
        <div className="w-full h-full flex">
          {/* Main screen share */}
          <div 
            className={`${getSpacingClass()}`}
            style={{ width: mainDimensions.width, height: mainDimensions.height }}
          >
            <ScreenShareTile participant={sharingParticipant} screenShareRef={screenShareRef} />
          </div>
          
          {/* Participants column */}
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
      // Focus layout
        const focusedParticipant = Object.values(allParticipants).find(p => p.id === focusedParticipantId);
        const otherParticipants = Object.values(allParticipants).filter(p => p.id !== focusedParticipantId);
        
        if (!focusedParticipant) return null;

        const mainDimensions = getDimensionStyles(true);
        const sideDimensions = getDimensionStyles(false);
        
        // Calculate grid for other participants
        const participantCount = otherParticipants.length;
        const { cols } = calculateGridLayout(participantCount);

        return (
            <div className="w-full h-full flex flex-col">
                {/* Main focused participant */}
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
                
                {/* Other participants row */}
                <div 
                  className={getSpacingClass()}
                  style={{ height: sideDimensions.height, width: sideDimensions.width }}
                >
                    <div 
                      className="grid h-full"
                      style={{ 
                        gridTemplateColumns: `repeat(${cols}, 1fr)`,
                        gap: preferences.compactView ? '4px' : '8px'
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
      // Default grid layout - dynamically adjust based on number of participants and screen size
      const participantCount = Object.keys(allParticipants).length;
      const { cols } = calculateGridLayout(participantCount);

      return (
          <div className={`w-full h-full ${getSpacingClass()}`}>
              <div 
                  className="grid h-full"
                  style={{ 
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: preferences.compactView ? '4px' : '8px'
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
          {/* Meeting Info Floating Component */}
          <MeetingInfo 
              meetingId={"12"}
              password={"1234"}
              hostName={Object.keys(allParticipants).find(key => {
                const participant = allParticipants[key];
                return participant.id === "local";
              }) ? allParticipants[Object.keys(allParticipants).find(key => allParticipants[key].id === "local")!].name : undefined}
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

          {/* Controls - will auto-hide */}
          <VideoControls
              isMuted={localParticipant.isMuted}
              isVideoOff={localParticipant.isVideoOff}
              isScreenSharing={localParticipant.isScreenSharing}
              onToggleMute={toggleMute}
              onToggleVideo={toggleVideo}
              onToggleScreenShare={toggleScreenShare}
              onShowParticipants={() => setShowParticipantsSidebar(true)}
              onLeaveCall={() => leaveConfrence()}
          />

          {/* Participants Sidebar */}
          <ParticipantsSidebar
              participants={Object.values(allParticipants)}
              isOpen={showParticipantsSidebar}
              onClose={() => setShowParticipantsSidebar(false)}
          />
      </div>
  );
};