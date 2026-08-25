export type PublicationDraft = {
  id: string;
  title: string;
  channels: string[];
  publishAt: string;
};

export type PlannedPublication = {
  id: string;
  title: string;
  channels: string[];
  publishAt: string;
  publishAtEpochMs: number;
};

const MAX_DRAFTS = 10000;
const MAX_ID_LENGTH = 128;
const MAX_TITLE_LENGTH = 300;
const MAX_CHANNELS = 20;
const MAX_CHANNEL_LENGTH = 64;

export function buildPublicationPlan(drafts: PublicationDraft[]): PlannedPublication[] {
  if (!Array.isArray(drafts)) throw new TypeError("drafts must be an array");
  if (drafts.length > MAX_DRAFTS) throw new RangeError(`at most ${MAX_DRAFTS} drafts are allowed`);

  const ids = new Set<string>();
  const normalized = drafts.map((draft) => normalizeDraft(draft, ids));
  return normalized.sort(
    (left, right) => left.publishAtEpochMs - right.publishAtEpochMs || left.id.localeCompare(right.id),
  );
}

export function findPublicationConflicts(plan: PlannedPublication[]): Array<{
  channel: string;
  publishAt: string;
  draftIds: string[];
}> {
  if (!Array.isArray(plan)) throw new TypeError("plan must be an array");
  const groups = new Map<string, { channel: string; publishAt: string; draftIds: string[] }>();

  for (const item of plan) {
    for (const channel of item.channels) {
      const key = JSON.stringify([channel, item.publishAt]);
      const existing = groups.get(key) ?? { channel, publishAt: item.publishAt, draftIds: [] };
      existing.draftIds.push(item.id);
      groups.set(key, existing);
    }
  }

  return [...groups.values()]
    .filter((group) => group.draftIds.length > 1)
    .map((group) => ({ ...group, draftIds: [...group.draftIds].sort() }))
    .sort((left, right) => left.publishAt.localeCompare(right.publishAt) || left.channel.localeCompare(right.channel));
}

function normalizeDraft(draft: PublicationDraft, ids: Set<string>): PlannedPublication {
  if (typeof draft !== "object" || draft === null) throw new TypeError("draft must be an object");
  if (typeof draft.id !== "string" || draft.id.length === 0 || draft.id.length > MAX_ID_LENGTH) {
    throw new TypeError(`draft id must be 1-${MAX_ID_LENGTH} characters`);
  }
  if (ids.has(draft.id)) throw new TypeError(`duplicate draft id: ${draft.id}`);
  ids.add(draft.id);

  if (typeof draft.title !== "string" || draft.title.trim().length === 0 || draft.title.length > MAX_TITLE_LENGTH) {
    throw new TypeError(`title must be 1-${MAX_TITLE_LENGTH} characters`);
  }
  if (!Array.isArray(draft.channels) || draft.channels.length === 0 || draft.channels.length > MAX_CHANNELS) {
    throw new TypeError(`channels must contain 1-${MAX_CHANNELS} entries`);
  }

  const channels = [...new Set(draft.channels.map(normalizeChannel))].sort();
  const publishAtEpochMs = Date.parse(draft.publishAt);
  if (!Number.isFinite(publishAtEpochMs)) throw new TypeError("publishAt must be an ISO-compatible date string");
  const publishAt = new Date(publishAtEpochMs).toISOString();

  return {
    id: draft.id,
    title: draft.title.trim(),
    channels,
    publishAt,
    publishAtEpochMs,
  };
}

function normalizeChannel(channel: string): string {
  if (typeof channel !== "string") throw new TypeError("channel must be a string");
  const normalized = channel.trim().toLowerCase();
  if (normalized.length === 0 || normalized.length > MAX_CHANNEL_LENGTH || !/^[a-z0-9][a-z0-9._-]*$/.test(normalized)) {
    throw new TypeError("channel contains unsupported characters or length");
  }
  return normalized;
}
