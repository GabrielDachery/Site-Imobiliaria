import Layout from "./Layout";
import FormBusca from "./FormBusca";
import ImovelCard from "./ImovelCard2";
import { empresa } from "../lib/empresa";
import { useEffect, useRef, useState } from "react";
import type { BuscaImoveis, ConsultaImoveis, OpcoesCatalogo } from "../lib/types";

export interface ListagemPageProps {
  busca: BuscaImoveis;
  catalogo: OpcoesCatalogo;
  consulta: ConsultaImoveis;
  cabecalho: string;
  pagina: string;
  acao: string;
}

export default function ListagemPage({
  busca,
  catalogo,
  consulta,
  cabecalho,
  pagina,
  acao,
}: ListagemPageProps) {
  const itensPagina = 8;
  const [paginaAtual, setPaginaAtual] = useState(1);

  const listaRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  listaRef.current?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}, [paginaAtual]);

  const totalPaginas = Math.ceil(busca.itens.length / itensPagina);
  const inicio = (paginaAtual - 1) * itensPagina;
  const fim = inicio + itensPagina;
  const imoveisPaginas = busca.itens.slice(inicio, fim);

  return (
    <Layout
      title={cabecalho}
      page={pagina}
      empresa={empresa}
    >
      <main className="vendaLocacao">
        <section className="tituloPagina">
          <h1>{cabecalho}</h1>
          <div className="cirBlur2" />
        </section>

        <FormBusca
          action={acao}
          busca={busca}
          catalogo={catalogo}
          consulta={consulta}
          textoBotao="Atualizar busca"
        />

        <div className="divPrincipal2" ref={listaRef}>
          <section className="resultadoQuant">
            <div className="result">
              <div className="resultadoTitulo">
                <h2>
                  {busca.itens.length}{" "}
                  {busca.itens.length === 1
                    ? "imóvel encontrado"
                    : "imóveis encontrados"}
                </h2>
              </div>
            </div>

            {busca.itens.length ? (
              <div className="destaque2">
                <div className="gridImoveis2">
                  {imoveisPaginas.map((imovel) => (
                    <ImovelCard key={imovel.id} imovel={imovel} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="naoEncontrado">
                <h3>Nenhum resultado encontrado.</h3>
                <p>
                  Altere filtros, cidade ou faixa de preço para ver outras
                  oportunidades.
                </p>
              </div>
            )}

            {totalPaginas > 1 && (
              <div className="paginas">
                <button 
                  type="button" 
                  onClick={() => setPaginaAtual((pagina) => Math.max(pagina - 1, 1))} 
                  disabled={paginaAtual === 1} 
                  className="setaPaginas1">  
                  <i className="fa-solid fa-chevron-down" />                
                </button>

                {Array.from({length: totalPaginas}, (_, index) => {const pagina = index + 1
                  return(
                    <button
                      key = {pagina}
                      type="button"
                      onClick={() => setPaginaAtual(pagina)}
                      className= {pagina === paginaAtual ? "paginaItem ativa" : "paginaItem"}
                    >
                      {pagina}
                    </button>
                  );
                })}

              <button 
                type="button"
                onClick={() => setPaginaAtual((pagina) => Math.min(pagina + 1, totalPaginas))}
                disabled = {paginaAtual === totalPaginas}
                className = "setaPaginas2"
              >
                <i className="fa-solid fa-chevron-down" /> 
              </button>

              </div>
            )}

          </section>
        </div>
      </main>
    </Layout>
  );
}
