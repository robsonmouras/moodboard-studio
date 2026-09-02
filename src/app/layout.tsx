import type { Metadata } from "next";
import { Inter, Instrument_Serif, Outfit } from "next/font/google";
import "./globals.css";

// Tipografia da identidade visual (brand-book Vortex):
// Outfit para display/títulos (Light 300 padrão, Regular 400, Semibold 600 pontual),
// Inter para corpo/UI/navegação (Regular 400, Medium 500).
// Expostas como CSS variables e conectadas aos tokens de fonte do Panda (fonts.display / fonts.body).
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

// Instrument Serif: usada apenas no headline da tela de entrada (/login), conforme
// decisão de design v3. Só tem peso 400. Conectada ao token de fonte fonts.serif.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moodboard Studio",
  description: "Gerador de moodboard — busca de imagens, favoritos e board compartilhável.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${inter.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
