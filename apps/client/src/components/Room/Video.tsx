import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Participant } from "../../types/videoChat";
import { cn } from "../../lib/utils";

interface VideoTileProps {
  participant: Participant;
  isLarge?: boolean;
  onClick?: () => void;
  tracks?: any;
  fullHeight?: boolean;
}

export const VideoTile = ({ participant, onClick, tracks, fullHeight }: VideoTileProps) => {
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!tracks){
    console.error('No tracks provided for participant:', participant.name);
    return null;
  }

  useEffect(() => {
    if (!videoRef.current || !tracks || tracks.length === 0) return;
  
    // Find the video track (not screen share)
    const videoTrack = tracks.find(track => 
      track && 
      track.getType && 
      track.getType() === 'video' && 
      (!track.getVideoType || track.getVideoType() !== 'desktop')
    );

    const audioTrack = tracks.find(track =>
      track &&
      track.getType &&
      track.getType() === 'audio'
    ); 
  
    if (videoTrack) {
      try {
        videoTrack.attach(videoRef.current);
      } catch (e) {
        console.error('Error attaching video track:', e);
      }
    }

    if (audioTrack && participant.id !== "local") {
      try {
        audioTrack.attach(audioRef.current);
      } catch (e) {
        console.error('Error attaching audio track:', e);
      }
    }
  
    return () => {
      if (videoTrack && videoRef.current) {
        try {
          videoTrack.detach(videoRef.current);
        } catch (e) {
          console.error('Error detaching video track:', e);
        }
      }
    };
  }, [tracks, participant.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-lg overflow-hidden bg-videochat-bg border border-videochat-accent/20 cursor-pointer hover:border-videochat-accent/40 transition-colors h-full",
      )}
      onClick={onClick}
    >
      {participant.isVideoOff ? (
        <div className="w-full h-full flex items-center justify-center bg-videochat-bg">
          <div className="h-20 w-20 rounded-full bg-videochat-accent/20 flex items-center justify-center text-videochat-text text-2xl">
            {participant.name.charAt(0).toUpperCase()}
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={participant.id === "local"} // Mute local video to prevent echo
          className="w-full h-full object-cover"
        />
      )}

      {/* Audio element for remote participants only */}
      {participant.id !== "local" && (
        <audio 
          ref={audioRef} 
          autoPlay 
          playsInline 
          style={{ display: 'none' }}
        />
      )}

      {/* Overlay with name and status icons */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <span className="text-videochat-text font-medium truncate">{participant.name}</span>
          <div className="flex items-center gap-2">
            {participant.isMuted ? 
              <MicOff size={16} className="text-red-500" /> : 
              <Mic size={16} className="text-videochat-text" />
            }
            {participant.isVideoOff ? 
              <VideoOff size={16} className="text-red-500" /> : 
              <Video size={16} className="text-videochat-text" />
            }
          </div>
        </div>
      </div>
      
      {/* Screen sharing indicator */}
      {participant.isScreenSharing && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          Sharing Screen
        </div>
      )}
    </motion.div>
  );
};