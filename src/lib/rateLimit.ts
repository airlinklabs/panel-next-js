const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // cleanup every 5 minutes

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private map = new Map<string, RateLimitEntry>();
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {
    // Periodically purge expired entries to prevent memory leak
    this.timer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
    // Allow process to exit even if timer is active
    if (typeof (this.timer as unknown as { unref?: () => void }).unref === 'function') {
      (this.timer as unknown as { unref: () => void }).unref();
    }
  }

  check(key: string): boolean {
    const now = Date.now();
    const entry = this.map.get(key);

    if (!entry || entry.resetAt < now) {
      this.map.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (entry.count >= this.maxRequests) return false;

    entry.count++;
    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.map) {
      if (entry.resetAt < now) this.map.delete(key);
    }
  }
}
