---
name: Generated client DOM iterable requirement
description: The generated React API client uses Headers.entries and needs dom.iterable in its TypeScript lib settings.
---

The shared generated client TypeScript config must include both `dom` and `dom.iterable` libraries because the generated fetch helper reads `Headers.entries()`.

**Why:** Code generation succeeds but the workspace typecheck otherwise fails on the standard Fetch API type.

**How to apply:** When a new workspace is scaffolded or generated client types are refreshed, check the client library configuration before debugging generated-code errors.