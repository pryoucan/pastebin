import { nowMs } from "./time_travel.js";
import { redis } from "../config/redis.config.js";

export const consumePaste =  async (id, req) => {
  const key = `paste:${id}`;
  const data = await redis.hgetall(key);

  if (!data.content) {
    return { error: "not_found" };
  }

  const now = nowMs(req);
  const expiresAt = data.expiresAtMs ? Number(data.expiresAtMs) : null;
  const maxViews = data.maxViews ? Number(data.maxViews) : null;
  const viewsUsed = Number(data.viewsUsed);

  if (expiresAt && now >= expiresAt) {
    return { error: "expired" };
  }

  if (maxViews !== null && viewsUsed >= maxViews) {
    return { error: "view_limit_exceeded" };
  }

  const newViews = await redis.hincrby(key, "viewsUsed", 1);

  if (maxViews !== null && newViews > maxViews) {
    await redis.hincrby(key, "viewsUsed", -1);
    return { error: "view_limit_exceeded" };
  }

  return {
    content: data.content,
    remaining_views:
      maxViews === null ? null : maxViews - newViews,
    expires_at:
      expiresAt ? new Date(expiresAt).toISOString() : null,
  };
}
