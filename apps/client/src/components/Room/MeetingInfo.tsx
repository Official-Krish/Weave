import { useState } from "react";
import { Copy, Users, Key } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { toast } from "sonner";

interface MeetingInfoProps {
  meetingId: string;
  password: string;
  hostName: string;
  participantCount: number;
}

export const MeetingInfo = ({
  meetingId,
  password,
  hostName,
  participantCount,
}: MeetingInfoProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };
  
  return (
    <div className="absolute top-4 left-4 z-20">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-videochat-text bg-black/60 border-videochat-accent/30 hover:bg-black/80"
          >
            Meeting Info
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-black/80 border-videochat-accent/30 text-videochat-text backdrop-blur-md p-4">
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-videochat-accent/80">MEETING ID</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono truncate">{meetingId}</span>
                <Button
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(meetingId, "Meeting ID")}
                >
                  <Copy size={14} className="text-videochat-accent/70" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs text-videochat-accent/80">PASSWORD</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono truncate">{password}</span>
                <Button
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => copyToClipboard(password, "Password")}
                >
                  <Copy size={14} className="text-videochat-accent/70" />
                </Button>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-videochat-accent/70" />
                <span className="text-xs">{participantCount} Participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Key size={14} className="text-videochat-accent/70" />
                <span className="text-xs">Host: {hostName}</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};