/** Browser mic constraints for clearer STT input */
export const VOICE_INPUT_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

export function getVoiceInputMediaStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: VOICE_INPUT_CONSTRAINTS,
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function pickRecorderMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function extensionForMime(mime: string): string {
  if (mime.includes("webm")) return ".webm";
  if (mime.includes("ogg")) return ".ogg";
  if (mime.includes("mp4")) return ".m4a";
  return ".webm";
}
