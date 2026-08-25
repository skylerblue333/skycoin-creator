# Sky Publish Plan

A deterministic TypeScript publication-planning primitive for creator workflows in the SKYCOIN4444 portfolio.

**Status: engineering beta.** This is not a social network, creator monetization platform, automated posting service, payment system, or deployed scheduler.

## Implemented behavior

`buildPublicationPlan()` validates and normalizes bounded publication drafts, lowercases/deduplicates channel identifiers, canonicalizes timestamps, and sorts drafts by publication time then ID. `findPublicationConflicts()` reports drafts targeting the same channel at the same instant.

```ts
import { buildPublicationPlan, findPublicationConflicts } from "skycoin4444-publish-plan";

const plan = buildPublicationPlan([
  { id: "launch", title: "Launch", channels: ["web", "mobile"], publishAt: "2026-08-25T12:00:00Z" },
]);
const conflicts = findPublicationConflicts(plan);
```

Validation rejects duplicate IDs, invalid/empty titles, empty or malformed channel lists, unsupported channel identifiers, invalid timestamps, and oversized batches.

## Verification

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm audit --audit-level=high
pnpm pack
```

GitHub Actions performs real typecheck, tests, dependency audit, and package-smoke verification on Node.js 22. Previous scripts that only echoed successful build/test/lint results were removed.

There is intentionally no Docker/database/JWT deployment surface because the current product is a reusable planning library.

## Scope and limitations

This package does not publish content, call third-party APIs, authenticate users, store drafts, execute schedules, retry failures, moderate content, process payments, manage rights/licensing, or provide analytics. It only prepares and checks deterministic publication plans.

Historical experiment files remain in the repository for history but are excluded from the supported package build.

SKYCOIN4444 creator applications should place provider-specific posting, credentials, persistence, payments, moderation, and scheduling execution behind separate adapters.

## License

MIT, subject to the checked-in license and applicable third-party licenses.
