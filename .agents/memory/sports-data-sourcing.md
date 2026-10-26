---
name: Sports data sourcing
description: Approved snapshot approach and limits encountered in public soccer data sources.
---

The user approved dated team snapshots covering all 22 soccer competitions, including international tournaments, rather than limiting coverage to domestic leagues.

**Why:** The product needs broad regional coverage even before a live provider is connected.

**How to apply:** Keep tournament editions, retrieval dates, and sources visible; do not present a captured participant list as a live roster or standings table.

Public provider coverage is uneven. TheSportsDB's old public test access is deprecated, its replacement test access returned capped league lists, and repeated badge searches encountered HTTP 429 even when paced. ESPN supplied broader team lists, but many CAF club records lacked crest images.

**Why:** A successful response or a missing badge does not establish complete provider coverage. Some failed lookups were throttling, not evidence that a club lacked a crest.

**How to apply:** Check statuses and completeness before accepting a feed as authoritative. Do not repeatedly bulk-query a throttled provider. Preserve explicit missing-badge states instead of substituting invented or unrelated club logos.
