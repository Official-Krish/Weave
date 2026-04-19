type MeetingAlertsProps = {
  error: string | null;
  recordingError: string | null;
};

export function MeetingAlerts({ error, recordingError }: MeetingAlertsProps) {
  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-red-500/28 bg-red-500/12 px-4 py-3 text-sm text-red-300 shadow-[0_10px_24px_rgba(239,68,68,0.08)]">
          {error}
        </div>
      ) : null}

      {recordingError ? (
        <div className="rounded-2xl border border-red-500/28 bg-red-500/12 px-4 py-3 text-sm text-red-300 shadow-[0_10px_24px_rgba(239,68,68,0.08)]">
          {recordingError}
        </div>
      ) : null}
    </>
  );
}
