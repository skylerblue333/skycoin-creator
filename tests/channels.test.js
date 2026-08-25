const assert = require("node:assert/strict");
const { ChannelRegistry, normalizeChannel } = require("../dist/index.js");

const registry = new ChannelRegistry();
const created = registry.create({ id: "chan:news", ownerId: "user:1", title: "  News Desk  ", visibility: "public", tags: ["News", "updates", "news"] });
assert.deepEqual(created, { id: "chan:news", ownerId: "user:1", title: "News Desk", visibility: "public", tags: ["news", "updates"], publishingPerformed: false });
assert.equal(registry.get("chan:news").title, "News Desk");
assert.deepEqual(registry.listPublic().map((channel) => channel.id), ["chan:news"]);
registry.create({ id: "chan:private", ownerId: "user:1", title: "Private", visibility: "private" });
assert.equal(registry.get("chan:private"), null);
assert.equal(registry.get("chan:private", "user:1").id, "chan:private");
assert.throws(() => registry.create({ id: "chan:news", ownerId: "user:2", title: "Other", visibility: "public" }), /duplicate channel id/);
assert.throws(() => normalizeChannel({ id: "bad id", ownerId: "user:1", title: "Bad", visibility: "public" }), /bounded identifier/);
assert.throws(() => normalizeChannel({ id: "chan:x", ownerId: "user:1", title: " ", visibility: "public" }), /1-120/);
console.log("SkyChannels contract tests passed");
