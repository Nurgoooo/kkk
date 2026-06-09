import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dodo Trainee Academy",
  description: "Dodo Pizza стажерлеріне арналған өнімдерді жаттау сайты",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kk" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
