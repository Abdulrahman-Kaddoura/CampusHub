Create a complete full-stack REST endpoint for the resource: $ARGUMENTS

Follow the CampusHub layered architecture exactly. Work through these steps in order:

---

## 1. Backend — DTO(s)

Location: `backend/backend/src/main/java/com/campushub/backend/dtos/`

- Create a request DTO (e.g. `CreateXxxRequest.java`) and/or response DTO (e.g. `XxxResponse.java`) as needed.
- Use Lombok `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`.
- Include only the fields that the API consumer needs — never expose JPA entity internals directly.

## 2. Backend — Repository (if new entity)

Location: `backend/backend/src/main/java/com/campushub/backend/repositories/`

- Extend `JpaRepository<Entity, Long>`.
- Add any custom query methods needed (use Spring Data naming conventions or `@Query`).

## 3. Backend — Service

Location: `backend/backend/src/main/java/com/campushub/backend/services/`

- Annotate with `@Service`.
- Inject the repository via constructor injection.
- Use `ModelMapper` (autowired) to map between entity and DTO.
- Mark write methods `@Transactional`.
- Throw appropriate custom exceptions from `exceptions/` on error cases.

## 4. Backend — Controller

Location: `backend/backend/src/main/java/com/campushub/backend/controllers/`

- Annotate with `@RestController` and `@RequestMapping("/api/<resource>")`.
- Inject the service via constructor injection.
- Map HTTP verbs to CRUD operations:
  - `GET /` → list all
  - `GET /{id}` → get by ID
  - `POST /` → create (`@RequestBody` DTO)
  - `PUT /{id}` → update
  - `DELETE /{id}` → delete
- Return `ResponseEntity<XxxResponse>` or `ResponseEntity<List<XxxResponse>>`.
- Add `@PreAuthorize` if the endpoint requires authentication.

## 5. Frontend — API Client

Location: `campus-hub/src/api/<resource>.jsx`

- Import the Axios instance from `./client.js`.
- Export named async functions for each operation, e.g.:
  ```js
  export const getXxxList = () => client.get('/api/<resource>');
  export const createXxx = (data) => client.post('/api/<resource>', data);
  ```
- Match the backend routes exactly.

## 6. Frontend — Page / Component

- If a page already exists for this resource, add the new data-fetching call inside a `useEffect`.
- If it's a new resource, create a page in `campus-hub/src/pages/<Resource>/` and register the route in `campus-hub/src/App.jsx`.
- Gate the feature behind a feature flag in `campus-hub/src/config/features.js` if it's not ready for all users.

---

After scaffolding, list all created/modified files and remind the user to:
1. Run `./gradlew build` in `backend/backend/` to verify compilation.
2. Run `npm run lint` in `campus-hub/` to verify frontend code quality.
