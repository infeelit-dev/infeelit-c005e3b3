export function pickLiveRecorderMime(): string | undefined {
  const types = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  if (typeof MediaRecorder === "undefined") return undefined;
  return types.find((t) => MediaRecorder.isTypeSupported(t));
}

export function pickAudioRecorderMime(): string | undefined {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
  if (typeof MediaRecorder === "undefined") return undefined;
  return types.find((t) => MediaRecorder.isTypeSupported(t));
}
