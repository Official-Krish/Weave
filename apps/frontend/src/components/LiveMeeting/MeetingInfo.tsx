import { Copy, Users } from "lucide-react";
import { useState } from "react";

type MeetingInfoProps = {
  meetingId: string;
  participantCount: number;
};

export function MeetingInfo({ meetingId, participantCount }: MeetingInfoProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute left-4 top-4 z-30">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-md border border-[#f5a623]/16 bg-black/55 px-3 py-2 text-sm text-[#f4e7cc] backdrop-blur-md transition hover:border-[#f5a623]/30 hover:bg-black/70"
      >
        Meeting Info
      </button>

      {open ? (
        <div className="mt-2 w-72 rounded-lg border border-[#f5a623]/16 bg-[#130f0a]/92 p-4 text-[#f4e7cc] shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#caa96a]">Meeting ID</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-sm">{meetingId}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(meetingId)}
                  className="rounded p-1 text-[#d8bc88] transition hover:bg-[#2a1e10] hover:text-[#fff5de]"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#d6be90]">
              <Users size={14} />
              <span>{participantCount} participants</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
