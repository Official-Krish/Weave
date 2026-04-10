import {
  Circle,
  LayoutGrid,
  Mic,
  MicOff,
  MonitorUp,
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
  activeLayout: "grid" | "focus";
  isHost: boolean;
  isUploadingChunks: boolean;
  isRecordingBusy: boolean;
  canToggleRecording: boolean;
  recordingButtonLabel: string;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleSidebar: () => void;
  onToggleLayout: () => void;
  onToggleRecording: () => void;
  onLeaveCall: () => void;
};

export function MeetingControls({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isSidebarOpen,
  activeLayout,
  isHost,
  isUploadingChunks,
  isRecordingBusy,
  canToggleRecording,
  recordingButtonLabel,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSidebar,
  onToggleLayout,
  onToggleRecording,
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
          "flex h-11 w-11 items-center justify-center rounded-full transition",
          danger
            ? "bg-red-600 text-white hover:bg-red-500"
            : active
              ? "bg-white text-black"
              : "bg-[#1d2b37] text-[#e8f0f4] hover:bg-[#263544]",
          disabled ? "cursor-not-allowed opacity-55" : "",
        ].join(" ")}
      >
        {icon}
      </motion.button>
      <span className="text-[10px] font-medium text-[#91a7b7]">{label}</span>
    </div>
  );

  return (
    <div className="pointer-events-none fixed bottom-4 left-0 right-0 z-40 flex justify-center p-3">
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-auto flex items-end gap-3 rounded-full border border-[#2b3d49] bg-[#0b1218]/88 px-4 py-2.5 backdrop-blur-md"
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

        {isHost ? (
          <IconButton
            label={recordingActive ? "Stop rec" : "Record"}
            onClick={onToggleRecording}
            active={recordingActive}
            disabled={isRecordingBusy || !canToggleRecording}
            icon={<Circle size={19} className={recordingActive ? "text-red-500" : ""} />}
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
        <span className="absolute -top-7 rounded-full bg-[#0b1218]/90 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-[#86a5ba]">
          Uploading chunks
        </span>
      ) : null}
    </div>
  );
}
