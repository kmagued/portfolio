import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khaled Magued — Sport × Code",
  description: "Software developer building the future of sport technology. Tournament systems, fantasy leagues, and training platforms.",
  keywords: ["sports tech", "tournament management", "fantasy league", "training platform", "software developer", "Egypt"],
  openGraph: {
    title: "Khaled Magued — Sport × Code",
    description: "Software developer building the future of sport technology.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
