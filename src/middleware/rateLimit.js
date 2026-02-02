const calls = new Map();

export function rateLimit(req, next) {
  const key = req.context.userId;
  const now = Date.now();

  const record = calls.get(key) || { count: 0, ts: now };

  if (now - record.ts > 60_000) {
    record.count = 0;
    record.ts = now;
  }

  record.count += 1;
  calls.set(key, record);

  if (record.count > 60) {
    throw new Error("Rate limit exceeded for MCP usage");
  }

  return next(req);
}
