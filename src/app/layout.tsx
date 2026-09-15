import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "./globals.css";
import { MockProvider } from "@/components/provider";
import { Navbar, Footer } from "@/components/shell";
import { WebMcp } from "@/components/webmcp";
import { CompareDock } from "@/components/compare";
export const metadata: Metadata = {
  title: {
    default: "CHAIR. — Find your barber. Find your style.",
    template: "%s | CHAIR.",
  },
  description:
    "Discover independent barbers, explore their work, and find your next great haircut in Tbilisi. An interactive local prototype.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <MockProvider>
          <WebMcp />
          <Navbar />
          <main id="main">{children}</main>
          <CompareDock />
          <Footer />
        </MockProvider>
      </body>
    </html>
  );
}
