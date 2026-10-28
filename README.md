# Project Documentation Guide

This repository uses a set of project documents to give the AI coding agent and human developers a shared, verifiable plan. **Treat the documents as the source of truth. Do not invent requirements, architecture, schemas, flows, or design decisions that are not supported by the documentation or existing code.**

## 1. Documents and when to use them

| Document | Primary purpose | Read it when… | Use it to… |
|---|---|---|---|
| `PRD.md` — Product Requirements Document | Defines **what** the product should do and **why**. | Starting work on the project, planning a feature, or clarifying expected behaviour. | Confirm goals, scope, user roles, functional and non-functional requirements, exclusions, and acceptance criteria. |
| `AFD.md` — Application Flow Document | Defines how users move through the application and how it responds to actions. | Building or changing a screen, route, form, navigation item, or multi-step interaction. | Follow user journeys, screen transitions, decision points, permissions, loading/empty/success/error states, and edge cases. |
| `DBD.md` — Design Brief Document | Defines the intended visual direction and user-experience rules. | Creating or modifying UI, layouts, components, styling, or responsive behaviour. | Follow brand direction, typography, colour, spacing, layout, accessibility, responsive rules, and any linked design references. |
| `TRD.md` — Technical Requirements Document | Defines technical constraints, architecture, technology choices, integrations, security, and quality requirements. | Choosing how to implement a feature, changing system structure, adding a dependency, integrating a service, or touching security/performance. | Follow the approved stack, architecture boundaries, API conventions, authentication/authorization, security requirements, and deployment constraints. |
| `BSD.md` — Backend Schema Document | Defines backend data structures and relationships. | Creating or changing database tables, migrations, models, validation, queries, or data-related API contracts. | Follow entities, fields, data types, keys, relationships, constraints, indexes, status values, and data lifecycle rules. |
| `IPD.md` — Implementation Plan Document | Turns the approved requirements and designs into ordered, testable tasks. | Before starting a task, choosing what to do next, tracking progress, or deciding whether a phase is complete. | Select the next task, respect dependencies, implement in small increments, run required tests, and record completion or blockers. |

> **Naming note:** These acronyms can vary between teams. In this repository, use the meanings defined in this guide.

## 2. Recommended workflow

### Before implementing any task

1. Read `IPD.md` and identify the exact task, its dependencies, and its completion criteria.
2. Read `PRD.md` to understand the user need, scope, and acceptance criteria relevant to the task.
3. Read the task-relevant document(s):
   - User journey, screen, route, or interaction → `AFD.md`
   - UI appearance or responsive behaviour → `DBD.md`
   - Architecture, API, integration, security, or technical choice → `TRD.md`
   - Data model, migration, database query, or backend entity → `BSD.md`
4. Inspect the existing code and tests before editing. Verify actual file paths, framework versions, conventions, and current behaviour rather than assuming them from documentation alone.
5. If documents disagree with one another or with the code, stop before making a consequential assumption. Report the conflict and ask for clarification, or propose a clearly labelled resolution for approval.

### During implementation

- Work on **one IPD task or a small, tightly related group of tasks at a time**.
- Keep changes within the task's scope. Avoid unrelated refactors, new features, dependency upgrades, or stylistic rewrites.
- Use existing project patterns when they are consistent with the approved requirements.
- Do not invent API endpoints, environment variables, database fields, packages, credentials, design assets, or business rules.
- If an implementation detail is missing, first inspect the repository and relevant documents. If it remains unknown and affects correctness, security, data integrity, or user-visible behaviour, ask for clarification rather than guessing.
- If a necessary decision is low-risk and reversible, state the assumption explicitly, keep it minimal, and document it for review. Never present an assumption as an approved requirement.
- Never expose secrets. Do not place credentials or real tokens in source code, logs, documentation, or example configuration.
- Follow security best practices for authentication, authorization, input validation, output encoding, error handling, and sensitive data.
- Do not claim a command, test, build, migration, or manual check succeeded unless it was actually run and its result was inspected.

### After implementing a task

1. Run the checks relevant to the change, using the project's documented commands and available tooling.
2. Review the diff for accidental changes, hard-coded secrets, unrelated edits, incomplete error handling, and mismatches with the documents.
3. Compare the result against the task's acceptance criteria.
4. Update `IPD.md` only when the task's status genuinely changes. Record incomplete work, failed checks, and blockers honestly.
5. Update the relevant specification when an approved implementation decision changes the intended behaviour, architecture, design, or schema. Keep related documents consistent.
6. Summarize what changed, which files were affected, which checks were run and their actual results, and any remaining uncertainty.

## 3. Source-of-truth and conflict rules

Use this precedence as a **conflict-handling process**, not permission to silently ignore documents:

1. **Explicit user/project-owner decisions** made for the current task.
2. **Approved requirements and decisions** recorded in project documentation.
3. **Existing implementation and tests** as evidence of current behaviour—not automatic proof that the behaviour is intended.
4. **Established framework or library documentation** for verified technical facts.
5. **Agent assumptions** only as a last resort for low-risk, reversible details, clearly labelled as assumptions.

If two approved sources conflict, or existing code conflicts with an approved requirement, **do not silently choose one**. Explain the conflict, identify the affected files or behaviours, and request a decision before making a high-impact change. Where work can safely proceed independently, continue only with the unaffected portion.

## 4. Preventing hallucinations and unsupported changes

The agent must:

- **Ground claims in evidence.** Before referring to a file, function, route, table, package, command, or configuration value, inspect it or verify it from a reliable project source.
- **Distinguish facts from assumptions.** Label unknowns and assumptions explicitly; never fabricate details to make a plan appear complete.
- **Verify before acting.** Check the repository, lockfiles, migrations, tests, and configuration before deciding how something works.
- **Avoid speculative implementation.** Do not create placeholder integrations, fake data flows, invented API contracts, or pretend a feature is complete when dependencies are missing.
- **Ask targeted questions.** Ask only when an unresolved detail materially affects the implementation; include the options and trade-offs when useful.
- **Preserve scope.** Implement the requested task, not an imagined broader redesign.
- **Keep documentation and code aligned.** Propose documentation changes when requirements change; do not silently rewrite the plan to justify a code change.
- **Report uncertainty honestly.** State what could not be verified and what remains to be done.

## 5. Definition of done

An IPD task is complete only when all applicable conditions are met:

- The implementation matches the relevant PRD acceptance criteria.
- Relevant AFD flows and states are handled.
- Relevant DBD design and accessibility rules are followed.
- Relevant TRD architecture, security, and technical constraints are respected.
- Relevant BSD schema and data-integrity rules are respected.
- Applicable tests, linting, type checks, builds, or manual verification have been run and their results checked.
- No unrelated changes or known unresolved regressions have been introduced.
- Documentation and task status are updated where needed.
- Remaining limitations, assumptions, and follow-up work are reported.

If a required check cannot be run, do **not** mark the task fully verified. State the reason and mark it as blocked or partially verified.

## 6. Task-to-document quick reference

| If the task is… | Start with… | Also consult… |
|---|---|---|
| Adding a new product feature | `IPD.md`, `PRD.md` | `AFD.md`, `TRD.md`, `BSD.md`, `DBD.md` as relevant |
| Changing navigation or a user journey | `IPD.md`, `AFD.md` | `PRD.md`, `DBD.md` |
| Building or restyling a page/component | `IPD.md`, `DBD.md` | `AFD.md`, `PRD.md`, `TRD.md` as relevant |
| Adding/changing an API or integration | `IPD.md`, `TRD.md` | `PRD.md`, `BSD.md`, `AFD.md` as relevant |
| Changing tables, fields, relationships, or migrations | `IPD.md`, `BSD.md` | `TRD.md`, `PRD.md`, relevant tests |
| Fixing a bug | `IPD.md`, relevant feature requirements | Relevant `AFD.md`, `TRD.md`, `BSD.md`, and tests |
| Deploying or changing infrastructure | `IPD.md`, `TRD.md` | Environment/deployment docs and release checks |
| Updating a requirement or scope | `PRD.md` first | Update all affected documents and `IPD.md` after approval |

## 7. Working principles

1. **Plan before coding.**
2. **Inspect before assuming.**
3. **Verify before claiming success.**
4. **Ask instead of inventing high-impact decisions.**
5. **Make the smallest change that satisfies the requirement.**
6. **Test and report honestly.**
7. **Keep the plan, documentation, and implementation aligned.**

These documents guide implementation; they do not replace repository inspection, testing, code review, or explicit approval for consequential product and architecture decisions.
