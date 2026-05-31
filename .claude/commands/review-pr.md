# /review-pr — full PR review pipeline

Run ALL of these agents IN PARALLEL on the diff/changed files: $ARGUMENTS

1. reviewer — code quality
2. security — vulnerabilities  
3. tester — missing test coverage

Synthesize results into:
```
VERDICT: approve / request-changes / blocked
BLOCKERS: [list]
REQUIRED: [must fix]
OPTIONAL: [nice to have]
```
