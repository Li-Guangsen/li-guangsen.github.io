# Self-hosted font subsets

- `source-serif-4-latin.woff2`: Source Serif 4 Roman variable, weight 200–900, optical size fixed at 20 for a compact and consistent website subset. Source: https://github.com/adobe-fonts/source-serif/tree/80d3f8894c09c937bebfa9011247d2e1c79fd6f4 (`VAR/SourceSerif4Variable-Roman.otf`).
- `jetbrains-mono-latin.woff2`: JetBrains Mono variable, weight 100–800. Source: https://github.com/JetBrains/JetBrainsMono/tree/19371302b95d218af43299bce79ddbddd0bc364d (`fonts/variable/JetBrainsMono[wght].ttf`).

Both are Latin subsets, including extended Latin, punctuation, arrows, and common currency symbols. CJK text uses the system font stack. Both are normal style only. The files retain variable weight axes and their original SIL Open Font License notices. Subset font family names are changed internally to Sethli Serif / Sethli Mono; the original Source Reserved Font Name is not used as the derivative family name. This does not affect the automatically generated family names from `next/font/local`.

Use `next/font/local` with `display: "swap"`, `weight: "200 900"` / `weight: "100 800"`, `style: "normal"` and variables `--font-brand` / `--font-code`. Font requests remain on the site's own origin; no external font service is needed.
