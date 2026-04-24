import type { MeetingSchedule } from "@repo/types/api";
import { CalendarDays, Clock3, LoaderCircle, Repeat, Users, CalendarClock } from "lucide-react";
import { motion } from "motion/react";
import { MeetingJoinPopover } from "@/components/Meetings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/https";
import { toast } from "sonner";
import { getHttpErrorMessage } from "@/lib/httpError";
import { useMemo, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePickerTime } from "@/components/ui/TimePicker";
import { Button } from "@/components/ui/button";

type UpcomingMeetingsProps = {
  schedules: MeetingSchedule[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  joiningScheduleId?: string | null;
  onJoinSchedule: (scheduleId: string, devices: { micId?: string; cameraId?: string }) => Promise<void>;
  onScheduleMeeting: () => void;
  compact?: boolean;
};

export function UpcomingMeetings({
  schedules,
  isLoading,
  isError,
  errorMessage,
  joiningScheduleId,
  onJoinSchedule,
  onScheduleMeeting,
  compact = false,
}: UpcomingMeetingsProps) {
  const queryClient = useQueryClient();
  const [rescheduleScheduleId, setRescheduleScheduleId] = useState<string | null>(null);
  const [rescheduleStartTime, setRescheduleStartTime] = useState<Date | null>(null);

  const upcoming = schedules
    .slice()
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const activeSchedule = useMemo(
    () => upcoming.find((schedule) => schedule.id === rescheduleScheduleId) ?? null,
    [upcoming, rescheduleScheduleId]
  );

  const rescheduleMutation = useMutation({
    mutationFn: async ({ id, startTime }: { id: string; startTime: Date }) => {
      const response = await http.post(`/meeting/reschedule/schedule/${id}`, {
        startTime: startTime.toISOString(),
      });
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Meeting rescheduled successfully.");
      setRescheduleScheduleId(null);
      setRescheduleStartTime(null);
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
    onError: (error) => {
      toast.error(getHttpErrorMessage(error, "Could not reschedule the meeting."));
    },
  });

  const handleOpenReschedule = (schedule: MeetingSchedule, open: boolean) => {
    if (!open) {
      setRescheduleScheduleId((current) => (current === schedule.id ? null : current));
      setRescheduleStartTime((current) => (rescheduleScheduleId === schedule.id ? null : current));
      return;
    }

    setRescheduleScheduleId(schedule.id);
    setRescheduleStartTime(new Date(schedule.startTime));
  };

  const handleSubmitReschedule = async () => {
    if (!activeSchedule || !rescheduleStartTime) {
      toast.error("Choose a new start date and time.");
      return;
    }

    await rescheduleMutation.mutateAsync({
      id: activeSchedule.id,
      startTime: rescheduleStartTime,
    });
  };

  return (
    <section className="rounded-2xl border border-[#f5a623]/10 bg-white/[0.022] p-5">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/55">
            Upcoming meetings
          </p>
          <h2 className="mt-1 text-[26px] font-black leading-none tracking-tight text-[#fff5de]">
            Scheduled rooms, ready when your team is
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#b49650]/65">
            Hosts can start the room from here, and invited participants can join once it goes live.
          </p>
        </div>

        <button
          type="button"
          onClick={onScheduleMeeting}
          className="inline-flex items-center justify-center rounded-full bg-[#f5a623] px-5 py-2.5 text-sm font-bold text-[#1b1100] transition hover:brightness-105 cursor-pointer"
        >
          Schedule meeting
        </button>
      </div>

      {isLoading ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f5a623]/10 bg-black/18 px-4 py-2 text-sm text-[#fff5de]/65">
          <LoaderCircle className="size-4 animate-spin" />
          Loading scheduled meetings...
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-500/15 bg-red-500/8 px-4 py-3 text-sm text-red-300/85">
          {errorMessage || "Could not load scheduled meetings."}
        </div>
      ) : upcoming.length === 0 ? (
        <div className="rounded-2xl border border-[#f5a623]/10 bg-black/18 px-5 py-6 text-sm text-[#a89880]">
          No upcoming meetings yet. Schedule one to see it here.
        </div>
      ) : (
        <div className="space-y-3">
          {(compact ? upcoming.slice(0, 3) : upcoming).map((schedule, index) => {
            const start = new Date(schedule.startTime);
            const buttonLabel = schedule.isHost ? "Join as host" : "Join";
            const cancelMeeting = schedule.isHost ? "Cancel meeting" : null;
            const isRescheduleOpen = rescheduleScheduleId === schedule.id;

            return (
              <motion.div
                key={schedule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.03 }}
                className="rounded-2xl border border-[#6482f5]/12 bg-[#0f0d12] p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-[15px] font-bold text-[#fff5de]">{schedule.title}</p>
                      <span className="rounded-full border border-[#6482f5]/20 bg-[#6482f5]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#9eb4ff]">
                        {schedule.isHost ? "Host" : "Participant"}
                      </span>
                    </div>

                    {schedule.description ? (
                      <p className="mt-2 text-sm leading-6 text-[#b49650]/65">{schedule.description}</p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#b49650]/60">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {start.toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3" />
                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {schedule.participantCount} participant{schedule.participantCount !== 1 ? "s" : ""}
                      </span>
                      {schedule.isRecurring ? (
                        <span className="inline-flex items-center gap-1">
                          <Repeat className="size-3" />
                          Recurring
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {schedule.isHost ? (
                      <Popover
                        open={isRescheduleOpen}
                        onOpenChange={(open) => handleOpenReschedule(schedule, open)}
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full border border-[#6482f5]/20 bg-[#6482f5]/10 px-4 py-2 text-[12px] font-bold text-[#9eb4ff] transition hover:border-[#6482f5]/35 hover:bg-[#6482f5]/14 cursor-pointer"
                          >
                            <CalendarClock className="size-3.5" />
                            Reschedule
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[420px] border border-white/10 bg-[#120f0b] p-4 text-[#fff5de]"
                          align="end"
                        >
                          <div className="space-y-4">
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#f5a623]/75">
                                Reschedule meeting
                              </p>
                              <h3 className="mt-1 text-base font-bold text-[#fff5de]">{schedule.title}</h3>
                              <p className="mt-1 text-sm leading-6 text-[#b49650]/65">
                                Pick a new start time and attendees will receive an updated reminder.
                              </p>
                            </div>

                            <DatePickerTime
                              value={rescheduleStartTime}
                              onChange={setRescheduleStartTime}
                              dateLabel="New date"
                              timeLabel="New time"
                            />

                            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-[#b49650]/70">
                              <span>Current start</span>
                              <span className="font-medium text-[#fff5de]">{start.toLocaleString()}</span>
                            </div>

                            <Button
                              type="button"
                              onClick={() => void handleSubmitReschedule()}
                              disabled={rescheduleMutation.isPending || !rescheduleStartTime}
                              className="h-11 w-full font-bold text-black hover:brightness-105 cursor-pointer disabled:pointer-events-none disabled:opacity-50 bg-[#f5a623]"
                            >
                              {rescheduleMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <CalendarClock className="size-4" />}
                              Save new time
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : null}

                    <MeetingJoinPopover
                      triggerLabel={buttonLabel}
                      scheduleId={schedule.id}
                      cancelMeetingLabel={cancelMeeting}
                      busy={joiningScheduleId === schedule.id}
                      onJoin={(devices) => onJoinSchedule(schedule.id, devices)}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
