import Layout from "../src/components/Layout";
import { empresa } from "../src/lib/empresa";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

const finalidades = [
  { value: "venda", label: "Venda" },
  { value: "locacao", label: "Locação" },
];

interface DropdownFinalidadeProps {
  selecionadas: string[];
  onAlternar: (value: string) => void;
}

function DropdownFinalidade({ selecionadas, onAlternar }: DropdownFinalidadeProps) {
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener("click", fecharAoClicarFora);
    return () => document.removeEventListener("click", fecharAoClicarFora);
  }, []);

  const textoBotao =
    selecionadas.length === 0
      ? ""
      : finalidades
        .filter((finalidade) => selecionadas.includes(finalidade.value))
        .map((finalidade) => finalidade.label)
        .join(", ");

  return (
    <div
      className={`dropdownFinalidade ${aberto ? "ativo" : ""}`}
      ref={dropdownRef}
    >
      <button
        type="button"
        className="dropdownFinalidadeBotao"
        onClick={() => setAberto((valor) => !valor)}
        aria-expanded={aberto}
        aria-haspopup="listbox"
      >
        <span>{textoBotao}</span>
        <span className="setaFinalidade" aria-hidden="true" />
      </button>

      <div className="dropdownFinalidadeLista">
        {finalidades.map((finalidade) => (
          <label className="opcaoFinalidade" key={finalidade.value}>
            <input
              type="checkbox"
              name="finalidade"
              value={finalidade.value}
              checked={selecionadas.includes(finalidade.value)}
              onChange={() => onAlternar(finalidade.value)}
            />
            <span className="checkboxFinalidade" />
            <span>{finalidade.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function AnunciarPage() {
  const [finalidadesSelecionadas, setFinalidadesSelecionadas] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [tipoStatus, setTipoStatus] = useState<"sucesso" | "erro">("sucesso");
  const [enviando, setEnviando] = useState(false);

  function alternarFinalidade(value: string) {
    setFinalidadesSelecionadas((valoresAtuais) =>
      valoresAtuais.includes(value)
        ? valoresAtuais.filter((item) => item !== value)
        : [...valoresAtuais, value],
    );
  }

  async function enviarFormulario(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (finalidadesSelecionadas.length === 0) {
      setTipoStatus("erro");
      setStatus("Selecione a finalidade do imóvel.");
      return;
    }

    const form = event.currentTarget;
    const dados = new FormData(form);

    const finalidadeTexto = finalidades
      .filter((finalidade) => finalidadesSelecionadas.includes(finalidade.value))
      .map((finalidade) => finalidade.label)
      .join(", ");

    const tipoImovel = String(dados.get("tipoImovel") ?? "").trim();
    const cidade = String(dados.get("cidade") ?? "").trim();
    const bairro = String(dados.get("bairro") ?? "").trim();
    const mensagemUsuario = String(dados.get("mensagem") ?? "").trim();

    const mensagem = [
      `Tipo do imóvel: ${tipoImovel}`,
      `Finalidade: ${finalidadeTexto}`,
      `Cidade: ${cidade}`,
      `Bairro: ${bairro}`,
      "",
      `Mensagem: ${mensagemUsuario || "(não informada)"}`,
    ].join("\n");

    setEnviando(true);
    try {
      const resposta = await fetch("/api/enviarEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dados.get("nome"),
          email: dados.get("email"),
          telefone: dados.get("telefone"),
          assunto: `Anúncio de imóvel${tipoImovel ? ` - ${tipoImovel}` : ""}`,
          mensagem,
        }),
      });
      const resultado = await resposta.json();

      if (resposta.ok) {
        setTipoStatus("sucesso");
        setStatus(resultado.mensagem || "Solicitação enviada com sucesso.");
        form.reset();
        setFinalidadesSelecionadas([]);
      } else {
        setTipoStatus("erro");
        setStatus(
          resultado.mensagem || "Não foi possível enviar. Tente novamente.",
        );
      }
    } catch {
      setTipoStatus("erro");
      setStatus("Não foi possível enviar. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout
      title="Anunciar imóvel"
      page="anunciar"
      empresa={empresa}
      stylesheets={["/assets/css/anunciar.css"]}
    >
      <main className="paginaAnunciar">
        <section className="hero">
          <h3>ANUNCIE COM A MONDIALLE</h3>
          <h1 className="tituloHero">
            Seu imóvel merece <br />
            <span>visibilidade</span>
          </h1>
          <div className="retangulo"></div>
          <p className="textoHero">
            <span>
              Conectamos o seu imóvel às melhores oportunidades do mercado.
            </span>{" "}
            <br />
            Na Mondialle Imobiliária, oferecemos um serviço personalizado para
            proprietários que desejam anunciar com mais segurança e
            transparência.
          </p>
          <div className="heroImages">
            <img src="/assets/images/Terra.png" alt="Planeta Terra" className="terra" />
            <div className="cirBlur" />
            <div className="cirBlur2" />
          </div>
        </section>

        <div className="formAnuncio">
          <h2>
            Preencha seus dados e as informações do imóvel. Em breve, entraremos
            em contato para dar continuidade ao atendimento.
          </h2>
          <form onSubmit={enviarFormulario}>
            <label htmlFor="campoNome">Nome completo*</label> <br />
            <input type="text" id="campoNome" name="nome" required />{" "}
            <br />
            <label htmlFor="campoTelefone">Telefone*</label> <br />
            <input type="tel" name="telefone" id="campoTelefone" placeholder="(00) 0000-0000" required />{" "}
            <br />
            <label htmlFor="campoEmail">Email*</label> <br />
            <input type="email" name="email" id="campoEmail" placeholder="seuemail@gmail.com" required />{" "}
            <br />
            <label htmlFor="campoTipo">Tipo do imóvel*</label> <br />
            <input type="text" name="tipoImovel" id="campoTipo" placeholder="Apartamento" required />
            <br />
            <label>Finalidade do imóvel*</label> <br />
            <DropdownFinalidade
              selecionadas={finalidadesSelecionadas}
              onAlternar={alternarFinalidade}
            />
            <br />
            <label htmlFor="campoCidade">Cidade*</label> <br />
            <input type="text" name="cidade" id="campoCidade" required />
            <br />
            <label htmlFor="campoBairro">Bairro*</label> <br />
            <input type="text" name="bairro" id="campoBairro" required />
            <br />
            <label htmlFor="campoMensagem">Mensagem</label> <br />
            <textarea name="mensagem" id="campoMensagem" />
            <br />
            <input
              type="submit"
              value={enviando ? "Enviando..." : "Enviar"}
              disabled={enviando}
            />
            {status && (
              <p className={`mensagemFormulario ${tipoStatus}`}>{status}</p>
            )}
          </form>
        </div>
      </main>
    </Layout>
  );
}
