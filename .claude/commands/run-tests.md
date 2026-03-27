Run the tests for the CampusHub project and report the results.

## Backend tests

Run from the backend directory:
```bash
cd backend/backend && ./gradlew test
```

The backend uses JUnit 5 + Mockito. Tests are pure unit tests — no running database or Spring context is required. The H2 in-memory database is available on the test classpath for any tests that do need JPA.

After running, check the Gradle test output. If there are failures:
1. Identify whether the failure is in a service, model, or repository test
2. Read the failing test and the corresponding source file to understand the expected behaviour
3. Explain the root cause and suggest a fix — but do not modify test assertions to make tests pass artificially

## Frontend lint check

The frontend has no automated test suite currently. Run ESLint as a proxy for code quality:
```bash
cd campus-hub && npm run lint
```

Report any errors found. Common issues to watch for:
- Missing dependencies in `useEffect` dependency arrays
- Use of `var` instead of `const`/`let`
- Unused imports
- React hooks called conditionally

## Summary

After running both, produce a summary with:
- Number of backend tests passed / failed / skipped
- Any ESLint errors or warnings (with file name and line number)
- Recommended next steps for any failures
