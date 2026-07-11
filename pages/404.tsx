import Link from "next/link";
import Layout from "../src/components/Layout";
import PageHero from "../src/components/PageHero";
import { empresa } from "../src/lib/empresa";

export default function Custom404() {
  return (
    <Layout title="Imóvel não encontrado" page="nao-encontrado" empresa={empresa}>
      <main className="internalPage">
        <PageHero
          eyebrow="404"
          title="Imóvel não encontrado"
          description="O código informado não existe mais ou ainda não foi cadastrado."
        >
          <Link href="/imoveis" className="btnBuscar detailButton">
            Voltar ao catálogo
          </Link>
        </PageHero>
      </main>
    </Layout>
  );
}
