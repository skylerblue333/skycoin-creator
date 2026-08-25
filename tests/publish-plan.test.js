const assert = require("node:assert/strict");
const { buildPublicationPlan, findPublicationConflicts } = require("../dist/index");

const plan = buildPublicationPlan([
  { id: "b", title: " Later ", channels: ["Web", "web"], publishAt: "2026-08-25T12:00:00Z" },
  { id: "a", title: "First", channels: ["mobile"], publishAt: "2026-08-25T10:00:00Z" },
  { id: "c", title: "Conflict", channels: ["web"], publishAt: "2026-08-25T12:00:00Z" },
]);

assert.deepEqual(plan.map((item) => item.id), ["a", "b", "c"]);
assert.equal(plan[1].title, "Later");
assert.deepEqual(plan[1].channels, ["web"]);
assert.equal(plan[1].publishAt, "2026-08-25T12:00:00.000Z");

assert.deepEqual(findPublicationConflicts(plan), [
  { channel: "web", publishAt: "2026-08-25T12:00:00.000Z", draftIds: ["b", "c"] },
]);

assert.throws(() => buildPublicationPlan([{ id: "", title: "x", channels: ["web"], publishAt: "2026-08-25T10:00:00Z" }]), /draft id/);
assert.throws(() => buildPublicationPlan([{ id: "x", title: " ", channels: ["web"], publishAt: "2026-08-25T10:00:00Z" }]), /title/);
assert.throws(() => buildPublicationPlan([{ id: "x", title: "x", channels: [], publishAt: "2026-08-25T10:00:00Z" }]), /channels/);
assert.throws(() => buildPublicationPlan([{ id: "x", title: "x", channels: ["bad channel"], publishAt: "2026-08-25T10:00:00Z" }]), /channel/);
assert.throws(() => buildPublicationPlan([{ id: "x", title: "x", channels: ["web"], publishAt: "invalid" }]), /publishAt/);
assert.throws(() => buildPublicationPlan([
  { id: "x", title: "x", channels: ["web"], publishAt: "2026-08-25T10:00:00Z" },
  { id: "x", title: "y", channels: ["web"], publishAt: "2026-08-25T11:00:00Z" },
]), /duplicate draft id/);

console.log("publication plan tests passed");
