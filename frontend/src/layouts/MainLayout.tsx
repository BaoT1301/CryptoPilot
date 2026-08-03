import React from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";

/**
 * Routes that are the product rather than the marketing site.
 *
 * These get the header but not the marketing footer: a five-column sitemap
 * with a legal disclaimer underneath a live trading screen is noise, and it
 * pushed the actual working area up the page.
 */
const APP_ROUTES = [
  "/dashboard",
  "/trading",
  "/wallet",
  "/history",
  "/profile",
  "/chat",
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const isApp = APP_ROUTES.some((route) => pathname.startsWith(route));

  return (
    // `grain` lays a fixed noise tile over the page. A flat light background
    // reads as empty; the tile gives the paper a surface at no scroll cost.
    <div className="grain flex min-h-[100dvh] flex-col font-sans antialiased">
      <Header />
      <div className="flex-1">{children}</div>
      {!isApp && <Footer />}
    </div>
  );
}
