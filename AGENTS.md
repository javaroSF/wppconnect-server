# AGENTS.md

## Goal

Investigate an account-specific WPPConnect send failure without changing production behavior.

## Rules

- Never modify production semantics during the first phase.
- Prefer additive changes (logging, debug endpoints).
- All diagnostics must be isolated behind development mode or a dedicated debug route.
- Do not remove existing retry logic.
- Do not refactor unrelated code.
- Do not upgrade dependencies in the diagnostic branch.
- Preserve existing API contracts.

## Branches

Phase 1:
debug/amla-send-failure

Phase 2:
test/wppconnect-upgrade

## Investigation Order

1. Reproduce locally.
2. Compare working account vs failing account.
3. Add logging around sendText().
4. Create a raw debug endpoint.
5. Trace sendText implementation.
6. Locate where isSendFailure is generated.
7. Inspect WA Web version handling.
8. Only after root cause is understood, consider fixes.

## Logging

Capture:

- recipient
- formatted recipient
- isLid
- typeof phone
- Array.isArray(phone)
- send duration
- returned id
- returned ack
- returned isSendFailure
- returned chatId
- returned to
- stack trace for thrown exceptions

## Things to Compare

Working account:

- Phone
- LID

Failing account:

- Phone
- LID

## Deliverables

- Root cause analysis
- Exact file changes
- Minimal diff
- Rollback instructions
- Confidence ranking

## Important

Do not assume the controller is the bug simply because one account fails.

The same endpoint successfully sends messages from other WhatsApp accounts.

Treat the problem as account/session/WA-JS specific until evidence proves otherwise.
