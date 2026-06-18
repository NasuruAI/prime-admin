# IdealCommerce Admin

Standalone Next.js back-office for IdealCommerce. It talks to the same backend
API as the storefront and is gated to the `admin` role.

```bash
cp .env.example .env
npm install
npm run dev   # http://localhost:3001
```

Sign in at `/login` with an admin account, then manage the store. Every other
route requires the `admin` role (enforced in middleware + at render time).
