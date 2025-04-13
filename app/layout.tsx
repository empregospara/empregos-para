import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { TopNavBar } from "./components/TopNavBar";
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from "next-auth/react"; // Importar o SessionProvider

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: "Empregos Pará",
  description: "Crie seu currículo aqui!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={montserrat.className}>
        <SessionProvider> {/* Envolver o layout com o SessionProvider */}
          <TopNavBar />
          <Toaster />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}