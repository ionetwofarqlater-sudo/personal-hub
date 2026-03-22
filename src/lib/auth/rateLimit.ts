type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function now() {
  return Date.now();
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export function takeRateLimitToken(input: {
  key: string;
  maxRequests: number;
  windowMs: number;
}) {
  const currentTime = now();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= currentTime) {
    const next: Bucket = {
      count: 1,
      resetAt: currentTime + input.windowMs,
    };
    buckets.set(input.key, next);
    return {
      allowed: true,
      remaining: Math.max(0, input.maxRequests - 1),
      retryAfterSec: Math.ceil(input.windowMs / 1000),
    };
  }

  if (existing.count >= input.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(input.key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, input.maxRequests - existing.count),
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000)),
  };
}
