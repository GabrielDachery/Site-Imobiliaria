import Head from "next/head";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import BotaoWhatsApp from "./BotaoWhatsApp";
import type { Empresa } from "../lib/types";

interface LayoutProps {
  title: string;
  page: string;
  empresa: Empresa;
  children: ReactNode;
  stylesheets?: string[];
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function Layout({
  title,
  page,
  empresa,
  children,
  stylesheets = [],
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <link
          rel="shortcut icon"
          href="/assets/images/Logo sem fundo.png"
          type="image/x-icon"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
        {stylesheets.map((href) => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </Head>

      {showHeader && <Header pagina={page} />}
      {children}
      {showFooter && <Footer empresa={empresa} />}
      <BotaoWhatsApp empresa={empresa} />
    </>
  );
}
