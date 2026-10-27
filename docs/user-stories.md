# User stories / task board

| ID | Story | Acceptance evidence | Status |
|---|---|---|---|
| US-1 | As a shelf clerk, I can view lot-to-shelf stock | GET /lots and /stock | Implemented |
| US-2 | As a recall officer, I can recall a specific supplier lot | POST /recall emits LotRecalled | Implemented |
| US-3 | As a workflow auditor, I can inspect persisted recall events | GET /workflow | Implemented |
| US-4 | As a security reviewer, I can reject unauthorized calls | JWT and role checks | Implemented, test evidence needed |
| US-5 | As a recall coordinator, I can see quarantined quantities and reconcile removal counts | Stock quarantine + reconciliation | TODO |

## Retrospective template

- What worked: service boundaries, event envelope, local repeatable setup.
- What needs improvement: implement stock quarantine/removal reconciliation, full automated contract tests, true TLS demo, and measured load results.
- Action owners: assign one owner per story; attach test output and screenshot before review.
