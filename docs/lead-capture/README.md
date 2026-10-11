# Instant quote: how requests reach you, and how to update prices

The calculator (`public/quote.js`, `public/quote-data.js`, styles at the end of `public/style.css`) is on the
home page, `rates.html` and `contact.html` in English, Spanish and Russian.

## Requests: Google Sheets + email (one-time setup, about 5 minutes)

Until `endpoint` in `public/quote-data.js` is set, "Send reservation request" opens WhatsApp with the details
prefilled (the same behaviour as the old form). To receive each request as a row in a Google Sheet and as an email:

1. Create a new Google Sheet (for example "Onyx - Requests").
2. Extensions → Apps Script. Replace the contents with `docs/lead-capture/Code.gs`. Save.
3. Deploy → New deployment → type **Web app**: Execute as **Me**, Who has access **Anyone**. Deploy, allow access
   (Google asks for the sheet and for sending mail).
4. Copy the **Web app URL** (ends in `/exec`).
5. Rebuild the data with the URL: `python3 scripts/build-quote-data.py path/to/Onyx_Distance_Price_Tables.xlsx --endpoint <URL>`
   (needs `pip install openpyxl`). Commit `public/quote-data.js`.
6. Test: send a request from the live site. A row appears on the `Requests` sheet and an email arrives at info@onyxexecmiami.com.

Notes: mail is sent from your Google account (about 100 per day on a free account). If you change `Code.gs`, use
Deploy → Manage deployments → Edit → New version. The `Status` column is free for your own marks (New / Quoted / Booked).
Every request also carries the site language (`lang`) and the page it came from.

## Updating prices

1. Change the rates on the `Settings` sheet of the workbook `Onyx_Distance_Price_Tables`, download it as `.xlsx`.
2. `python3 scripts/build-quote-data.py path/to/Onyx_Distance_Price_Tables.xlsx` rewrites `public/quote-data.js`.
   The zone list (32 zones; a zone's price is the highest of its member towns) is `ZONES` at the top of the script.
3. The published route tables on `rates.astro` are normal page text: if prices change, update them there, then run the
   translation steps in `CLAUDE.md` (the prices are the same in every language).
4. Bump the `?v=` on the two `quote` script tags when `quote.js` or `quote-data.js` changes (browser cache).

## Translations of the calculator

All calculator text, zone names and messages live in `public/quote.js` (`S` and `NAMES`), in English, Spanish
(usted) and Russian (vy). They are not part of the page translation pipeline, so edit them there.
