/**
 * SOS Recording Engine.
 *
 * Captures video+audio (or audio-only fallback) via MediaRecorder,
 * splits into 5-second chunks, computes SHA-256 hash chains for
 * tamper detection, and uploads each chunk to the server.
 *
 * Client-side only.
 */

import type {
  RecordingSession,
  RecordingConfig,
  ChunkUploadPayload,
} from "./types/recording";
import { DEFAULT_RECORDING_CONFIG } from "./types/recording";
import { requestMediaPermissions, getPreferredMimeType } from "./media-permissions";
import { computeSha256, computeChainHash } from "./crypto/hash-chain";
import { enqueueChunk } from "./recording-offline-queue";

type StateCallback = (state: RecordingSession) => void;
type ChunkCallback = (chunkIndex: number, uploaded: number) => void;
type ErrorCallback = (error: string) => void;

export class RecordingEngine {
  private config: RecordingConfig;
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private session: RecordingSession | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private gpsWatchId: number | null = null;

  // Callbacks
  private onStateChange: StateCallback | null = null;
  private onChunkUploaded: ChunkCallback | null = null;
  private onError: ErrorCallback | null = null;

  constructor(config?: Partial<RecordingConfig>) {
    this.config = { ...DEFAULT_RECORDING_CONFIG, ...config };
    this.config.preferredMimeType = getPreferredMimeType();
  }

  /** Register state change callback */
  setOnStateChange(cb: StateCallback): void {
    this.onStateChange = cb;
  }

  /** Register chunk uploaded callback */
  setOnChunkUploaded(cb: ChunkCallback): void {
    this.onChunkUploaded = cb;
  }

  /** Register error callback */
  setOnError(cb: ErrorCallback): void {
    this.onError = cb;
  }

  /** Get current session state */
  getSession(): RecordingSession | null {
    return this.session ? { ...this.session } : null;
  }

  /** Start recording. Returns true if started successfully. */
  async start(sosEventId?: string): Promise<boolean> {
    if (this.session?.status === "recording") return true;

    const sessionId = crypto.randomUUID();

    this.session = {
      sessionId,
      recordingId: null,
      sosEventId: sosEventId || null,
      status: "requesting_permission",
      startedAt: new Date(),
      chunkIndex: 0,
      chunksUploaded: 0,
      hashChain: "",
      gpsLat: null,
      gpsLon: null,
      audioOnly: false,
    };
    this.emitState();

    // Request media permissions (camera + audio, fallback to audio-only)
    const { stream, audioOnly, error } = await requestMediaPermissions(true);
    if (!stream) {
      this.session.status = "failed";
      this.emitState();
      this.onError?.(error || "Permission denied");
      return false;
    }

    this.mediaStream = stream;
    this.session.audioOnly = audioOnly;

    // Request GPS (best effort)
    this.startGpsTracking();

    // Create server recording
    try {
      const resp = await fetch("/api/sos/recording/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          sosEventId: sosEventId || null,
          userCode: "web-anonymous",
          deviceInfo: {
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            audioOnly,
            mimeType: this.config.preferredMimeType,
          },
          gpsLat: this.session.gpsLat,
          gpsLon: this.session.gpsLon,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        this.session.recordingId = data.recordingId;
      }
    } catch {
      // Continue recording even if server creation fails — chunks will still upload
    }

    // Set up MediaRecorder
    const mimeType = this.config.preferredMimeType;
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: audioOnly ? undefined : this.config.videoBitsPerSecond,
      audioBitsPerSecond: this.config.audioBitsPerSecond,
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.handleChunk(event.data);
      }
    };

    this.mediaRecorder.onerror = () => {
      this.onError?.("MediaRecorder error");
      this.stop();
    };

    // Start recording with timeslice for chunking
    this.mediaRecorder.start(this.config.chunkIntervalMs);

    this.session.status = "recording";
    this.emitState();

    // Auto-stop after max duration
    this.maxTimer = setTimeout(() => {
      this.stop();
    }, this.config.maxDurationMs);

    return true;
  }

  /** Stop recording and finalize. */
  async stop(): Promise<void> {
    if (this.maxTimer) {
      clearTimeout(this.maxTimer);
      this.maxTimer = null;
    }

    this.stopGpsTracking();

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    // Release media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (!this.session) return;

    this.session.status = "uploading";
    this.emitState();

    // Finalize on server
    try {
      await fetch("/api/sos/recording/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.session.sessionId,
          finalChainHash: this.session.hashChain,
        }),
      });
    } catch {
      // Best effort
    }

    this.session.status = "completed";
    this.emitState();
    this.mediaRecorder = null;
  }

  /** Handle a single chunk from MediaRecorder */
  private async handleChunk(blob: Blob): Promise<void> {
    if (!this.session) return;

    const chunkIndex = this.session.chunkIndex;
    this.session.chunkIndex++;

    try {
      // Compute SHA-256 of the chunk
      const arrayBuffer = await blob.arrayBuffer();
      const sha256 = await computeSha256(arrayBuffer);

      // Compute chain hash
      const previousChain = this.session.hashChain || null;
      const chainHash = await computeChainHash(previousChain, sha256);
      this.session.hashChain = chainHash;

      const payload: ChunkUploadPayload = {
        sessionId: this.session.sessionId,
        chunkIndex,
        blob,
        sha256,
        chainHash,
        durationMs: this.config.chunkIntervalMs,
        timestamp: new Date().toISOString(),
        gpsLat: this.session.gpsLat ?? undefined,
        gpsLon: this.session.gpsLon ?? undefined,
      };

      // Try to upload
      const success = await this.uploadChunk(payload);
      if (success) {
        this.session.chunksUploaded++;
        this.onChunkUploaded?.(chunkIndex, this.session.chunksUploaded);
      } else {
        // Queue for offline retry
        await enqueueChunk(payload);
      }

      this.emitState();
    } catch (err) {
      this.onError?.(err instanceof Error ? err.message : "Chunk processing failed");
    }
  }

  /** Upload a single chunk to the server. Returns true on success. */
  private async uploadChunk(payload: ChunkUploadPayload): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append("file", payload.blob);
      formData.append("sessionId", payload.sessionId);
      formData.append("chunkIndex", String(payload.chunkIndex));
      formData.append("sha256", payload.sha256);
      formData.append("chainHash", payload.chainHash);
      formData.append("durationMs", String(payload.durationMs));
      formData.append("timestamp", payload.timestamp);
      if (payload.gpsLat !== undefined) formData.append("gpsLat", String(payload.gpsLat));
      if (payload.gpsLon !== undefined) formData.append("gpsLon", String(payload.gpsLon));

      const resp = await fetch("/api/sos/recording/chunk", {
        method: "POST",
        body: formData,
      });

      return resp.ok;
    } catch {
      return false;
    }
  }

  /** Start GPS tracking (best effort) */
  private startGpsTracking(): void {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (this.session) {
          this.session.gpsLat = pos.coords.latitude;
          this.session.gpsLon = pos.coords.longitude;
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );

    this.gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (this.session) {
          this.session.gpsLat = pos.coords.latitude;
          this.session.gpsLon = pos.coords.longitude;
        }
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000 }
    );
  }

  /** Stop GPS tracking */
  private stopGpsTracking(): void {
    if (this.gpsWatchId !== null) {
      navigator.geolocation.clearWatch(this.gpsWatchId);
      this.gpsWatchId = null;
    }
  }

  /** Emit state to callback */
  private emitState(): void {
    if (this.session && this.onStateChange) {
      this.onStateChange({ ...this.session });
    }
  }
}
