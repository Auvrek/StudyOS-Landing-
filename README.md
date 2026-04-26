# StudyOS Landing Page

Static landing page for **StudyOS** — AI-powered exam preparation platform for European university students.

Built with vanilla HTML, CSS, and JavaScript. Zero external dependencies beyond Google Fonts.

---

## Local development

```bash
cd StudyOS_Landing_Page
python3 -m http.server 8001
```

Open `http://localhost:8001` — the server is required because `i18n.js` uses `fetch()` to load locale JSON files, which won't work from `file://`.

---

## Deploy to Netlify

1. Push the project to a GitHub/GitLab repo
2. Connect the repo in the Netlify dashboard
3. Set **Publish directory** to `.` (the repo root, or the subfolder containing `index.html`)
4. Deploy — no build step needed

For the contact form, add `netlify` and `netlify-honeypot="bot-field"` attributes to the `<form>` in `contact.html` (see the TODO comment in that file).

---

## Stripe setup

All Stripe integration points are stubbed in `js/stripe.js`. To activate payments:

1. Create products and prices in the Stripe dashboard
2. Fill in the price IDs in `STRIPE_CONFIG` inside `js/stripe.js`
3. Create a Netlify Function at `netlify/functions/create-checkout-session.js` that calls the Stripe API
4. Add your `STRIPE_SECRET_KEY` as a Netlify environment variable
5. Remove or update the `showSoonModal()` fallback logic

While `STRIPE_CONFIG` prices are empty, clicking plan/credit buttons opens the "coming soon" modal (`#soon-modal` in `index.html`).

---

## i18n — adding or editing translations

Locale files are in `locales/`:

| File | Language |
|------|----------|
| `es.json` | Spanish (default) |
| `en.json` | English |
| `de.json` | German |
| `et.json` | Estonian |

To add a new language:
1. Copy `locales/es.json` → `locales/XX.json`
2. Translate all values (keep all keys intact)
3. Add `<option value="XX">XX</option>` to every `data-lang-selector` dropdown in each HTML file
4. Update `i18n.js` if you want it as a default detection fallback

---

## Changing the color palette

All design tokens live in `css/tokens.css`. Key variables:

```css
--accent: #C5A24A;       /* Golden champagne — primary CTA color */
--lavender: #9B8FD4;     /* Lavender — secondary accent */
--bg: #DCDFE3;           /* Page background (silver-gray) */
--bg-alt: #E8EAED;       /* Alternate section background */
--dark: #111111;         /* Text and dark backgrounds */
```

Replace these values to retheme the entire site at once.

---

## File structure

```
StudyOS_Landing_Page/
├── index.html             # Main landing page (13 sections)
├── pricing.html           # Pricing plans page
├── credits.html           # Credits packs page
├── about.html             # About / team page
├── contact.html           # Contact form
├── privacy.html           # Privacy policy (GDPR)
├── terms.html             # Terms & conditions
├── cookies.html           # Cookie policy
├── imprint.html           # Impressum (required for DE/AT)
├── 404.html               # Error page
├── css/
│   ├── tokens.css         # CSS custom properties (design tokens)
│   ├── base.css           # Reset + typography
│   ├── layout.css         # Container, header, footer, drawer
│   ├── components.css     # Buttons, cards, accordion, modals
│   ├── sections.css       # Section-specific styles
│   └── responsive.css     # Breakpoints
├── js/
│   ├── i18n.js            # Internationalization engine
│   ├── nav.js             # Sticky header, mobile drawer, smooth scroll
│   ├── faq.js             # FAQ accordion
│   ├── pricing.js         # Billing toggle, credits calculator
│   ├── stripe.js          # Stripe checkout stubs
│   ├── analytics.js       # Plausible/GA4 event tracking
│   └── main.js            # Event delegation, cookie banner, modals
├── locales/
│   ├── es.json
│   ├── en.json
│   ├── de.json
│   └── et.json
└── assets/
    ├── icons/             # UI icons (SVG)
    │   ├── check.svg
    │   ├── x.svg
    │   ├── arrow-right.svg
    │   ├── menu.svg
    │   ├── close.svg
    │   └── plus.svg
    └── img/               # Illustrations (SVG)
        ├── favicon.svg
        ├── logo.svg
        ├── hero-illustration.svg
        ├── product-mockup.svg
        ├── feature-1.svg
        ├── feature-2.svg
        ├── feature-3.svg
        ├── how-step-1.svg
        ├── how-step-2.svg
        └── how-step-3.svg
```

---

## Legal

StudyOS OÜ · Registered in Estonia · Viru väljak 2, 10111 Tallinn
