import Head from "next/head";
import { useRouter } from "next/router";
import type { Empresa } from "../lib/types";

interface BotaoWhatsAppProps {
  empresa: Empresa;
}

/**
 * Botão flutuante de WhatsApp, em todas as páginas.
 * Na página de um imóvel (/imoveis/<código>) a mensagem já vai com o código dele.
 */
export default function BotaoWhatsApp({ empresa }: BotaoWhatsAppProps) {
  const { asPath } = useRouter();

  if (!empresa.whatsapp) return null;

  const correspondencia = asPath.match(/^\/imoveis\/([^/?#]+)/);
  let codigo: string | null = null;
  if (correspondencia) {
    try {
      codigo = decodeURIComponent(correspondencia[1]);
    } catch {
      codigo = correspondencia[1];
    }
  }

  const mensagem = codigo
    ? `Olá! Vi o imóvel código ${codigo} no site da ${empresa.nome} e gostaria de mais informações.`
    : `Olá! Vim pelo site da ${empresa.nome} e gostaria de mais informações.`;
  const href = `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensagem)}`;

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/assets/css/whatsapp.css" />
      </Head>
      <a
        className="btnWhatsapp"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
      >
        <i className="fa-brands fa-whatsapp" />
        <span>WhatsApp</span>
      </a>
    </>
  );
}
