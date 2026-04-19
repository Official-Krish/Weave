import { Mic, MicOff, MonitorUp, Video, VideoOff, X } from "lucide-react";
import { motion } from "motion/react";
import type { MeetingParticipantState } from "../../types/meeting";

type ParticipantsSidebarProps = {
  participants: MeetingParticipantState[];
  isOpen: boolean;
  onClose: () => void;
};

export function ParticipantsSidebar({ participants, isOpen, onClose }: ParticipantsSidebarProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <motion.aside
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeInOut" }}
      className="fixed bottom-0 right-0 top-0 z-50 w-72 border-l border-[#f5a623]/14 bg-[#0f0b07]/94 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[#f5a623]/12 px-4 py-4">
        <h2 className="text-sm font-medium text-[#fff2d8]">
          Participants ({participants.length})
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#c5a56b] transition hover:text-[#fff2d8]"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="max-h-[calc(100%-65px)] space-y-1 overflow-y-auto p-2">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center gap-3 rounded-md p-3 transition hover:bg-[#1c140c]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#f5a623]/16 bg-[#2a1c0e] text-sm font-medium text-[#f4dfb8]">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#f6ebd2]">
                {participant.name} {participant.isLocal ? "(You)" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {participant.isScreenSharing ? <MonitorUp size={14} className="text-[#f5c050]" /> : null}
              {participant.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-[#dabd86]" />}
              {participant.isVideoOff ? <VideoOff size={14} className="text-red-400" /> : <Video size={14} className="text-[#dabd86]" />}
            </div>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
