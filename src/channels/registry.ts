export type ChannelVisibility = "public" | "unlisted" | "private";

export interface CreatorChannel {
  id: string;
  ownerId: string;
  title: string;
  visibility: ChannelVisibility;
  tags?: string[];
}

export interface ChannelSnapshot extends CreatorChannel {
  tags: string[];
  publishingPerformed: false;
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,95}$/;
const MAX_CHANNELS = 500;
const MAX_TAGS = 20;

function assertId(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !ID.test(value)) throw new TypeError(`${field} must be a bounded identifier`);
}

export function normalizeChannel(channel: CreatorChannel): ChannelSnapshot {
  if (!channel || typeof channel !== "object") throw new TypeError("channel is required");
  assertId(channel.id, "channel.id");
  assertId(channel.ownerId, "channel.ownerId");
  if (typeof channel.title !== "string" || channel.title.trim().length < 1 || channel.title.trim().length > 120) throw new TypeError("channel.title must contain 1-120 characters");
  if (!(["public", "unlisted", "private"] as const).includes(channel.visibility)) throw new TypeError("channel.visibility is invalid");
  const tags = channel.tags ?? [];
  if (!Array.isArray(tags) || tags.length > MAX_TAGS) throw new TypeError(`channel.tags may contain at most ${MAX_TAGS} entries`);
  const normalizedTags = tags.map((tag, index) => {
    if (typeof tag !== "string") throw new TypeError(`channel.tags[${index}] must be a string`);
    const value = tag.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(value)) throw new TypeError(`channel.tags[${index}] is invalid`);
    return value;
  });
  return { id: channel.id, ownerId: channel.ownerId, title: channel.title.trim(), visibility: channel.visibility, tags: [...new Set(normalizedTags)].sort(), publishingPerformed: false };
}

export class ChannelRegistry {
  private readonly channels = new Map<string, ChannelSnapshot>();

  create(channel: CreatorChannel): ChannelSnapshot {
    if (this.channels.size >= MAX_CHANNELS) throw new RangeError(`registry capacity ${MAX_CHANNELS} reached`);
    const normalized = normalizeChannel(channel);
    if (this.channels.has(normalized.id)) throw new TypeError(`duplicate channel id: ${normalized.id}`);
    this.channels.set(normalized.id, normalized);
    return structuredClone(normalized);
  }

  get(id: string, requesterId?: string): ChannelSnapshot | null {
    assertId(id, "channel id");
    const channel = this.channels.get(id);
    if (!channel) return null;
    if (channel.visibility === "private" && requesterId !== channel.ownerId) return null;
    return structuredClone(channel);
  }

  listPublic(): ChannelSnapshot[] {
    return [...this.channels.values()].filter((channel) => channel.visibility === "public").sort((a, b) => a.id.localeCompare(b.id)).map((channel) => structuredClone(channel));
  }
}
