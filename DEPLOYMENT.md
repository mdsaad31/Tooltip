# Deployment Guide for Tooltip

This guide explains how to deploy the Tooltip app to GitHub Pages.

## Prerequisites

- Git installed on your machine
- GitHub account
- Node.js and npm installed

## Setup GitHub Repository

1. **Create a new GitHub repository** named "Tooltip" (or any name you prefer)

2. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Tooltip app ready for deployment"
   ```

3. **Link to your GitHub repository**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Tooltip.git
   git branch -M main
   git push -u origin main
   ```

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

GitHub Actions will automatically deploy your app whenever you push to the main branch.

1. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** > **Pages**
   - Under "Build and deployment":
     - Source: Select **GitHub Actions**
   - Save the settings

2. **Push your code**:
   ```bash
   git push origin main
   ```

3. **Wait for deployment**:
   - Go to the **Actions** tab in your repository
   - Watch the deployment workflow complete
   - Your app will be live at: `https://YOUR_USERNAME.github.io/Tooltip/`

### Method 2: Manual Deployment

If you prefer to deploy manually:

1. **Install gh-pages** (already installed):
   ```bash
   npm install -D gh-pages
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

3. **Enable GitHub Pages** (first time only):
   - Go to **Settings** > **Pages**
   - Source: Select **Deploy from a branch**
   - Branch: Select **gh-pages** branch and **/ (root)** folder
   - Save

4. Your app will be live at: `https://YOUR_USERNAME.github.io/Tooltip/`

## Configuration

### Base URL

The app is configured with base URL `/Tooltip/` in `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/Tooltip/',
  // ...
})
```

**If your repository name is different**, update the base URL:
- Change `base: '/Tooltip/'` to `base: '/YOUR_REPO_NAME/'`
- Update `scope` and `start_url` in the PWA manifest accordingly

### Custom Domain (Optional)

To use a custom domain:

1. Create a `CNAME` file in the `public` folder:
   ```
   yourdomain.com
   ```

2. Update `vite.config.ts`:
   ```typescript
   base: '/', // Change from '/Tooltip/'
   ```

3. Configure DNS settings with your domain provider
4. Enable custom domain in GitHub Pages settings

## Verification

After deployment, verify:

1. **App loads correctly** at the GitHub Pages URL
2. **All tools function properly**
3. **PWA features work** (installability, offline mode)
4. **Assets load correctly** (images, fonts, icons)

## Troubleshooting

### Blank page after deployment
- Check that `base` in `vite.config.ts` matches your repository name
- Ensure GitHub Pages is enabled and set to the correct source

### 404 errors for assets
- Verify the base URL is correct
- Check that `.nojekyll` file exists in the `public` folder

### PWA not installing
- Verify HTTPS is enabled (GitHub Pages uses HTTPS by default)
- Check browser console for service worker errors
- Ensure manifest.webmanifest is being served correctly

## Updating the Deployment

To update your deployed app:

**Automatic (GitHub Actions)**:
```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

**Manual**:
```bash
npm run deploy
```

## Local Testing of Production Build

Before deploying, test the production build locally:

```bash
npm run build
npm run preview
```

This will serve the production build at `http://localhost:4173/Tooltip/`

## GitHub Actions Workflow

The workflow file is located at `.github/workflows/deploy.yml` and includes:
- Automatic build on push to main
- Node.js 20 setup
- Dependency caching for faster builds
- Production build generation
- Automatic deployment to GitHub Pages

## Support

If you encounter issues:
1. Check the GitHub Actions logs for build errors
2. Verify all environment configurations
3. Ensure dependencies are up to date
4. Review the browser console for runtime errors

---

**Your Tooltip app is now ready to be shared with the world! 🚀**
