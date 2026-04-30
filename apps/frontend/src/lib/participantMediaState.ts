export type ParticipantMediaState = {
  isMuted: boolean;
  isVideoOff: boolean;
};

export type ParticipantMediaStateMap = Record<string, ParticipantMediaState>;

export const DEFAULT_PARTICIPANT_MEDIA_STATE: ParticipantMediaState = {
  isMuted: false,
  isVideoOff: false,
};

export function getParticipantMediaState(
  participantStates: ParticipantMediaStateMap,
  participantId: string,
  fallback: ParticipantMediaState = DEFAULT_PARTICIPANT_MEDIA_STATE
) {
  return participantStates[participantId] ?? fallback;
}

export function setParticipantMediaState(
  participantStates: ParticipantMediaStateMap,
  participantId: string,
  mediaState: ParticipantMediaState
) {
  return {
    ...participantStates,
    [participantId]: mediaState,
  };
}

export function removeParticipantMediaState(
  participantStates: ParticipantMediaStateMap,
  participantId: string
) {
  if (!participantStates[participantId]) {
    return participantStates;
  }

  const next = { ...participantStates };
  delete next[participantId];
  return next;
}
