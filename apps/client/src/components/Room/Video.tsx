
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
}

export const VideoTile = ({ participant, isLarge = false, onClick, tracks}: VideoTileProps) => {
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    console.log(`Setting up remote participant ${participant.id} with tracks:`, tracks);
    
    if (!tracks || !tracks.length) {
        console.log(`No tracks for participant ${participant.id}`);
        return;
    }
    
    const videoTrack = tracks.find(t => t && t.getType && t.getType() === 'video');
    const audioTrack = tracks.find(t => t && t.getType && t.getType() === 'audio');
    
    console.log(`Found video track: ${!!videoTrack}, audio track: ${!!audioTrack} for participant ${participant.id}`);
    
    if (videoTrack && videoRef.current) {
        try {
            console.log(`Attaching video track for participant ${participant.id}`);
            videoTrack.attach(videoRef.current);
        } catch (e) {
            console.error(`Error attaching remote video track for participant ${participant.id}:`, e);
        }
    }
    
    if (audioTrack && audioRef.current) {
        try {
            console.log(`Attaching audio track for participant ${participant.id}`);
            audioTrack.attach(audioRef.current);
        } catch (e) {
            console.error(`Error attaching remote audio track for participant ${participant.id}:`, e);
        }
    }
    
    return () => {
        console.log(`Cleaning up tracks for participant ${participant.id}`);
        
        if (videoTrack && videoRef.current) {
            try {
                videoTrack.detach(videoRef.current);
            } catch (e) {
                console.error(`Error detaching remote video track for participant ${participant.id}:`, e);
            }
        }
        
        if (audioTrack && audioRef.current) {
            try {
                audioTrack.detach(audioRef.current);
            } catch (e) {
                console.error(`Error detaching remote audio track for participant ${participant.id}:`, e);
            }
        }
    };
}, [participant.id, tracks]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative rounded-lg overflow-hidden bg-videochat-bg border border-videochat-accent/20",
        isLarge ? "w-full h-full" : "aspect-video"
      )}
      onClick={onClick}
    >
      {participant.isVideoOff || !videoRef ? (
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