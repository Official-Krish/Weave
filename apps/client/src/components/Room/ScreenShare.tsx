import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Participant } from "../../types/videoChat";

interface ScreenShareTileProps {
  participant: Participant;
  screenShareTrack?: any;
}

export const ScreenShareTile = ({ participant, screenShareTrack }: ScreenShareTileProps) => {
  const screenShareRef = useRef<HTMLVideoElement>(null);

  console.log("Screen share track:", screenShareTrack);

  useEffect(() => {
    if (!screenShareRef.current || !screenShareTrack) {
      if (screenShareRef.current?.srcObject) {
        (screenShareRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        screenShareRef.current.srcObject = null;
      }
      return;
    }
  
    const videoElement = screenShareRef.current;
  
    let actualTrack = Array.isArray(screenShareTrack) ? screenShareTrack[0] : screenShareTrack;
    
    if (actualTrack?.local) {
      actualTrack = actualTrack.local;
    }
  
    if (actualTrack && actualTrack.stream instanceof MediaStream) {
      videoElement.srcObject = actualTrack.stream;
      
      return () => {
        videoElement.srcObject = null;
      };
    } else if (actualTrack && typeof actualTrack.getOriginalStream === 'function') {
      const mediaStream = actualTrack.getOriginalStream();
      videoElement.srcObject = mediaStream;
      
      return () => {
        videoElement.srcObject = null;
      };
    } else if (actualTrack instanceof MediaStream) {
      videoElement.srcObject = actualTrack;
      
      return () => {
        videoElement.srcObject = null;
      };
    } else if (actualTrack instanceof MediaStreamTrack) {
      const stream = new MediaStream([actualTrack]);
      videoElement.srcObject = stream;
      
      return () => {
        videoElement.srcObject = null;
      };
    } else {
      console.warn("Unknown screen share track type:", screenShareTrack);
      console.log("Actual track:", actualTrack);
    }
    return () => {
      if (screenShareRef.current?.srcObject) {
        (screenShareRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        screenShareRef.current.srcObject = null;
      }
    };
  }, [screenShareTrack]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full h-full rounded-lg overflow-hidden bg-videochat-bg border border-videochat-accent/20"
    >
      <video 
        ref={screenShareRef}
        autoPlay 
        playsInline
        muted 
        className="w-full h-full object-contain bg-black"
      />
      
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-between items-center">
          <span className="text-videochat-text font-medium text-sm">
            {participant.name}'s Screen
          </span>
        </div>
      </div>
    </motion.div>
  );
};