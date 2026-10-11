/**
 * Detector de valores de relleno (CA-120). Un identificador o dato de contacto de prueba
 * no debe llegar al sitio público.
 */

const PLACEHOLDER_WORDS =
  /ejemplo|example|pendiente|placeholder|lorem|por\s+definir|sin\s+definir|por\s+confirmar|a\s+confirmar|\btbd\b|\bn\/?[ad]\b|\bxx+|\bficticio|\bfalso\b|\bdummy\b|\btest\b|\bprueba\b/i;

const SEQUENCE = '01234567890';
const SEQUENCE_REVERSED = '09876543210';

/** `true` si el valor parece de relleno: vacío, palabras marcadoras, ceros, repeticiones o secuencias. */
export function isPlaceholder(value: string): boolean {
  const text = value.trim();
  if (text === '') return true;
  if (PLACEHOLDER_WORDS.test(text)) return true;

  const digits = text.replace(/\D/g, '');
  if (digits.length >= 3) {
    if (/^(\d)\1+$/.test(digits)) return true; // 000, 1111111
    if (SEQUENCE.includes(digits) || SEQUENCE_REVERSED.includes(digits)) return true; // 123456
  }
  return false;
}
