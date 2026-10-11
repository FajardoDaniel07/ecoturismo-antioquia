/** Enlace y mensaje de WhatsApp (CA-36, CA-83). Es un enlace: funciona sin JavaScript. */

/** `phoneE164`: "+573127951683". Devuelve "https://wa.me/573127951683?text=…". */
export function buildWhatsAppUrl(phoneE164: string, message: string): string {
  const digits = phoneE164.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Mensaje inicial; en una página de detalle nombra el destino consultado (CA-36). */
export function whatsAppMessage(destinoName?: string): string {
  return destinoName
    ? `Hola, quiero información sobre la salida a ${destinoName}.`
    : 'Hola, quiero información sobre las salidas de Ecoturismo Antioquia.';
}

/** "+573127951683" -> "+57 312 795 1683" (CA-82). Otro formato se devuelve sin cambios. */
export function formatPhone(phoneE164: string): string {
  const m = /^\+57(\d{3})(\d{3})(\d{4})$/.exec(phoneE164);
  return m ? `+57 ${m[1]} ${m[2]} ${m[3]}` : phoneE164;
}
