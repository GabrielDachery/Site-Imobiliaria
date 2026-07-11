import { useEffect, useState } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Início", page: "home" },
  { href: "/venda", label: "Venda", page: "venda" },
  { href: "/locacao", label: "Locação", page: "locacao" },
  { href: "/sobre", label: "Sobre a Mondialle", page: "sobre" },
  { href: "/contato", label: "Contato", page: "contato" },
] as const;

interface HeaderProps {
  pagina: string;
}

export default function Header({ pagina }: HeaderProps) {
  const [menuAberto, setMenuAberto] = useState(false);

  // Trava o scroll da página enquanto o menu mobile está aberto
  // (position: fixed também bloqueia o scroll por toque no iOS)
  useEffect(() => {
    if (!menuAberto) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.width = "100%";
    style.overflowY = "hidden";

    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.width = "";
      style.overflowY = "";
      window.scrollTo(0, scrollY);
    };
  }, [menuAberto]);

  // Fecha o menu com Escape e ao voltar para viewport de desktop
  useEffect(() => {
    if (!menuAberto) return;

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuAberto(false);
    }

    const desktop = window.matchMedia("(min-width: 769px)");
    function aoRedimensionar(event: MediaQueryListEvent) {
      if (event.matches) setMenuAberto(false);
    }

    document.addEventListener("keydown", aoTeclar);
    desktop.addEventListener("change", aoRedimensionar);
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      desktop.removeEventListener("change", aoRedimensionar);
    };
  }, [menuAberto]);

  return (
    <header>
      <div className="divHeader">
        <div className="logoHeader">
          <Link href="/">
            <img
              src="/assets/images/Logo branca sem fundo.png"
              alt="Logo Mondialle Imobiliária"
              id="logoHeader"
            />
          </Link>
        </div>

        <div className="menuHeader">
          <nav>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pagina === link.page ? "is-active" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="anuncieHeader">
          <Link href="/anunciar">Anuncie seu imóvel</Link>
        </div>

        <button
          className={`hamburger${menuAberto ? " hamburger-ativo" : ""}`}
          onClick={() => setMenuAberto(!menuAberto)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          aria-controls="menuMobile"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {menuAberto && (
        <div
          className="mobileMenu"
          id="menuMobile"
          onClick={(event) => {
            if (event.target === event.currentTarget) setMenuAberto(false);
          }}
        >
          <nav>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={pagina === link.page ? "is-active" : undefined}
                onClick={() => setMenuAberto(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/anunciar"
            className="mobileAnuncie"
            onClick={() => setMenuAberto(false)}
          >
            Anuncie seu imóvel
          </Link>
        </div>
      )}
    </header>
  );
}
