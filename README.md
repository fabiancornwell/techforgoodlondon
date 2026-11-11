# Tech for Good London

A simple jobs board for product and engineering roles at London tech-for-good companies.

Live at https://techforgoodlondon.com (hosted on GitHub Pages).

## Editing listings

All jobs and companies live in `data/jobs.json`:

- `companies`: one entry per company (`id`, `name`, `mission`, `sector`, `stage`, `funding_news`, `office_area`, `website`)
- `jobs`: one entry per role (`title`, `company_id`, `seniority`, `type`, `apply_url`, `posted`)

`seniority` must be one of: `Junior`, `Mid-level`, `Senior`, `Director/Head of`.

`office_area` must match one of the locations listed at the top of `app.js` (add new areas there).

## Files

- `index.html`: page structure and the logo
- `styles.css`: colours, type and layout (brand colours are at the top)
- `app.js`: filters and job list
- `logo.svg`: the sun mark, also used as the browser tab icon

Commit and push to `main`, and the site updates within a minute or two.
