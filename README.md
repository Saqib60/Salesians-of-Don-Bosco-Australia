# Salesians of Don Bosco — Website prototype (Variation 3, Premium)

Static HTML / CSS / JavaScript build of the Variation 3 Figma design.

## Files
- `index.html` — all six page templates (Home, Child Safety, Giving & Bequests, Resource Library, News Article, Ministry Overview). Pages switch with the URL hash, e.g. `index.html#resources`.
- `css/styles.css` — design tokens (brand colours, Cinzel/Montserrat type, 4px button corners), components and responsive rules.
- `js/main.js` — interactions: sticky header, mobile menu, search overlay, live event countdown, video modal, podcast player, resource filters, FAQ accordion, scroll reveals, share/copy.
- `assets/` — official logo (from the brand guide) and placeholder photography.

## Run locally
Open `index.html` in a browser, or serve the folder (`python3 -m http.server`).

## Notes
- Photos are AI-generated mockups. Replace them with real Province photography (with consent) before launch.
- Cinzel stands in for Trajan Pro (Adobe Fonts licence needed).
- Forms, donations, downloads and external links are stubbed and show a short message.
- For production, this markup maps directly onto CMS templates (e.g. WordPress blocks); the hash routing is for the prototype only.
