# Docker deployment

Build from the repository root: `docker build -t medicare-clinic .`.
The image builds the locked frontend with `npm ci`, embeds it in the Spring Boot
JAR, and starts the `prod` profile. React and `/api` share one origin.

Required hosting settings:

| Variable | Value to supply |
| --- | --- |
| `DB_URL` | JDBC MySQL URL for the provisioned database, with the TLS settings required by the provider |
| `DB_USERNAME` | Database user granted only the application permissions it needs |
| `DB_PASSWORD` | Database password supplied through hosting secrets |
| `PORT` | Container listening port; defaults to `8080` in the image and prod profile |

Publish the same container port as `PORT`. `EXPOSE 8080` is image metadata and
does not override a hosting-provided `PORT`. No database credentials are baked
into the image. Hibernate uses `ddl-auto=validate`: provision the schema from
`database/schema_v1.2.sql` separately before starting, and do not automatically
load demo seeds in production.

Use a public HTTPS endpoint and a trusted reverse proxy which forwards the
original scheme using `Forwarded` or `X-Forwarded-Proto`. The prod profile sets
session cookies to `Secure`, `HttpOnly`, and `SameSite=Lax`. Do not expose the
application directly to clients that can spoof proxy headers. The supported
React routes forward to `index.html`; API requests and static resources retain
their normal handlers. Add new React entry points to `SpaController` when adding
routes to `frontend/src/App.tsx`.

No CORS configuration is needed for the bundled same-origin frontend. A separate
frontend domain requires an explicit origin/cookie design and verification.
Frontend services use relative `/api` URLs, including reception/vitals. The Vite
localhost proxy is for local development only and is absent from the production
bundle. VNPay Return/IPN endpoints and public deployment are outside this change.
