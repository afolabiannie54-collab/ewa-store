import { DM_Sans, Tai_Heritage_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionWrapper from "@/components/SessionWrapper";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const taiHeritagePro = Tai_Heritage_Pro({
  variable: "--font-tai-heritage",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "EWA — Clean Skincare",
  description: "Clean skincare for every skin type. Formulated with intention, made for you.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${taiHeritagePro.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
        <SessionWrapper>
          <Navbar />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}