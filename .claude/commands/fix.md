# /fix — fast bug fix pipeline

1. explorer: find root cause of: $ARGUMENTS
2. implementer: fix only the root cause. No refactoring.
3. tester: add regression test for this exact bug.
4. devops: commit as `fix(<scope>): $ARGUMENTS`
