Create a new backend API endpoint for the CampusHub Spring Boot application.

The user will provide: the domain name (e.g. "listing", "dorm", "tutoring"), the HTTP method, the endpoint path, a brief description of what it does, and any required request/response fields.

Follow these steps exactly in this order:

## Step 1 — Feature flag

Open `backend/backend/src/main/java/com/campushub/backend/configurations/togglz/Features.java`.

Add a new enum constant in the section matching the domain. Use this pattern:
```java
@Label("DOMAIN - ActionName")
@EnabledByDefault
MY_NEW_FLAG,
```
Follow the naming convention already present (e.g. `CREATE_DORM`, `GET_ALL_TUTORING`).

## Step 2 — Request DTO (if the endpoint accepts a body)

Create a new file in `backend/backend/src/main/java/com/campushub/backend/dtos/<domain>/`.
Name it `<Action>RequestDTO.java`.

Conventions:
- Lombok `@Getter` and `@Setter` (no `@Data`)
- Jakarta Bean Validation on every field (`@NotBlank`, `@NotNull`, `@Size`, `@DecimalMax`, etc.)
- `UUID` for ID fields, `BigDecimal` for monetary values

## Step 3 — Response DTO (if the endpoint returns domain data)

Create `<Action>ResponseDTO.java` in the same `dtos/<domain>/` package.
Same Lombok conventions; no validation annotations needed on response DTOs.

## Step 4 — Service method

Open the existing service class in `backend/backend/src/main/java/com/campushub/backend/services/<domain>/`.

- Add the new method
- Annotate with `@Transactional` if the method writes to the database
- Throw the appropriate existing custom exception (from `exceptions/<domain>/`) on failure; create a new one if needed
- Never put HTTP logic (`ResponseEntity`, `HttpStatus`) in services

## Step 5 — Controller method

Open the existing controller in `backend/backend/src/main/java/com/campushub/backend/controllers/<domain>/`.

Add a handler method:
1. Use the correct HTTP method annotation (`@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`)
2. Add the Togglz guard at the very top of the method body:
   ```java
   if (!featureManager.isActive(MY_NEW_FLAG)) {
       return new ResponseEntity<>(HttpStatus.FORBIDDEN);
   }
   ```
3. Call `userService.getAuthenticatedUser()` when authentication is required
4. Map entities to DTOs: `modelMapper.map(entity, ResponseDTO.class)`
5. Annotate with `@Operation(summary = "...", description = "...")`

## Step 6 — Security whitelist (only if the endpoint must be publicly accessible without a JWT)

Open `backend/backend/src/main/java/com/campushub/backend/security/SecurityConfig.java`.
Add the path to the appropriate `requestMatchers(...).permitAll()` block.

## Step 7 — Unit test

Create or update the corresponding `*ServiceTest.java` under `backend/backend/src/test/`.

- `@ExtendWith(MockitoExtension.class)`
- `@Mock` for repositories and dependencies
- `@InjectMocks` for the service under test
- Test at least the happy path and one failure/edge case
- Do not load a Spring context

---

After completing all steps, summarize:
- Full endpoint URL (e.g. `POST /listings/new-action`)
- Feature flag constant added
- Any new files created
