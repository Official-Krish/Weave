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
        className="rounded-md border border-[#2b3d49] bg-black/60 px-3 py-2 text-sm text-[#e7f0f5] backdrop-blur-md transition hover:bg-black/75"
      >
        Meeting Info
      </button>

      {open ? (
        <div className="mt-2 w-72 rounded-lg border border-[#2b3d49] bg-black/80 p-4 text-[#e7f0f5] backdrop-blur-md">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-[#8ba5b7]">Meeting ID</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="truncate font-mono text-sm">{meetingId}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(meetingId)}
                  className="rounded p-1 text-[#9db3c2] transition hover:bg-[#12202a] hover:text-white"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#b4c5d0]">
              <Users size={14} />
              <span>{participantCount} participants</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
