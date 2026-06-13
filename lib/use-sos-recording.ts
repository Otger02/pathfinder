"use client";

/**
 * Shared SOS recording lifecycle hook.
 *
 * Single source of truth for the RecordingEngine wiring so every SOS entry
 * point (the chat overlay AND the floating SosButton on dashboard/cases/
 * documents) behaves identically: same write-ahead durability, same error
 * surfacing, same offline recovery.
 *
 * Client-side only.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { RecordingEngine, uploadChunkToServer } from "./recording-engine";
import { flushQueue } from "./recording-offline-queue";

export interface SosRecording {
  isRecording: boolean;
  chunksUploaded: number;
  audioOnly: boolean;
  elapsed: number;
  /** Permissions are being requested / engine is starting. */
  starting: boolean;
  /** Recording could not start (denied permission, no devices, etc.). */
  error: boolean;
  startRecording: (sosEventId?: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  clearError: () => void;
}

export function useSosRecording(): SosRecording {
  const [isRecording, setIsRecording] = useState(false);
  const [chunksUploaded, setChunksUploaded] = useState(0);
  const [audioOnly, setAudioOnly] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState(false);

  const engineRef = useRef<RecordingEngine | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRecording = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (engineRef.current) {
      await engineRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async (sosEventId?: string) => {
    if (engineRef.current?.getSession()?.status === "recording") return;

    setError(false);
    setStarting(true);

    const engine = new RecordingEngine();
    engineRef.current = engine;

    engine.setOnStateChange((state) => {
      setIsRecording(state.status === "recording");
      setAudioOnly(state.audioOnly);
      setChunksUploaded(state.chunksUploaded);
      if (state.status === "failed") {
        setStarting(false);
        setError(true);
      }
    });

    engine.setOnChunkUploaded((_idx, total) => {
      setChunksUploaded(total);
    });

    engine.setOnError(() => {
      setStarting(false);
      setError(true);
    });

    const started = await engine.start(sosEventId);
    setStarting(false);
    if (started) {
      setIsRecording(true);
      setError(false);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      setError(true);
    }
  }, []);

  const clearError = useCallback(() => setError(false), []);

  // Clean up engine + timer on unmount.
  useEffect(() => {
    return () => {
      if (engineRef.current) engineRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Recover any chunks left on the device by a previous session (app killed,
  // battery died, or no signal mid-recording). This is the only retry path on
  // iOS, which lacks Background Sync.
  useEffect(() => {
    flushQueue(uploadChunkToServer).catch(() => {});
  }, []);

  return {
    isRecording,
    chunksUploaded,
    audioOnly,
    elapsed,
    starting,
    error,
    startRecording,
    stopRecording,
    clearError,
  };
}
