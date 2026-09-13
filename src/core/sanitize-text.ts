const MAX_CONTROL_CODE = 0x1f;
const DEL_CODE = 0x7f;

/**
 * Unicode bidi-control characters (LRE/RLE/LRO/RLO/PDF, LRM/RLM, and the
 * newer isolate controls). An extension name is attacker-controlled text
 * from the Chrome Web Store, and React's escaping only stops HTML/script
 * injection — it does nothing to stop these characters from visually
 * reordering a name (e.g. to disguise it as a different, trusted name) in
 * a tool whose entire purpose is accurately reporting on other extensions.
 */
const BIDI_CONTROL_CODES = new Set([
  0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069,
]);

/**
 * Strips control characters and Unicode bidi-override characters from
 * attacker-controlled extension metadata (name, description) before it is
 * rendered on screen or embedded in an exported report.
 */
export function sanitizeText(value: string | undefined): string {
  if (!value) return "";
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControlChar = code <= MAX_CONTROL_CODE || code === DEL_CODE;
    if (!isControlChar && !BIDI_CONTROL_CODES.has(code)) result += char;
  }
  return result.trim();
}
