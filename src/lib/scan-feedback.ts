/**
 * A short tone for a scan: high for "added", low for "not that".
 *
 * An operator scanning a stack is looking at the paper, not the screen, and a
 * handheld scanner's own beep only says the barcode was *read* — not that it
 * was a challan, or that it was not already on the lorry. Two tones answer that
 * without anybody looking up.
 *
 * The Web Audio API, created lazily on the first scan (which is a user gesture,
 * so the browser allows it), and silent if the platform refuses — a missing
 * beep must never be an error.
 *
 * Moved out of `features/delivery/` alongside the wedge itself when the Walton
 * Labour Bill wanted the same two tones: an operator scanning a stack of
 * challans onto a labour bill is looking at the paper there too.
 */

let context: AudioContext | null = null

export function scanTone(kind: 'ok' | 'warn'): void {
  try {
    context ??= new AudioContext()

    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = kind === 'ok' ? 1320 : 330
    gain.gain.setValueAtTime(0.08, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + (kind === 'ok' ? 0.12 : 0.3))

    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + (kind === 'ok' ? 0.12 : 0.3))
  } catch {
    // No audio device, or a browser that refuses — the toast still says it.
  }
}
