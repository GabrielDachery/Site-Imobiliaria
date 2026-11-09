import Head from "next/head";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import type { Empresa } from "../lib/types";

interface LayoutProps {
  title: string;
  page: string;
  empresa: Empresa;
  children: ReactNode;
  stylesheets?: string[];
  showHeader?: boolean;
  showFooter?: boolean;
  /** Texto curto para o Google e para a prévia do link (WhatsApp, Facebook). */
  descricao?: string;
  /** Endereço completo (com https://) da imagem da prévia do link. */
  imagemCompartilhar?: string;
  /** Endereço completo (com https://) desta página. */
  urlCanonica?: string;
}

const DESCRICAO_PADRAO =
  "Mondialle Imobiliária: casas, apartamentos, chácaras e salas comerciais à venda e para locação em União da Vitória (PR) e Porto União (SC).";

export default function Layout({
  title,
  page,
  empresa,
  children,
  stylesheets = [],
  showHeader = true,
  showFooter = true,
  descricao = DESCRICAO_PADRAO,
  imagemCompartilhar,
  urlCanonica,
}: LayoutProps) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <meta name="description" content={descricao} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={empresa.nome} />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={descricao} />
        {urlCanonica && <meta property="og:url" content={urlCanonica} />}
        {urlCanonica && <link rel="canonical" href={urlCanonica} />}
        {imagemCompartilhar && (
          <meta property="og:image" content={imagemCompartilhar} />
        )}
        {imagemCompartilhar && (
          <meta name="twitter:card" content="summary_large_image" />
        )}
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
    </>
  );
}
