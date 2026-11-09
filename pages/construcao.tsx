import Layout from "../src/components/Layout";
import { empresa } from "../src/lib/empresa";

export default function PaginaConstrucao() {
  return (
    <Layout
      title="Em construção"
      page="construcao"
      empresa={empresa}
      stylesheets={["/assets/css/construcao.css"]}
      showHeader={false}
      showFooter={false}
    >
      <main
        className="pageConstrucao"
        onMouseMove={(event) => {
          event.currentTarget.style.setProperty(
            "--mouse-x",
            `${event.clientX}px`
          );
          event.currentTarget.style.setProperty(
            "--mouse-y",
            `${event.clientY}px`
          );
        }}
      >
        <div className="bolaBlurMouse" />
        <div className="cirBlur3" />
        <div className="conteudoPrincipal">
          <img
            src="/assets/images/Logo branca sem fundo.png"
            alt="logo branca"
          />
          <h1>EM BREVE</h1>
          <p>
            Estamos preparando uma experiência exclusiva para apresentar
            imóveis, soluções e atendimento com excelência.
          </p>
          <div className="iconesSociais">
            <a href={empresa.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-instagram" />
            </a>

            <a href={empresa.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <i className="fa-brands fa-facebook" />
            </a>

            <a href={empresa.whatsapp ? `https://wa.me/${empresa.whatsapp}` : "#"} aria-label="Whatsapp" target="_blank" rel="noopener noreferrer">
                <i className="fa-brands fa-whatsapp" />
            </a>
          </div>
        </div>
        <div className="cirBlur4" />
      </main>
    </Layout>
  );
}
