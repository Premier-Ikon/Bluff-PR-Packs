import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BagProvider } from "./lib/BagProvider";
import RouteProgress from "./components/RouteProgress";
import SiteHeader from "./SiteHeader";

export const metadata: Metadata = {
  title: "Got Bluff · Friends Only",
  description: "Grab what you want from the Got Bluff catalog.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <BagProvider>
          <div className="app-frame">
            <RouteProgress />
            <SiteHeader />
            {children}
            <footer className="site-footer">
              <strong>Got Bluff</strong>
              Questions? Email <a href="mailto:info@gotbluff.com">info@gotbluff.com</a>
            </footer>
          </div>
        </BagProvider>
      </body>
    </html>
  );
}
