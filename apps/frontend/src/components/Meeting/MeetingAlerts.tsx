type MeetingAlertsProps = {
  error: string | null;
  recordingError: string | null;
};

export function MeetingAlerts({ error, recordingError }: MeetingAlertsProps) {
  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {recordingError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {recordingError}
        </div>
      ) : null}
    </>
  );
}
