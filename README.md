# KeithSwoger.com

Source for [KeithSwoger.com](https://keithswoger.com/), Keith Swoger's portfolio and web resume.

The site is intentionally static. It uses semantic HTML, responsive CSS, and a small amount of JavaScript for navigation, scroll reveals, and the interactive system map. There is no framework or build step.

## Local preview

```powershell
python -m http.server 4173
```

Open `http://127.0.0.1:4173/`.

## Checks

```powershell
python scripts/check_site.py
```

## Cloudflare Pages

The production project is `keithswoger-com`.

```powershell
npx wrangler pages deploy . --project-name keithswoger-com --branch main
```

The custom domain and redirects are managed in Cloudflare Pages. The `www` host redirects to the apex domain.

## Project imagery

The project captures show Keith's own work: AgentReef, AI Battle Arena, and Aquarium. They are compressed for the portfolio and retain links to the live projects.
