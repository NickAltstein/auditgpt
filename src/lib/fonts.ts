import { EB_Garamond } from 'next/font/google';

// Display serif for headlines across the public site. Chosen deliberately over
// Instrument Serif/Fraunces (both banned house defaults) for a sober,
// dossier/editorial register rather than a decorative one.
export const displaySerif = EB_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-serif',
});
