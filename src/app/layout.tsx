import type { Metadata } from "next";
import { publicPath } from "@/lib/public-path";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-serif-display/400.css";
import "@fontsource/dm-serif-display/400-italic.css";
import "@fontsource/noto-sans-georgian/400.css";
import "@fontsource/noto-sans-georgian/500.css";
import "@fontsource/noto-sans-georgian/600.css";
import "@fontsource/noto-sans-georgian/700.css";
import "@fontsource/noto-serif-georgian/400.css";
import "./globals.css";
import { LocaleProvider } from "@/i18n/provider";
import { translate } from "@/i18n/translate";
import { MockProvider } from "@/components/provider";
import { StyleSelectionProvider } from "@/components/style-selection-provider";
import { Navbar, Footer } from "@/components/shell";
import { WebMcp } from "@/components/webmcp";
import { CompareDock } from "@/components/compare";
export const metadata: Metadata = {
  title: {
    default: `CHAIR. — ${translate("ka", "metadata.home")}`,
    template: "%s | CHAIR.",
  },
  description: translate("ka", "metadata.description"),
  icons: { icon: publicPath("/favicon.svg") },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ka" data-scroll-behavior="smooth">
      <body>
        <LocaleProvider>
          <StyleSelectionProvider>
            <MockProvider>
              <WebMcp />
              <Navbar />
              <main id="main">{children}</main>
              <CompareDock />
              <Footer />
            </MockProvider>
          </StyleSelectionProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
