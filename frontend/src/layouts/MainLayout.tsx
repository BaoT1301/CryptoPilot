import type React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ".././index.css";

export const metadata: Metadata = {
  title: "MyCoinBase - Buy, Sell & Trade Crypto",
  description:
    "The easiest way to buy, sell, and trade cryptocurrency with bank-level security.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png", // mock icon path
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png", // mock icon path
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg", // mock icon path
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png", // mock icon path
  },
};

export default function MainLayout({ children }) {
  return (
    <div className="font-sans antialiased">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
