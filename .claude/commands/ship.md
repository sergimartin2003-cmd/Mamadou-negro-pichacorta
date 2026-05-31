# /ship — full pipeline for a new feature

Run these steps in order. Parallel where indicated.

## Step 1 — Explore (explorer)
Use explorer agent to map the codebase area relevant to: $ARGUMENTS

## Step 2 — Implement (implementer)
Use implementer agent with explorer output as context.
Task: $ARGUMENTS

## Step 3 — Review + Test (parallel)
Run reviewer and tester agents IN PARALLEL on the changed files.

## Step 4 — Gate
If reviewer returns BLOCKER or tester returns FAILING:
  → Return to implementer with the exact findings. Do not proceed.
If security-sensitive code was changed:
  → Run security agent before continuing.

## Step 5 — Document (documenter)
Run documenter on changed public APIs only.

## Step 6 — Commit (devops)
Run devops agent to commit with conventional commit message.

Report final summary: files changed, tests passed, issues found/fixed.
