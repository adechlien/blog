# Directus production

Docker Compose deployment for `cms.adechlien.blog` with Directus, PostgreSQL,
Cloudflare R2 storage, and Caddy HTTPS termination.

Secrets belong in `.env` on the VPS and must never be committed. Directus and
PostgreSQL are only reachable through their private Docker networks.
