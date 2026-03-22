export function isSupabaseEmailRateLimitError(message?: string | null) {
  if (!message) return false;
  return /email\s*rate\s*limit\s*exceeded|over_email_send_rate_limit/i.test(message);
}

export function getSupabaseRateLimitHint() {
  return "Ліміт листів тимчасово вичерпано. Перевір вже надісланий код або спробуй трохи пізніше.";
}
