import { LoaderCircle, Lock, Users } from "lucide-react";

type JoinMeetingFormProps = {
  meetingId: string;
  passcode: string;
  isBusy: boolean;
  isPending: boolean;
  onMeetingIdChange: (value: string) => void;
  onPasscodeChange: (value: string) => void;
  onSubmit: () => void;
};

export function JoinMeetingForm({
  meetingId,
  passcode,
  isBusy,
  isPending,
  onMeetingIdChange,
  onPasscodeChange,
  onSubmit,
}: JoinMeetingFormProps) {
  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Meeting ID</p>
        <div className="relative">
          <input
            value={meetingId}
            onChange={(event) => onMeetingIdChange(event.target.value)}
            placeholder="meeting id"
             className="w-full rounded-xl border border-input bg-card px-4 py-3 pr-10 text-sm text-foreground outline-none transition focus:border-[#f5a623]/45 focus:ring-2 focus:ring-[#f5a623]/20"
          />
          <Users className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Passcode (Optional)</p>
        <div className="relative">
          <input
            value={passcode}
            onChange={(event) => onPasscodeChange(event.target.value)}
            placeholder="Room passcode"
             className="w-full rounded-xl border border-input bg-card px-4 py-3 pr-10 text-sm text-foreground outline-none transition focus:border-[#f5a623]/45 focus:ring-2 focus:ring-[#f5a623]/20"
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isBusy || !meetingId.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#ffcf6b] via-[#f5a623] to-[#d98a10] px-5 py-3 text-sm font-extrabold text-[#1b1100] transition hover:brightness-105 disabled:opacity-60 cursor-pointer"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
        Join Meeting
      </button>
    </div>
  );
}
