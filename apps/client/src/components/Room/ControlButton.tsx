import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";

interface ControlButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  className?: string;
}

export const ControlButton = ({
  icon,
  label,
  active = false,
  onClick,
  className,
}: ControlButtonProps) => {
  return (
    <div className="flex flex-col items-center">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center w-12 h-12 rounded-full",
          active ? "bg-white text-black" : "bg-videochat-accent/20 text-white",
          className
        )}
      >
        {icon}
      </motion.button>
      <span className="text-xs text-videochat-accent mt-1">{label}</span>
    </div>
  );
};
