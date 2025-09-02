import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteSourceLocator } from "@metagptx/vite-plugin-source-locator";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Attempt to infer a sensible base path for GitHub Pages project sites when BASE_PATH not explicitly set.
  // If the repository is a user/organization site (ends with .github.io) use '/', otherwise '/<repo>/'.
  const explicit = process.env.BASE_PATH;
  let inferred = '/';
  const repo = process.env.GITHUB_REPOSITORY; // owner/repo
  if (!explicit && repo) {
    const repoName = repo.split('/')[1];
    if (!/\.github\.io$/i.test(repoName)) {
      inferred = `/${repoName}/`;
    }
  }
  // fallback hardcode for this repo if still root
  if (!explicit && inferred === '/' && process.env.npm_package_name === 'shadcnui') {
    inferred = '/nexlearn/';
  }
  const base = explicit || inferred;
  return ({
  plugins: [
    viteSourceLocator({
      prefix: "mgx",
    }),
    react(),
  ],
  // Allow overriding the base path for GitHub Pages project deployment
  // Set BASE_PATH env (e.g. /your-repo-name/) during build to make relative asset URLs work
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});
