import { Copy, Users, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type MeetingInfoProps = {
  meetingId: string;
  participantCount: number;
};

export function MeetingInfo({ meetingId, participantCount }: MeetingInfoProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(meetingId);
      setCopied(true);
      toast.success("Meeting ID copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="absolute left-4 top-4 z-30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group flex items-center gap-2 rounded-lg border border-[#f5a623]/20 bg-black/40 px-4 py-2.5 text-sm font-medium text-[#f4e7cc] shadow-lg backdrop-blur-md transition duration-200 hover:border-[#f5a623]/40 hover:bg-black/60 active:scale-95"
      >
        <div className="flex items-center gap-2">
          <span>Meeting Info</span>
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open ? (
        <div className="absolute mt-2 w-80 animate-in fade-in slide-in-from-top-2 rounded-xl border border-[#f5a623]/20 bg-gradient-to-br from-[#1a0f0a] to-[#0f0a06] p-5 text-[#f4e7cc] shadow-2xl backdrop-blur-lg">
          {/* Header */}
          <div className="mb-4 pb-4 border-b border-[#f5a623]/10">
            <p className="text-xs font-bold uppercase tracking-widest text-[#caa96a]">
              Active Meeting
            </p>
          </div>

          <div className="space-y-4">
            {/* Meeting ID Section */}
            <div className="group rounded-lg border border-[#f5a623]/10 bg-[#1a1410]/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-[#f5a623]/25 hover:bg-[#2a1f15]/50">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#b89968]">
                Meeting ID
              </p>
              <div className="flex items-center justify-between gap-3">
                <p className="flex-1 break-all font-mono text-sm font-bold text-[#fff5de] selection:bg-[#f5a623]/30">
                  {meetingId}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`flex-shrink-0 rounded-md p-2 transition-all duration-300 ${
                    copied
                      ? "bg-green-500/20 text-green-400"
                      : "bg-[#f5a623]/10 text-[#d8bc88] hover:bg-[#f5a623]/20 hover:text-[#fff5de]"
                  }`}
                  title={copied ? "Copied!" : "Copy to clipboard"}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Participants Section */}
            <div className="rounded-lg border border-[#f5a623]/10 bg-[#1a1410]/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5a623]/15">
                    <Users size={18} className="text-[#f5a623]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#b89968]">
                      Participants
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-[#fff5de]">
                      {participantCount} {participantCount === 1 ? "person" : "people"}
                    </p>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5a623]/20">
                  <span className="text-xs font-bold text-[#f5a623]">{participantCount}</span>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2.5">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
              <p className="text-xs font-medium text-green-300">Meeting in progress</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
