
import type { ReactNode } from "react";
import { StoreProvider } from "./StoreProvider";


import "./styles/globals.css";
import styles from "./styles/layout.module.css";
import { Smooch_Sans,Cormorant_Garamond } from 'next/font/google';

const smoochSans = Smooch_Sans({
    subsets: ['latin'],
    weight: ['400'], // Smooch only comes in a single 400 weight regular version
    variable: '--font-smooch', // This creates a CSS variable for Tailwind to use
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-cormorant",
});

interface Props {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (

      <html lang="en" suppressHydrationWarning className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${cormorant.variable} ${smoochSans.variable}`} suppressHydrationWarning>
            <StoreProvider>
                <main className={styles.main}>{children}</main>
            </StoreProvider>
        </body>
      </html>

  );
}
