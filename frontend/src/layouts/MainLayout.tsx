import React from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ".././index.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="font-sans antialiased">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
