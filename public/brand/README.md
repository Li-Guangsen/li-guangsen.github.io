# sethli brand assets

A: `avatar.svg`, with the outlined Source Serif 4 S and a pale green dot, is used directly in the header and footer at every screen density. Its original rounded-square outline supplies the corners; CSS does not crop it.

The tab icon uses the matching `../icon.svg` with `sizes="any"`, listed after the PNG fallbacks. Its URL version refreshes previously cached tab icons. `favicon-16.png`, `favicon-32.png`, and `favicon-64.png` are compatibility fallbacks only. `apple-icon-180.png` and `avatar-512.png` use the same geometry.

B: `wordmark.svg` (also available as `wordmark-light.svg`) and `wordmark-dark.svg`, with outlined lowercase `sethli` and a green dot. No domain is part of the mark. The header component uses `currentColor` and `--brand-dot` to match the active theme.

SVG lettering is outlined and has no font dependency. All assets are based on the supplied local A/B comparison. Font sources and licenses are recorded in `../fonts/README.md`.
