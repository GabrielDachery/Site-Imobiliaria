import type { GetServerSideProps } from "next";
import ListagemPage from "../src/components/ListagemPaginas";
import type { ListagemPageProps } from "../src/components/ListagemPaginas";
import { filtrarImoveis, obterOpcoesCatalogo } from "../src/lib/imovelRepository";

export default function VendaPage(props: ListagemPageProps) {
  return <ListagemPage {...props} />;
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const consulta = { ...query, finalidade: "venda" };
  const [busca, catalogo] = await Promise.all([
    filtrarImoveis(consulta),
    obterOpcoesCatalogo(),
  ]);

  return {
    props: {
      busca,
      catalogo,
      consulta,
      cabecalho: "Imóveis para venda",
      pagina: "venda",
      acao: "/venda",
    },
  };
};
