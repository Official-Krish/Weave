
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Users, ScreenShare, PhoneOff, CirclePlay, Disc } from "lucide-react";
import { ControlButton } from "./ControlButton";
import { useJitsi } from "../../hooks/use-jitsi";

interface VideoControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onShowParticipants: () => void;
  onLeaveCall: () => void;
  isHost: boolean; 
}

export const VideoControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onShowParticipants,
  onLeaveCall,
  isHost
}: VideoControlsProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const { 
    isRecording,
    startRecording,
    stopRecording
  } = useJitsi();
  const hideTimeout = 3000; // 3 seconds
  let hideTimer: number | null = null;

  // Initialize with visible controls and set a timer to hide them
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, hideTimeout);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Handle mouse movement in the parent container (VideoChat)
  useEffect(() => {
    const handleMouseMove = () => {
      // Show controls when mouse moves
      setIsVisible(true);
      
      // Clear any existing timer
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      
      // Set a new timer to hide controls after inactivity
      hideTimer = window.setTimeout(() => {
        setIsVisible(false);
      }, hideTimeout);
    };

    // Add event listener to the entire document
    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4 z-10">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            layout
            className="flex items-center gap-4 p-4 rounded-full bg-black/60 backdrop-blur-md border border-videochat-accent/20"
          >
            <ControlButton
              icon={isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              label={isMuted ? "Unmute" : "Mute"}
              active={!isMuted}
              onClick={onToggleMute}
            />
            <ControlButton
              icon={isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
              label={isVideoOff ? "Start Video" : "Stop Video"}
              active={!isVideoOff}
              onClick={onToggleVideo}
            />
            <ControlButton
              icon={<ScreenShare size={24} />}
              label="Share Screen"
              active={isScreenSharing}
              onClick={onToggleScreenShare}
            />
            {isHost && (
              <ControlButton
                icon={isRecording ? <Disc size={24} className="text-red-500"/> : <CirclePlay size={24} />}
                label={isRecording ? "Stop Recording" : "Start Recording"}
                onClick={() => {
                  if (isRecording) {
                    stopRecording(true);
                  } else  {
                    startRecording(true);
                  }
                }}
              />
            )}
            <ControlButton
              icon={<Users size={24} />}
              label="Participants"
              onClick={onShowParticipants}
            />
            <ControlButton
              icon={<PhoneOff size={24} />}
              label="Leave"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={onLeaveCall}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};