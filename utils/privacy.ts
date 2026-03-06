/**
 * Privacy utilities for masking sensitive personal information.
 * Applied on server-side / public views to protect living members' data.
 */

/**
 * Masks the last name segment of a Vietnamese full name.
 * e.g. "Đoàn Minh Tuấn" → "Đoàn Minh T**n"
 * If the name has only one word, returns first char + "***".
 */
export function maskName(fullName: string): string {
  if (!fullName) return fullName;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    const w = parts[0];
    if (w.length <= 2) return w[0] + "*";
    return w[0] + "*".repeat(w.length - 2) + w[w.length - 1];
  }
  const last = parts[parts.length - 1];
  const masked =
    last.length <= 2
      ? last[0] + "*"
      : last[0] + "*".repeat(last.length - 2) + last[last.length - 1];
  return [...parts.slice(0, -1), masked].join(" ");
}

/**
 * Masks the last 4 digits of a phone number.
 * e.g. "0912345678" → "090123****"
 * Returns the original if shorter than 8 chars.
 */
export function maskPhone(phone: string): string {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return phone;
  return phone.slice(0, phone.length - 4) + "****";
}

/**
 * Returns whether a person's data should be masked in the public view.
 * Deceased → never mask (always public).
 * Living with privacy_level 'public' → no mask.
 * Otherwise → mask.
 */
export function shouldMask(isDeceased: boolean, privacyLevel?: string | null): boolean {
  if (isDeceased) return false;
  if (privacyLevel === "public") return false;
  return true;
}
