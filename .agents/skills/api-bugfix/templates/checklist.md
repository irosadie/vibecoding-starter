# Checklist: API Bugfix

## Preparation

- [ ] Read `.agents/settings.json`
- [ ] Read `references/context.md`
- [ ] Write down the bug symptom or failing behavior

## Execution

- [ ] Root cause localized to the smallest layer
- [ ] Changes remain minimal touch
- [ ] Validator/DTO/schema/type/docs/OpenAPI updated when affected
- [ ] No unrelated refactor
- [ ] Reproduction or guard test added/updated

## Finalization

- [ ] Backend contract stays in sync
- [ ] `bun run openapi:generate` run if contract changed
- [ ] Lint/typecheck/relevant tests run
- [ ] No unrelated changes carried along
- [ ] All files end with a newline (EOF)
