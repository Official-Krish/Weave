import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Participant } from "../../types/videoChat";

interface ScreenShareTileProps {
  participant: Participant;
  screenShareTrack?: any;
}

export const ScreenShareTile = ({ participant, screenShareTrack }: ScreenShareTileProps) => {
  const screenShareRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let actualTrack = null;

    // Find the correct screen share track
    if (Array.isArray(screenShareTrack)) {
      // If screenShareTrack is an array, find the video track
      actualTrack = screenShareTrack.find(t => 
        t && 
        typeof t.getType === 'function' && 
        t.getType() === 'video'
      );
    } else if (screenShareTrack && typeof screenShareTrack.getType === 'function') {
      // If screenShareTrack is a single track object
      if (screenShareTrack.getType() === 'video') {
        actualTrack = screenShareTrack;
      }
    }

    console.log('ScreenShareTrack for', participant.name, ':', actualTrack);
    
    // Attach video track to the ref element
    if (actualTrack && screenShareRef.current) {
      try {
        actualTrack.attach(screenShareRef.current);
        console.log('ScreenShare track attached successfully for', participant.name);
      } catch (e) {
        console.error('Error attaching ScreenShare track for', participant.name, ':', e);
      }
    }

    // Cleanup function
    return () => {
      if (actualTrack && screenShareRef.current) {
        try {
          actualTrack.detach(screenShareRef.current);
          console.log('ScreenShare track detached for', participant.name);
        } catch (e) {
          console.error('Error detaching screen share track for', participant.name, ':', e);
        }
      }
    };
  }, [screenShareTrack, participant.name]);

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