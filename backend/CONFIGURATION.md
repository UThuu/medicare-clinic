# Runtime configuration

Supply `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` through the process environment or the hosting secret store. All three are required; there are no database defaults. `DB_URL` is a complete MySQL JDBC URL for the target database. `PORT` is optional: 8082 for local development (matching the Vite proxy), and 8080 for the prod profile/Docker image. Hosting must publish the port selected by `PORT`. See `DEPLOYMENT.md` for the container setup.

An `.env` file is not loaded automatically by Spring Boot. Do not commit credentials, session cookies, or private backup patches. The schema must already exist: Hibernate uses `validate`, not `update`. No migration or seed runs automatically.

For HTTPS behind a trusted reverse proxy, set `SPRING_PROFILES_ACTIVE=prod`. The proxy must replace forwarded headers supplied by clients. This profile enables Secure/HttpOnly/SameSite=Lax session cookies. Host the frontend and `/api` on the same HTTPS origin. Separate origins need an explicit credentials-enabled CORS configuration; that is not provided by this change.

Tests use the `test` profile and an isolated H2 in-memory database, never the deployment database. Do not use the test profile for deployment.


## Invoice clinic details

Invoice preview/printing uses the same clinic details for cashier and patient views.
Optional overrides: `CLINIC_NAME`, `CLINIC_ADDRESS`, `CLINIC_HOTLINE`, `CLINIC_EMAIL`,
`CLINIC_WEBSITE` (or Spring properties `clinic.name`, `clinic.address`, `clinic.hotline`,
`clinic.email`, `clinic.website`). Defaults preserve the original UC21 clinic information.
These settings do not require a database migration.
