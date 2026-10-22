/**
 * WhatsApp Instant Launch Helper for Ticket2Grow
 * Bypasses the slow intermediary "Continue to Chat" landing page (wa.me)
 * and directly launches the Windows WhatsApp Desktop App, Mobile App, or WhatsApp Web.
 */

export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    return "94" + cleaned.substring(1);
  }
  if (cleaned.startsWith("94")) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Returns direct WhatsApp Web link (bypasses the wa.me "Continue to Chat" page)
 */
export function getWhatsAppWebUrl(phone: string, message: string = ""): string {
  const formatted = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);
  return `https://web.whatsapp.com/send?phone=${formatted}&text=${encoded}`;
}

/**
 * Returns native Windows / Mac / Mobile WhatsApp App protocol URI (whatsapp://)
 */
export function getWhatsAppAppUri(phone: string, message: string = ""): string {
  const formatted = formatWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);
  return `whatsapp://send?phone=${formatted}&text=${encoded}`;
}

/**
 * Default direct link for standard anchor tags
 */
export function getWhatsAppDirectUrl(phone: string, message: string = ""): string {
  return getWhatsAppWebUrl(phone, message);
}

/**
 * Synchronously opens WhatsApp Web in a new tab.
 * Executes immediately in the user gesture call stack so it is NEVER blocked by browser popup blockers.
 */
export function openWhatsAppWebDirect(phone: string, message: string = "") {
  if (typeof window === "undefined") return;
  const url = getWhatsAppWebUrl(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Directly launches the native Windows / Mac / Mobile WhatsApp application.
 */
export function openWhatsAppAppDirect(phone: string, message: string = "") {
  if (typeof window === "undefined") return;
  const uri = getWhatsAppAppUri(phone, message);
  window.location.href = uri;
}
