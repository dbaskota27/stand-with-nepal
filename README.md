# Stand With Nepal

Independent awareness page for the 26 August 2026 Himalayan flash floods in Nepal.

It does **not** collect donations. The only donate button goes to the official Government of Nepal [Prime Minister’s Disaster Relief Fund](https://pmdrf.nchl.com.np/).

## What’s on the page

- Official casualty snapshot from Nepal Police (dead, missing, injured), rechecked against NDRRMA, BIPAD, and IFRC
- Live flood / road warnings from the government BIPAD portal
- Photo gallery from the affected corridor
- Share tools for X

## Run locally

```bash
npm install
npm run dev
```

Then open the URL printed in the terminal.

## Official links

- Donate: https://pmdrf.nchl.com.np/
- NDRRMA: https://ndrrma.gov.np/en
- BIPAD: https://bipadportal.gov.np/
- Nepal Police unidentified bodies: https://udb.nepalpolice.gov.np/dead-bodies

## Keep figures current

A GitHub Action (`.github/workflows/refresh-snapshot.yml`) runs every 2 hours and on demand. It pulls BIPAD, NDRRMA, IFRC, and the Wikipedia infobox for this disaster (Nepal-only counts, cited to wire reports of Nepal Police / NDRRMA), then raises the hardcoded snapshot in `src/lib/casualties.ts` and `src/data/relief.ts` if official totals have gone up. It never lowers a number. If nothing is higher, it makes no commit.

After you merge the workflow, set the repo's Actions permissions to **Read and write** so the bot can push snapshot commits (Settings → Actions → General → Workflow permissions).

## Go live

This is a TanStack Start server app. GitHub Pages will not run the live fetch. Import this repo into [Vercel](https://vercel.com/new) — it detects Nitro automatically. After that, each visit refreshes casualty figures and BIPAD warnings (10-minute cache) via `getOfficialBrief()`.

