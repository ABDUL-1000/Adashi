import type { Metadata } from "next";
import { XeelaChatbot } from "@/components/integrations/XeelaChatbot";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adashi",
  description: "Contribution management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <QueryProvider>{children}</QueryProvider>
        <XeelaChatbot />
        <Toaster />
      </body>
    </html>
  );
}
