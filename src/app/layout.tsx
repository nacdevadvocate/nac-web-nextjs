import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
import { MessageProvider } from "@/contexts/message";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "NaC Web",
  description: "NaC web for testing NaC APIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <MessageProvider>
        <body className={`antialiased flex flex-col min-h-screen`}>
          <Navbar />
          {/* <Toaster /> */}
          <main className="flex-grow container mx-auto p-4">{children}</main>
          <Footer />
        </body>
      </MessageProvider>
    </html>
  );
}
