/**
 * Type definitions for the SOS recording system.
 */

export interface RecordingSession {
  sessionId: string;
  recordingId: string | null;
  sosEventId: string | null;
  status:
    | "requesting_permission"
    | "recording"
    | "uploading"
    | "completed"
    | "failed"
    | "interrupted";
  startedAt: Date;
  chunkIndex: number;
  chunksUploaded: number;
  hashChain: string;
  gpsLat: number | null;
  gpsLon: number | null;
  audioOnly: boolean;
}

export interface ChunkUploadPayload {
  sessionId: string;
  chunkIndex: number;
  blob: Blob;
  sha256: string;
  chainHash: string;
  durationMs: number;
  timestamp: string;
  gpsLat?: number;
  gpsLon?: number;
}

export interface RecordingConfig {
  /** Chunk interval in ms (default 5000 = 5 seconds) */
  chunkIntervalMs: number;
  /** Video bitrate in bps (default 500000 = 500kbps) */
  videoBitsPerSecond: number;
  /** Audio bitrate in bps (default 64000 = 64kbps) */
  audioBitsPerSecond: number;
  /** Max recording duration in ms (default 1800000 = 30 minutes) */
  maxDurationMs: number;
  /** Preferred MIME type for MediaRecorder */
  preferredMimeType: string;
}

export const DEFAULT_RECORDING_CONFIG: RecordingConfig = {
  chunkIntervalMs: 5000,
  videoBitsPerSecond: 500_000,
  audioBitsPerSecond: 64_000,
  maxDurationMs: 30 * 60 * 1000,
  preferredMimeType: "video/webm;codecs=vp9,opus",
};
