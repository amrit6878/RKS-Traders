# RKS Traders — quotation platform

Hindi-first, responsive catalogue for Ghazipur and nearby Bihar areas. Customers build a quotation, submit a typed or photographed material list, or share their request on WhatsApp/Telegram. No checkout payments.

## Run

Requires Node.js 24+ (uses built-in SQLite).

```sh
npm ci
export ADMIN_TOKEN="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
npm start
```

Open http://localhost:3000. Open /agent.html and enter the ADMIN_TOKEN value supplied by your server administrator. Keep the key private; use a persistent secret manager for production. The agent desk is disabled if no key of at least 24 characters is configured. Keys remain only in tab memory; sign out after use.

## Included

- Twelve indicative products across building materials, sanitary, tiles, plumbing and electrical.
- Search, category filters, device-local quotation cart, quantity changes and estimate calculation.
- Name, Indian mobile, location, notes, contact consent, JPG/PNG/WebP list photo up to 5 MB.
- Server validation and server-owned prices; SQLite persistence outside the public directory.
- Agent desk: newest 500 enquiries, uploaded lists, call/WhatsApp actions, private notes, and new/contacted/quoted/closed status.
- Direct customer WhatsApp sharing to **+91 8290124902**. Sharing opens a draft; customers explicitly send it.
- Telegram share picker: customer chooses recipient. No direct business Telegram destination is configured.
- Per-IP request limit, private admin endpoints, basic security headers, accessible form labels, reduced-motion support.

## Configuration

| Variable | Default / purpose |
| --- | --- |
| PORT | 3000 |
| BUSINESS_WHATSAPP | 918290124902 |
| ADMIN_TOKEN | Required secret, at least 24 characters, to enable agent access |
| RKS_DATA_DIR | ./data; use a persistent writable volume |

All quotations, including photos, are in `data/rks.sqlite`. Back up SQLite with its online backup mechanism or stop the server before copying the database with its WAL files. Never expose the data directory through static hosting. This app requires a Node server; it is not a static website or Cloudflare Worker package. Start with one server instance and a durable volume. For horizontally scaled deployment, migrate persistence and request limiting to shared services.

Existing `data/quotations.jsonl`, if present from an earlier prototype, is untouched and not automatically imported.

## Deployment

Use Node 24+ hosting with persistent storage, HTTPS and a secret ADMIN_TOKEN. A Dockerfile is supplied; mount /app/data. Do not bake secrets into the image. Configure your reverse proxy carefully: this app intentionally does not blindly trust forwarded IP headers. The current request limit is 30 submissions/hour per observed IP and may apply collectively behind a proxy. Adjust trusted proxy settings for your host before public launch.

Prices are illustrative, not live market data. Review products, rates, taxes, delivery coverage and business hours before inviting customers. The storefront uses bundled SVG material illustrations, not product photographs, and system fonts. No remote images or font downloads are needed. Replace illustrations with approved product photographs when available. No automatic notification service is configured: agents refresh the desk to see incoming enquiries. Direct WhatsApp shares do not also save a server enquiry. Attach photos separately when using WhatsApp; uploaded photos are saved with form submissions only.

## Verification

`npm test` exercises validation, authoritative pricing, private access, persistence, follow-up updates, contact configuration and photo-only enquiries. `node --check public/store.js` and `node --check public/agent.js` check client syntax. Browser checks passed at 390px mobile and 1440px desktop: no horizontal overflow, all five category views, bundle/cart updates, draft preservation, search and a complete quotation submission. GitHub hosts source only; run this Node server locally for a working website.

## Screenshot-inspired UI (v2)

Blue brand header and rate strip, light grey background, red add-to-quotation buttons, teal WhatsApp panels, compact horizontal product cards, category bundles, fixed bottom navigation and a full quotation-summary page. Hash routes support browser back/forward. Voice search uses browser speech recognition when supported; typing always works. No OTP sign-in, live price feed or automatic discount is implied.

For a Mac: extract the ZIP, open Terminal in the extracted folder, verify `node -v` is v24 or newer, run `npm ci` then `npm start`, and open http://localhost:3000. If another server is using that port, stop it with Ctrl+C first.
