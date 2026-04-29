/**
 * Browser media permission utilities for SOS recording.
 * Client-side only — do not import from server code.
 */

export interface MediaSupport {
  camera: boolean;
  microphone: boolean;
  mediaRecorder: boolean;
  supportedMimeType: string | null;
}

/** MIME types in preference order */
const MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

/**
 * Feature-detect browser media capabilities.
 */
export function checkMediaSupport(): MediaSupport {
  const hasMediaDevices =
    typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const hasMediaRecorder = typeof MediaRecorder !== "undefined";

  let supportedMimeType: string | null = null;
  if (hasMediaRecorder) {
    for (const mime of MIME_CANDIDATES) {
      if (MediaRecorder.isTypeSupported(mime)) {
        supportedMimeType = mime;
        break;
      }
    }
  }

  return {
    camera: hasMediaDevices,
    microphone: hasMediaDevices,
    mediaRecorder: hasMediaRecorder && supportedMimeType !== null,
    supportedMimeType,
  };
}

/**
 * Get the best supported MIME type for recording.
 * Returns video type first, falls back to audio-only.
 */
export function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  for (const mime of MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "video/webm";
}

/**
 * Request camera + audio permissions. Falls back to audio-only if camera denied.
 */
export async function requestMediaPermissions(
  preferVideo: boolean = true
): Promise<{
  stream: MediaStream | null;
  audioOnly: boolean;
  error: string | null;
}> {
  if (!navigator.mediaDevices?.getUserMedia) {
    return { stream: null, audioOnly: false, error: "Media devices not supported" };
  }

  // Try video + audio first
  if (preferVideo) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true,
      });
      return { stream, audioOnly: false, error: null };
    } catch {
      // Camera denied — try audio only
    }
  }

  // Fallback: audio only
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return { stream, audioOnly: true, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Permission denied";
    return { stream: null, audioOnly: false, error: message };
  }
}
