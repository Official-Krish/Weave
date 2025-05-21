import { motion, AnimatePresence } from "framer-motion";
import { Participant } from "../../types/videoChat";
import { X, Mic, MicOff, Video, VideoOff, ScreenShare } from "lucide-react";

interface ParticipantsSidebarProps {
  participants: Participant[];
  isOpen: boolean;
  onClose: () => void;
}

export const ParticipantsSidebar = ({
  participants,
  isOpen,
  onClose,
}: ParticipantsSidebarProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-0 right-0 bottom-0 w-72 bg-black/80 backdrop-blur-md border-l border-videochat-accent/20 z-30"
        >
          <div className="p-4 flex items-center justify-between border-b border-videochat-accent/20">
            <h2 className="text-videochat-text font-medium">Participants ({participants.length})</h2>
            <button
              onClick={onClose}
              className="text-videochat-accent hover:text-videochat-text transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="p-2 overflow-y-auto max-h-[calc(100%-60px)]">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center p-3 rounded-md hover:bg-videochat-accent/10"
              >
                <div className="w-8 h-8 rounded-full bg-videochat-accent/20 flex items-center justify-center text-videochat-text mr-3">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-videochat-text">
                    {participant.name} {participant.id === "local" && "(You)"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {participant.isScreenSharing && (
                    <ScreenShare size={16} className="text-blue-400" />
                  )}
                  {participant.isMuted ? (
                    <MicOff size={16} className="text-red-500" />
                  ) : (
                    <Mic size={16} className="text-videochat-text" />
                  )}
                  {participant.isVideoOff ? (
                    <VideoOff size={16} className="text-red-500" />
                  ) : (
                    <Video size={16} className="text-videochat-text" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
