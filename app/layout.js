import { Geist } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mercurio - Panel de Promociones",
  description: "Cargá y mostrá las promociones de tu tienda",
  icons: {
    icon: "/logoMercurio.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 pb-20 md:pb-0">
        <Header />
        <main className="flex-1 max-w-lg md:max-w-4xl lg:max-w-6xl mx-auto w-full px-4 pt-6">
          {children}
        </main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
