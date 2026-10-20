import localFont from 'next/font/local';

// Small, self-hosted Latin subsets keep branding and code consistent offline.
// Chinese text uses the visitor's native system fonts.
export const brandFont = localFont({
  src: '../public/fonts/source-serif-4-latin.woff2',
  variable: '--font-brand',
  weight: '200 900',
  style: 'normal',
  display: 'swap',
  preload: false,
});

export const codeFont = localFont({
  src: '../public/fonts/jetbrains-mono-latin.woff2',
  variable: '--font-code',
  weight: '100 800',
  style: 'normal',
  display: 'swap',
  preload: false,
});
