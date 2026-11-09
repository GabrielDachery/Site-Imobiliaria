import { useState, useRef } from "react";
import type { GetServerSideProps } from "next";
import Layout from "../../src/components/Layout";
import ImovelCard from "../../src/components/ImovelCard";
import { empresa } from "../../src/lib/empresa";
import {
  obterImovelPorCodigo,
  obterImovelPorId,
  obterImoveisEmDestaque,
} from "../../src/lib/imovelRepository";
import { formatarPreco } from "../../src/lib/formatar";
import type { Imovel } from "../../src/lib/types";

interface Compartilhamento {
  url: string;
  imagem: string;
  descricao: string;
}

interface DetalheImovelPageProps {
  imovel: Imovel;
  imoveisRelacionados: Imovel[];
  compartilhamento: Compartilhamento;
}

/** Transforma um caminho do site (/assets/...) em endereço completo; endereços completos ficam como estão. */
function urlAbsoluta(src: string, siteUrl: string): string {
  if (/^https?:\/\//.test(src)) return src;
  return `${siteUrl}${src.startsWith("/") ? "" : "/"}${encodeURI(src)}`;
}

/**
 * Imagem da prévia do link. Fotos guardadas no Supabase Storage têm, na mesma pasta, um arquivo
 * "og.jpg" (1200x630, leve) feito para o WhatsApp; as demais usam a própria foto principal.
 */
function imagemParaCompartilhar(src: string, siteUrl: string): string {
  const completa = urlAbsoluta(src, siteUrl);
  if (completa.includes("/storage/v1/object/public/")) {
    return completa.replace(/[^/]+$/, "og.jpg");
  }
  return completa;
}

function montarDescricaoCompartilhar(imovel: Imovel): string {
  const partes: string[] = [
    `R$ ${formatarPreco(imovel.preco)}${imovel.finalidade === "locacao" ? "/mês" : ""}`,
  ];
  if (imovel.area > 0) partes.push(`${formatarPreco(imovel.area)} m²`);
  if (imovel.quartos > 0) {
    partes.push(`${imovel.quartos} ${imovel.quartos === 1 ? "quarto" : "quartos"}`);
  }
  partes.push(`${imovel.bairro} - ${imovel.cidade.trim()}`);
  return partes.join(" • ");
}

export default function DetalheImovelPage({
  imovel,
  imoveisRelacionados,
  compartilhamento,
}: DetalheImovelPageProps) {
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: `Olá! Estou interessado no imóvel código ${imovel.codigo}, poderia me passar mais informações?`,
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [fotoAtual, setFotoAtual] = useState(0);

  const galeriaRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  function irParaFoto(indice: number) {
    if (!galeriaRef.current) return;

    const fotos = Array.from(galeriaRef.current.children) as HTMLElement[];
    const proximoIndice = Math.max(0, Math.min(indice, fotos.length - 1));
    const foto = fotos[proximoIndice];

    galeriaRef.current.scrollTo({
      left: foto.offsetLeft,
      behavior: "smooth",
    });
    setFotoAtual(proximoIndice);
  }

  function onGaleriaScroll(e: React.UIEvent<HTMLDivElement>) {
    const galeria = e.currentTarget;
    const fotos = Array.from(galeria.children) as HTMLElement[];

    if (!fotos.length) return;

    const indiceMaisProximo = fotos.reduce((melhorIndice, foto, indice) => {
      const distanciaAtual = Math.abs(foto.offsetLeft - galeria.scrollLeft);
      const melhorDistancia = Math.abs(
        fotos[melhorIndice].offsetLeft - galeria.scrollLeft,
      );

      return distanciaAtual < melhorDistancia ? indice : melhorIndice;
    }, 0);

    setFotoAtual(indiceMaisProximo);
  }

  function onGaleriaMouseDown(e: React.MouseEvent) {
    if (!galeriaRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX - galeriaRef.current.offsetLeft;
    dragScrollLeft.current = galeriaRef.current.scrollLeft;
    galeriaRef.current.style.cursor = "grabbing";
    galeriaRef.current.style.scrollBehavior = "auto";
  }

  function onGaleriaMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !galeriaRef.current) return;
    e.preventDefault();
    const x = e.pageX - galeriaRef.current.offsetLeft;
    galeriaRef.current.scrollLeft = dragScrollLeft.current - (x - dragStartX.current) * 1.5;
  }

  function onGaleriaMouseUp() {
    if (!galeriaRef.current) return;
    isDragging.current = false;
    galeriaRef.current.style.cursor = "grab";
    galeriaRef.current.style.scrollBehavior = "smooth";
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch("/api/enviarEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          assunto: `Interesse no imóvel ${imovel.codigo} — ${imovel.titulo}`,
        }),
      });
      if (res.ok) {
        setEnviado(true);
      } else {
        setErro("Não foi possível enviar. Tente novamente.");
      }
    } catch {
      setErro("Erro ao enviar. Verifique sua conexão.");
    } finally {
      setEnviando(false);
    }
  }

  function compartilhar() {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: imovel.titulo, url: window.location.href });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
    }
  }

  const finalidadeLabel = imovel.finalidade === "venda" ? "Venda" : "Locação";

  return (
    <Layout
      title={`${imovel.titulo} | ${empresa.nome}`}
      page="imovel"
      empresa={empresa}
      stylesheets={["/assets/css/detalheImovel.css"]}
      descricao={compartilhamento.descricao}
      imagemCompartilhar={compartilhamento.imagem}
      urlCanonica={compartilhamento.url}
    >
      <main className="paginaImovel">
        <section className="tituloPagina">
          <h1>Detalhe do imóvel</h1>
        </section>
        <div className="cirBlur2"/>
        <section className="diSection">
          
          <div className="diTopo">
            <div>
              <h2 className="diTitulo">{imovel.titulo}</h2>
              <p className="diLocalizacao">
                {imovel.bairro} - {imovel.cidade}
              </p>
            </div>
            <button className="diCompartilhar" onClick={compartilhar}>
              <i className="fa-solid fa-arrow-up-from-bracket" /> Compartilhar
            </button>
          </div>

          {/* Galeria */}
          {(() => {
            const imagens = imovel.imagens?.length ? imovel.imagens : [imovel.imagem];
            return (
              <div className="diGaleria">
                <div
                  className="diGalScroll"
                  ref={galeriaRef}
                  onMouseDown={onGaleriaMouseDown}
                  onMouseMove={onGaleriaMouseMove}
                  onMouseUp={onGaleriaMouseUp}
                  onMouseLeave={onGaleriaMouseUp}
                  onScroll={onGaleriaScroll}
                >
                  {imagens.map((src, i) => (
                    <div key={i} className="diGalItem">
                      <img src={src} alt={`${imovel.titulo} — foto ${i + 1}`} draggable={false} />
                    </div>
                  ))}
                </div>
                {imagens.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="diGalNav diGalNavPrev"
                      aria-label="Foto anterior"
                      onClick={() => irParaFoto(fotoAtual - 1)}
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>
                    <button
                      type="button"
                      className="diGalNav diGalNavNext"
                      aria-label="Próxima foto"
                      onClick={() => irParaFoto(fotoAtual + 1)}
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                    <div className="diGalDots">
                      {imagens.map((_, i) => (
                        <button
                          key={i}
                          className={`diGalDot${i === fotoAtual ? " ativo" : ""}`}
                          aria-label={`Foto ${i + 1}`}
                          onClick={() => irParaFoto(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* Layout: info + formulário */}
          <div className="diLayout">
            {/* Coluna esquerda */}
            <div className="diInfo">
              <span className="diFinalidade">{finalidadeLabel}</span>
              <strong className="diPreco">
                R$ {formatarPreco(imovel.preco)}
                {imovel.finalidade === "locacao" ? "/mês" : ""}
              </strong>

              {/* Especificações */}
              <div className="diSpecs">
                <div className="diSpecItem">
                  <i className="fa-solid fa-ruler-combined diSpecIcon" />
                  <span className="diSpecLabel">Área</span>
                  <strong className="diSpecValor">{imovel.area} m²</strong>
                </div>
                {imovel.quartos > 0 && (
                  <div className="diSpecItem">
                    <i className="fa-solid fa-bed diSpecIcon" />
                    <span className="diSpecLabel">Quartos</span>
                    <strong className="diSpecValor">{imovel.quartos}</strong>
                  </div>
                )}
                {imovel.banheiros > 0 && (
                  <div className="diSpecItem">
                    <i className="fa-solid fa-bath diSpecIcon" />
                    <span className="diSpecLabel">Banheiros</span>
                    <strong className="diSpecValor">{imovel.banheiros}</strong>
                  </div>
                )}
                {imovel.vagas > 0 && (
                  <div className="diSpecItem">
                    <i className="fa-solid fa-car diSpecIcon" />
                    <span className="diSpecLabel">Garagem</span>
                    <strong className="diSpecValor">
                      {imovel.vagas} {imovel.vagas === 1 ? "vaga" : "vagas"}
                    </strong>
                  </div>
                )}
              </div>

              {/* Comodidades */}
              {imovel.comodidades && imovel.comodidades.length > 0 && (
                <div className="diTags">
                  {imovel.comodidades.map((c) => (
                    <span key={c} className="diTag">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Descrição */}
              <div className="diDescricao">
                <h3>Descrição</h3>
                {imovel.descricao.split("\n").map((paragrafo, i) => (
                  <p key={i}>{paragrafo}</p>
                ))}
              </div>
            </div>

            {/* Formulário lateral */}
            <aside className="diFormCard">
              <h3>Gostou desse imóvel?</h3>
              {enviado ? (
                <p className="diFormSucesso">
                  Mensagem enviada! Em breve entraremos em contato.
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <input
                    className="diFormInput"
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={form.nome}
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="diFormInput"
                    type="tel"
                    name="telefone"
                    placeholder="Telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="diFormInput"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                  <textarea
                    className="diFormTextarea"
                    name="mensagem"
                    value={form.mensagem}
                    onChange={handleChange}
                    rows={4}
                  />
                  {erro && <p className="diFormErro">{erro}</p>}
                  <button
                    type="submit"
                    className="diBtnEnviar"
                    disabled={enviando}
                  >
                    {enviando ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </form>
              )}
            </aside>
          </div>
        </section>

        {/* Imóveis relacionados */}
        {imoveisRelacionados.length > 0 && (
          <section className="diRelacionados">
            <h2>Já viu esses imóveis?</h2>
            <div className="gridImoveis">
              {imoveisRelacionados.map((rel) => (
                <ImovelCard key={rel.id} imovel={rel} />
              ))}
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const identificador = params?.identificador;
  const valor =
    typeof identificador === "string" ? identificador : String(identificador);
  const imovel =
    (await obterImovelPorCodigo(valor)) ?? (await obterImovelPorId(valor));

  if (!imovel) {
    return { notFound: true };
  }

  const destaque = await obterImoveisEmDestaque(4);
  const imoveisRelacionados = destaque
    .filter((i) => i.id !== imovel.id)
    .slice(0, 3);

  const siteUrl = (process.env.SITE_URL || "https://mondialleimobiliaria.com.br").replace(
    /\/$/,
    "",
  );
  const fotoPrincipal = imovel.imagens?.[0] ?? imovel.imagem;
  const compartilhamento: Compartilhamento = {
    url: `${siteUrl}/imoveis/${imovel.codigo}`,
    imagem: imagemParaCompartilhar(fotoPrincipal, siteUrl),
    descricao: montarDescricaoCompartilhar(imovel),
  };

  return {
    props: {
      imovel,
      imoveisRelacionados,
      compartilhamento,
    },
  };
};
