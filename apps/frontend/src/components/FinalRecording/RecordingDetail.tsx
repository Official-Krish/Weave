import type { RecordingPageResponse } from "@repo/types/api"
import { CalendarDays, Clock3, Users, Video, Download } from "lucide-react"

export const RecordingDetail = ({ meeting }: { meeting: RecordingPageResponse;}) => {
    const downloadableMp4Url = meeting?.meetingId
    ? `/api/v1/recordings/${meeting.meetingId}/final/meeting_grid_recording.mp4` : "";

    const startedAt = meeting?.startTime ? new Date(meeting.startTime) : null;
    const endedAt = meeting?.endTime ? new Date(meeting.endTime) : null;
    const durationLabel =
        startedAt && endedAt
          ? `${Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))} min`
          : "Unknown";
          
    return (
        <div className="wrp-panel">
            <h2 className="wrp-panel-title">
            <Video size={15} />
            Recording details
            </h2>
            <div className="wrp-meta-grid">
            <div className="wrp-meta-item">
                <Video size={13} />
                <span>Room Name: {meeting.roomName}</span>
            </div>
            <div className="wrp-meta-item">
                <Users size={13} />
                <span>{meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="wrp-meta-item">
                <CalendarDays size={13} />
                <span>{new Date(meeting.date).toLocaleString()}</span>
            </div>
            <div className="wrp-meta-item">
                <Clock3 size={13} />
                <span>Duration: {durationLabel}</span>
            </div>
            </div>

            {meeting.recordingState === "READY" && meeting.canViewRecording && (
            <a href={downloadableMp4Url} download className="wrp-download-btn">
                <Download size={13} />
                Download recording
            </a>
            )}
        </div>
    )
}