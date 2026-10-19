import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Head from "next/head";

export const metadata: Metadata = {
  title: "RTR Media Solutions - Training Institute",
  description: "RTR Media Solutions - Professional Training Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1538816970184837"
          crossOrigin="anonymous"
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-1538816970184837"
        />
      </Head>
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}