import { LoaderCircle, Lock, Mail, UserPlus, Users, Video, X } from "lucide-react";

type CreateMeetingFormProps = {
  roomName: string;
  passcode: string;
  inviteEmail: string;
  invites: string[];
  isBusy: boolean;
  isPending: boolean;
  onRoomNameChange: (value: string) => void;
  onPasscodeChange: (value: string) => void;
  onInviteEmailChange: (value: string) => void;
  onAddInvite: () => void;
  onRemoveInvite: (email: string) => void;
  onSubmit: () => void;
};

export function CreateMeetingForm({
  roomName,
  passcode,
  inviteEmail,
  invites,
  isBusy,
  isPending,
  onRoomNameChange,
  onPasscodeChange,
  onInviteEmailChange,
  onAddInvite,
  onRemoveInvite,
  onSubmit,
}: CreateMeetingFormProps) {
  return (
    <div className="mt-5 space-y-4">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Room Name</p>
        <div className="relative">
          <input
            value={roomName}
            onChange={(event) => onRoomNameChange(event.target.value)}
            placeholder="team-sync-room"
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
            placeholder="Set room passcode (Minimum 4 Characters)"
             className="w-full rounded-xl border border-input bg-card px-4 py-3 pr-10 text-sm text-foreground outline-none transition focus:border-[#f5a623]/45 focus:ring-2 focus:ring-[#f5a623]/20"
          />
          <Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Invite Participants</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={inviteEmail}
              onChange={(event) => onInviteEmailChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddInvite();
                }
              }}
              placeholder="participant@email.com"
               className="w-full rounded-xl border border-input bg-card px-4 py-3 pr-10 text-sm text-foreground outline-none transition focus:border-[#f5a623]/45 focus:ring-2 focus:ring-[#f5a623]/20"
            />
            <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            type="button"
            onClick={onAddInvite}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition hover:bg-secondary"
          >
            <UserPlus className="h-4 w-4" />
          </button>
        </div>

        {invites.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {invites.map((email) => (
              <span key={email} className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-foreground">
                {email}
                <button type="button" onClick={() => onRemoveInvite(email)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={isBusy || !roomName.trim()}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#ffcf6b] via-[#f5a623] to-[#d98a10] px-5 py-3 text-sm font-extrabold text-[#1b1100] transition hover:brightness-105 disabled:opacity-60 cursor-pointer"
      >
        {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
        Create & Join Meeting
      </button>
    </div>
  );
}
