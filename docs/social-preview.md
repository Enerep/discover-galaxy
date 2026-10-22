# Social link previews

The public app address is **https://discover-galaxy-web.vercel.app/**. The initial [HTML](../apps/web/index.html) contains the canonical URL, Open Graph metadata, and Twitter large-image-card metadata. Crawlers can read them without JavaScript. The linked [PNG](../apps/web/public/social-preview-v1.png) is 1200 × 630 pixels and includes the project's development-preview status.

This is separate from the Share dialog's generated PNG. Social crawlers receive one general app thumbnail; URL fragments containing the selected entity or finding are handled by the browser and do not change that thumbnail. Existing cited image exports remain available from Share.

## Update the preview

1. Edit the original [SVG](../tools/social-preview.svg). If the public domain changes, update its visible address and every public page/image URL in `apps/web/index.html` together.
2. With Python Playwright and a system Chromium already available, render the committed PNG:

   ```sh
   python3 tools/social-preview.py render
   ```

   Rendering installs no browser or npm package and makes no external requests. The app and Vercel build use the committed PNG, so they do not need these optional authoring tools.
3. Build and check what a crawler receives:

   ```sh
   npm run build
   python3 tools/social-preview.py check
   ```

   The check uses only Python's standard library. It checks the initial production HTML, absolute HTTPS URLs, matching metadata, and shipped PNG dimensions. Visually inspect the thumbnail after artwork changes.
4. Commit the HTML, source SVG, and PNG together. For a future image revision, change the versioned PNG filename in the renderer and all metadata references to help distinguish the new asset from cached images.

## After deployment

The new metadata and image become public after Vercel deploys the commit. Confirm the deployed page source contains `og:image` and that its image URL returns the PNG. Then try a newly pasted link in the destination app. Some platforms cache previews or disable them; older posts may retain the previous preview, and the platform's URL inspection tool may be needed to request a refresh. Local checks cannot verify those external caches.

The thumbnail depicts the starter's existing AD–gene neighborhood. Layout and node size do not encode evidence strength or causality. No scientific claims or review statuses are changed by this feature.
