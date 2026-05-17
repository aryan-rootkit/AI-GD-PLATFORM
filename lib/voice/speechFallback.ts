/** Browser TTS when Piper audio is unavailable */
export function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("Browser speech failed"));
    window.speechSynthesis.speak(utterance);
  });
}
