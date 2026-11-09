import Link from "next/link";
import type { Empresa } from "../lib/types";

interface FooterProps {
  empresa: Empresa;
}

export default function Footer({ empresa }: FooterProps) {
  return (
    <footer className="footer">
      <div className="divFooter">
        <div className="footerMarca">
          <img
            src="/assets/images/Logo branca sem fundo.png"
            alt="Logo Mondialle no rodapé"
            className="footerLogo"
          />

          <p>
            {empresa.nome} conecta pessoas às melhores oportunidades do mercado
            imobiliário, com transparência, segurança e atendimento
            personalizado em cada negociação.
          </p>

          <div className="redeSocial">
            <a
              href={empresa.instagram}
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-instagram" />
            </a>
            <a
              href={empresa.facebook}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-facebook" />
            </a>
          </div>

          {(empresa.creci || (empresa.corretores && empresa.corretores.length > 0)) && (
            <div className="footerCreci">
              {empresa.creci && <span>{empresa.nome} - {empresa.creci}</span>}
              {empresa.corretores?.map((c) => (
                <span key={c.nome}>
                  {c.nome} - {c.creci}
                </span>
              ))}
            </div>
          )}

          <span className="footerTexto">
            © 2026 {empresa.nome}. Todos os direitos reservados.
          </span>
        </div>

        <div className="footerIndices">
          <h3>Navegação</h3>
          <ul>
            <li>
              <Link href="/">Início</Link>
            </li>
            <li>
              <Link href="/venda">Venda</Link>
            </li>
            <li>
              <Link href="/locacao">Locação</Link>
            </li>
            <li>
              <Link href="/sobre">Sobre a Mondialle</Link>
            </li>
            <li>
              <Link href="/contato">Contato</Link>
            </li>
          </ul>
        </div>

        <div className="footerIndices">
          <h3>Contato</h3>
          <ul className="footerContato">
            <li><i className="fas fa-envelope"></i> {empresa.email}</li>
            <li><i className="fas fa-phone"></i>  {empresa.telefone}</li>
            {empresa.whatsapp && (
              <li>
                <i className="fa-brands fa-whatsapp"></i>{" "}
                <a
                  href={`https://wa.me/${empresa.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chamar no WhatsApp
                </a>
              </li>
            )}
            <li><i className="fas fa-map-marker-alt"></i> {empresa.endereco}</li>
          </ul>
        </div>
      </div>

      <div className="creditosFooter">
        Design e Desenvolvimento por{" "}
        <span>Emmanuel Scharnoski Correia</span>
      </div>

      <div className="mondialleGrandeFooter">MONDIALLE</div>
    </footer>
  );
}
