// "use client";

import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Providers from "./Providers";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer/Footer";

const jost = Jost({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"], // choose weights you need
  variable: "--font-jost", // optional: for CSS variable usage
});

export const metadata = {
  title: {
    default: "Next js Ecommerce",
    template: "%s - Next js Ecommerce",
  }
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${jost.variable} font-sans`}
      >
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
        <ToastContainer position="top-right" autoClose={1000} />
      </body>
    </html>
  );
}
