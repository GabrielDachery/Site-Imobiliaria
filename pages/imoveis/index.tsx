import type { GetServerSideProps } from "next";
import ListagemPage from "../../src/components/ListagemPaginas";
import type { ListagemPageProps } from "../../src/components/ListagemPaginas";
import { filtrarImoveis, obterOpcoesCatalogo } from "../../src/lib/imovelRepository";

export default function CatalogoPage(props: ListagemPageProps) {
  return <ListagemPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const [busca, catalogo] = await Promise.all([
    filtrarImoveis(query),
    obterOpcoesCatalogo(),
  ]);

  return {
    props: {
      busca,
      catalogo,
      consulta: query,
      cabecalho: "Catálogo completo",
      pagina: "imoveis",
      acao: "/imoveis",
    },
  };
};
