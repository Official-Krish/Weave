// types/jitsi.d.ts
declare namespace JitsiMeetJS {
    namespace events {
      namespace connection {
        const CONNECTION_ESTABLISHED = "connection.connectionEstablished";
        const CONNECTION_FAILED = "connection.connectionFailed";
        const CONNECTION_DISCONNECTED = "connection.connectionDisconnected";
      }
      namespace conference {
        const TRACK_ADDED = "conference.trackAdded";
        const TRACK_REMOVED = "conference.trackRemoved";
        const CONFERENCE_JOINED = "conference.joined";
        const USER_JOINED = "conference.userJoined";
        const USER_LEFT = "conference.userLeft";
        const TRACK_MUTE_CHANGED = "conference.trackMuteChanged";
        const DISPLAY_NAME_CHANGED = "conference.displayNameChanged";
        const LOCAL_TRACK_STOPPED = "track.stopped";
        const END_CONFERENCE = "conference.ended";
        const STARTRED_RECORDING = "conference.recordingStarted";
        const STOPPED_RECORDING = "conference.recordingStopped";
      }
    }

    enum logLevels {
      TRACE = "trace",
      DEBUG = "debug",
      INFO = "info",
      LOG = "log",
      WARN = "warn",
      ERROR = "error"
    }
  
    function init(options?: InitOptions): void;
    function setLogLevel(level: logLevels): void;
    function createLocalTracks(options?: TrackOptions, timeout?: number): Promise<JitsiTrack[]>;
    
    class JitsiConnection {
      constructor(appID: string | null, token: string | null, options: ConnectionOptions);
      connect(): void;
      disconnect(): void;
      initJitsiConference(roomName: string, options: ConferenceOptions): JitsiConference;
      addEventListener(event: string, listener: Function): void;
      removeEventListener(event: string, listener: Function): void;
    }
  
    class JitsiConference {
      join(): void;
      leave(): void;
      addTrack(track: JitsiTrack): void;
      removeTrack(track: JitsiTrack): void;
      on(event: string, listener: Function): void;
      off(event: string, listener: Function): void;
      setDisplayName(name: string): void;
      ednConference(): void;
    }
  
    interface JitsiTrack {
      getType(): "audio" | "video" | "desktop";
      isLocal(): boolean;
      isMuted(): boolean;
      mute(): void;
      unmute(): void;
      attach(container: HTMLElement): void;
      detach(container: HTMLElement): void;
      dispose(): void;
      getId(): string;
      getParticipantId(): string;
      addEventListener(event: string, listener: Function): void;
      removeEventListener(event: string, listener: Function): void;
    }
  
    interface InitOptions {
      disableAudioLevels?: boolean;
      disableSimulcast?: boolean;
      enableNoAudioDetection?: boolean;
      enableNoisyMicDetection?: boolean;
      enableTalkWhileMuted?: boolean;
      enableLipSync?: boolean;
    }
  
    interface ConnectionOptions {
      hosts?: {
        domain?: string;
        muc?: string;
        focus?: string;
      };
      bosh?: string;
      websocket?: string;
      serviceUrl?: string;
      clientNode?: string;
    }
  
    interface ConferenceOptions {
      openBridgeChannel?: boolean | string;
      recordingType?: string;
      callStatsConfIDPrefix?: string;
      enableTalkWhileMuted?: boolean;
      ignoreStartMuted?: boolean;
      startAudioMuted?: boolean;
      startVideoMuted?: boolean;
    }
  
    interface TrackOptions {
      devices?: string[];
      resolution?: number;
      constraints?: MediaStreamConstraints;
      cameraDeviceId?: string;
      micDeviceId?: string;
      minFps?: number;
      maxFps?: number;
    }
  }
  
  declare interface Window {
    JitsiMeetJS: typeof JitsiMeetJS;
  }

  type JitsiTrack = {
    getType: () => string;
    getVideoType?: () => string;
    isLocal: () => boolean;
  };