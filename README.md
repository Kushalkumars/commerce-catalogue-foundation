# Northline catalogue

A small product catalogue: customers browse, search, open a product, and send an enquiry. The browser never calls Fake Store. Product data and enquiry email both sit behind interfaces, so the data source, the visual design, and the mail provider can change without a rewrite.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Client | React + TypeScript (Vite) | The brief prefers it, and a reviewer can run it in a browser with no simulator. |
| Backend | Node.js + TypeScript (Express) | Same language as the client, small enough to read in one sitting, and a natural fit for a later AWS deploy (container on ECS or App Runner, SES behind the email port). |

## Run it

You need Node.js 22+ and npm. From this folder:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The API is on http://localhost:3001 and the Vite dev server proxies `/api` to it.

Then:

```bash
npm test
```

### Docker (one command)

```bash
docker compose up --build
```

Open http://localhost:8080. Nginx serves the client and proxies `/api` to the API container. Fake Store must be reachable from the machine running Docker.

### Configuration

Defaults are enough for a review. To change them, copy `.env.example` to `.env` in this folder and restart `npm run dev`. The API reads that file. Docker Compose uses the values in `docker-compose.yml` instead.

Featured home-page products are `FEATURED_PRODUCT_IDS` (default `1,2,3,4,5`).

### What the reviewer should click

1. Home shows those five products, in that order.
2. A category link shows a **Top rated** group and **More in this category**.
3. Type a word in the search box and press **Search**. Results update only after the button.
4. Open a product tile.
5. Submit the enquiry form. You should see **Thank you**.
6. Open http://localhost:5173/api/dev/inbox (or http://localhost:8080/api/dev/inbox under Docker). The sales message is there, and the API process logs a one-line copy.

There is no SMTP server. The sales inbox for this proof of concept is `MemoryEmailSender`.

## Layout

```
client/                 React pages. Talks only to /api.
server/src/domain       Product type. No I/O.
server/src/ports        ProductCatalogue and EmailSender.
server/src/adapters     Fake Store and the in-memory inbox.
server/src/services     Featured list, category split, search, enquiry rules.
server/src/app.ts       HTTP.
server/test             Critical-path tests. No network.
```

## Docs for the review

- [DECISIONS.md](DECISIONS.md) — assumptions, cuts, how this grows, and a short interview walkthrough
- [AI_USAGE.md](AI_USAGE.md) — how AI was used
- [AGENTS.md](AGENTS.md) — instructions left in the repo for the coding agent
