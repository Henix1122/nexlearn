# Deploy to GitHub Pages

Steps:
1. Create a repo on GitHub (public).
2. Commit & push this project.
3. Add a deploy script that sets the base path if using a project page.

## Add script
In `package.json` under scripts:
```
"predeploy": "pnpm build",
"deploy": "git subtree push --prefix dist origin gh-pages"
```
For project pages set base path before build (replace <repo>):
```
BASE_PATH=/<repo>/ pnpm build
```
Or cross-env alternative on Windows.

## Build & Publish
```
pnpm install
BASE_PATH=/<repo>/ pnpm build
npx gh-pages -d dist   # (if you prefer gh-pages package)
```

## GitHub Settings
- Settings > Pages > Deploy from branch `gh-pages` (root).

## Custom Domain (optional)
Add `CNAME` file into `public/` with your domain.

## Cache Busting
Vite fingerprinted assets handle this automatically.

## SPA Routing
Add a `404.html` copying `index.html` to support client-side routing:
```
cp dist/index.html dist/404.html
```
Commit and push the `gh-pages` branch build output only if not using subtree.

## GitHub Actions Workflow (Automatic)
Included `.github/workflows/deploy.yml` auto-builds on push to `main`/`master` and publishes to Pages using dynamic BASE_PATH. After first push:
1. In repo Settings > Pages set source to GitHub Actions (if not automatic).
2. Push to `main` – pipeline builds and deploys.
3. Custom domain? Add `CNAME` file or rename `CNAME.example` to `CNAME` with your domain before committing.

The workflow detects if the repo is a user/organization site (`*.github.io`) and sets base to `/`; otherwise `/<repo>/`.

