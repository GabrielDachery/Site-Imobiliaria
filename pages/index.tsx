import type { GetServerSideProps } from "next";
import Layout from "../src/components/Layout";
import FormBusca from "../src/components/FormBusca";
import ImovelCard from "../src/components/ImovelCard";
import { empresa } from "../src/lib/empresa";
import {
  filtrarImoveis,
  obterImoveisEmDestaque,
  obterOpcoesCatalogo,
} from "../src/lib/imovelRepository";
import type {
  BuscaImoveis,
  ConsultaImoveis,
  Imovel,
  OpcoesCatalogo,
} from "../src/lib/types";

export default function Home({
  busca,
  catalogo,
  imoveisDestaque,
  consulta,
}: {
  busca: BuscaImoveis;
  catalogo: OpcoesCatalogo;
  imoveisDestaque: Imovel[];
  consulta: ConsultaImoveis;
}) {
  return (
    <Layout title="Mondialle Imobiliária" page="home" empresa={empresa}>
      <section className="hero">
        <div className="textoPrincipal">
          <h1>
            Encontre o imóvel ideal <br />
            <span className="linhaHero">
              <span>com a </span>
              <span
                className="mondialle"
                onMouseMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  const x = event.clientX - bounds.left;
                  const y = event.clientY - bounds.top;

                  event.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                  event.currentTarget.style.setProperty("--mouse-y", `${y}px`);
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.setProperty("--mouse-x", "50%");
                  event.currentTarget.style.setProperty("--mouse-y", "50%");
                }}
              >
                MONDIALLE
              </span>
            </span>
          </h1>
        </div>

        <div className="imagesSection">
          <img
            src="/assets/images/Casas_2d.png"
            alt="Ilustração da cidade"
            className="cidadeLinha"
          />
          <img
            src="/assets/images/Terra.png"
            alt="Planeta Terra"
            className="terra"
          />
          <div className="cirBlur" />
        </div>
      </section>

      <FormBusca
        action="/imoveis"
        busca={busca}
        catalogo={catalogo}
        consulta={consulta}
        textoBotao="Buscar imóveis"
      />

      <main className="principal">
        <section className="sectionPrincipal">
          <div className="divPrincipal">
            <div className="destaque">
              <h2 className="tituloDestaques">Imóveis em destaque</h2>
              <div className="gridImoveis">
                {imoveisDestaque.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const [busca, catalogo, imoveisDestaque] = await Promise.all([
    filtrarImoveis(query),
    obterOpcoesCatalogo(),
    obterImoveisEmDestaque(6),
  ]);

  return {
    props: {
      busca,
      catalogo,
      imoveisDestaque,
      consulta: query,
    },
  };
};
