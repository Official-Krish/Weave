
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Participant } from "../../types/videoChat";

interface ScreenShareTileProps {
  participant: Participant;
  screenShareRef?: React.RefObject<HTMLVideoElement>;
}

export const ScreenShareTile = ({ participant, screenShareRef }: ScreenShareTileProps) => {

  useEffect(() => {
    if (screenShareRef.current && participant.screenStream) {
      screenShareRef.current.srcObject = participant.screenStream;
    }
    
    return () => {
      if (screenShareRef.current) {
        screenShareRef.current.srcObject = null;
      }
    };
  }, [participant.screenStream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full rounded-lg overflow-hidden bg-videochat-bg border border-videochat-accent/20"
    >
      <video 
        ref={screenShareRef}
        autoPlay 
        playsInline
        className="w-full h-full object-contain"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <span className="text-videochat-text font-medium">
            {participant.name}'s Screen
          </span>
        </div>
      </div>
    </motion.div>
  );
};