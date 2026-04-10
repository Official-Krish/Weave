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
      className="fixed bottom-0 right-0 top-0 z-50 w-72 border-l border-[#2b3c47] bg-[#0b1218]/92 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-[#263742] px-4 py-4">
        <h2 className="text-sm font-medium text-[#e5eef4]">
          Participants ({participants.length})
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-[#8ca4b4] transition hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      <ul className="max-h-[calc(100%-65px)] space-y-1 overflow-y-auto p-2">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className="flex items-center gap-3 rounded-md p-3 hover:bg-[#15222c]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17303d] text-sm font-medium text-[#d6e6ef]">
              {participant.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#e4edf3]">
                {participant.name} {participant.isLocal ? "(You)" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {participant.isScreenSharing ? <MonitorUp size={14} className="text-blue-400" /> : null}
              {participant.isMuted ? <MicOff size={14} className="text-red-400" /> : <Mic size={14} className="text-[#a8bdcb]" />}
              {participant.isVideoOff ? <VideoOff size={14} className="text-red-400" /> : <Video size={14} className="text-[#a8bdcb]" />}
            </div>
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}
