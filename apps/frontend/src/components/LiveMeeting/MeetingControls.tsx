import {
  Circle,
  LayoutGrid,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  OctagonX,
  PhoneOff,
  Sidebar,
  Video,
  VideoOff,
} from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

type MeetingControlsProps = {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  activeLayout: "grid" | "focus";
  isHost: boolean;
  isUploadingChunks: boolean;
  isRecordingBusy: boolean;
  canToggleRecording: boolean;
  unreadMessages: number;
  recordingButtonLabel: string;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  onToggleLayout: () => void;
  onToggleRecording: () => void;
  onEndForAll: () => void;
  onLeaveCall: () => void;
};

export function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isSidebarOpen,
  isChatOpen,
  activeLayout,
  isHost,
  isUploadingChunks,
  isRecordingBusy,
  canToggleRecording,
  unreadMessages,
  recordingButtonLabel,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSidebar,
  onToggleChat,
  onToggleLayout,
  onToggleRecording,
  onEndForAll,
  onLeaveCall,
}: MeetingControlsProps) {
  const recordingActive = recordingButtonLabel.toLowerCase().includes("stop");

  const IconButton = ({
    label,
    onClick,
    active,
    danger,
    icon,
    disabled,
  }: {
    label: string;
    onClick: () => void;
    active?: boolean;
    danger?: boolean;
    icon: ReactNode;
    disabled?: boolean;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "flex h-11 w-11 items-center justify-center rounded-full border transition cursor-pointer",
          danger
            ? "border-red-500/40 bg-red-600/85 text-white hover:bg-red-500/90"
            : active
              ? "border-[#f5a623]/35 bg-linear-to-r from-[#ffcf6b] via-[#f5a623] to-[#d98a10] text-[#1b1100]"
              : "border-[#f5a623]/16 bg-[#1a140d] text-[#f4e2bf] hover:border-[#f5a623]/28 hover:bg-[#21180f]",
          disabled ? "cursor-not-allowed opacity-55" : "",
        ].join(" ")}
      >
        {icon}
      </motion.button>
      <span className="text-[10px] font-medium text-[#c6a96f]">{label}</span>
    </div>
  );

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-40 flex justify-center p-3">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-auto flex items-end gap-3 rounded-full border border-[#f5a623]/16 bg-[#0e0b08]/88 px-4 py-2.5 shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
      >
        <IconButton
          label={isMuted ? "Unmute" : "Mute"}
          onClick={onToggleAudio}
          active={!isMuted}
          icon={isMuted ? <MicOff size={19} /> : <Mic size={19} />}
        />
        <IconButton
          label={isVideoOff ? "Start cam" : "Stop cam"}
          onClick={onToggleVideo}
          active={!isVideoOff}
          icon={isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
        />
        <IconButton
          label={isScreenSharing ? "Stop share" : "Share"}
          onClick={onToggleScreenShare}
          active={isScreenSharing}
          icon={<MonitorUp size={19} />}
        />
        <IconButton
          label={activeLayout === "focus" ? "Grid" : "Focus"}
          onClick={onToggleLayout}
          active={activeLayout === "focus"}
          icon={<LayoutGrid size={19} />}
        />
        <IconButton
          label={isSidebarOpen ? "Hide users" : "Users"}
          onClick={onToggleSidebar}
          active={isSidebarOpen}
          icon={<Sidebar size={19} />}
        />
        <div className="relative">
          <IconButton
            label={isChatOpen ? "Hide chat" : "Chat"}
            onClick={onToggleChat}
            active={isChatOpen}
            icon={<MessageSquare size={19} />}
          />
          {unreadMessages > 0 && !isChatOpen ? (
            <span className="absolute right-0 top-0 flex h-5 min-w-5 -translate-y-1/3 translate-x-1/3 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadMessages > 9 ? "9+" : unreadMessages}
            </span>
          ) : null}
        </div>

        {isHost ? (
          <IconButton
            label={recordingActive ? "Stop rec" : "Record"}
            onClick={onToggleRecording}
            active={recordingActive}
            disabled={isRecordingBusy || !canToggleRecording}
            icon={<Circle size={19} className={recordingActive ? "text-red-500" : "text-[#a57a26]"} />}
          />
        ) : null}

        {isHost ? (
          <IconButton
            label="End all"
            onClick={onEndForAll}
            danger
            icon={<OctagonX size={19} />}
          />
        ) : null}

        <IconButton
          label="Leave"
          onClick={onLeaveCall}
          danger
          icon={<PhoneOff size={19} />}
        />
      </motion.div>

      {isHost && isUploadingChunks ? (
        <span className="absolute -top-7 rounded-full border border-[#f5a623]/18 bg-[#120f0a]/94 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#d0af72]">
          Uploading chunks
        </span>
      ) : null}
    </div>
  );
}
