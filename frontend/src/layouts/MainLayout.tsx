import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // `grain` lays a fixed noise tile over the page. A flat light background
    // reads as empty; the tile gives the paper a surface at no scroll cost.
    <div className="grain font-sans antialiased">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
