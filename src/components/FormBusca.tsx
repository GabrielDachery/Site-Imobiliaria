import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { BuscaImoveis, ConsultaImoveis, OpcoesCatalogo } from "../lib/types";

function formatarMoeda(valor: number): string {
  return `R$ ${Number(valor).toLocaleString("pt-BR")}`;
}

function textoSelecionado(label: string, valores: string[]): string {
  return valores.length ? `(${valores.length}) Selecionados` : label;
}

interface DropdownOption {
  value: string | number;
  label?: string;
  count?: number;
}

interface DropdownFiltroProps {
  label: string;
  name: string;
  options: DropdownOption[];
  selected: string[];
  renderLabel?: (option: DropdownOption) => string;
}

function DropdownFiltro({
  label,
  name,
  options,
  selected,
  renderLabel,
}: DropdownFiltroProps) {
  const [selecionados, setSelecionados] = useState(selected);
  const [aberto, setAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelecionados(selected);
  }, [selected]);

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setAberto(false);
      }
    }

    document.addEventListener("click", fecharAoClicarFora);
    return () => {
      document.removeEventListener("click", fecharAoClicarFora);
    };
  }, []);

  return (
    <div className={`dropdownFiltro ${aberto ? "ativo" : ""}`} ref={dropdownRef}>
      <button
        className="dropdownAlternar"
        type="button"
        onClick={() => setAberto((valor) => !valor)}
      >
        <span className="dropdownTexto">
          {textoSelecionado(label, selecionados)}
        </span>
        <span className="iconeSeta">
          <i className="fa-solid fa-chevron-down" />
        </span>
      </button>

      <div className="dropdownList">
        <div className="dropdownBase">
          <div className="checkboxWrap">
            {options.map((option) => {
              const value = String(option.value);
              const checked = selected.includes(value);

              return (
                <label className="checkboxLabel" key={`${name}-${value}`}>
                  <input
                    type="checkbox"
                    name={name}
                    value={value}
                    defaultChecked={checked}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      setSelecionados((valoresAtuais) => {
                        if (event.target.checked) {
                          return [...valoresAtuais, value];
                        }

                        return valoresAtuais.filter((item) => item !== value);
                      });
                    }}
                  />
                  <span className="checkboxCustom" />
                  <span className="checkboxTexto">
                    {renderLabel ? renderLabel(option) : (option.label ?? "")}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormBuscaProps {
  action: string;
  busca: BuscaImoveis;
  catalogo: OpcoesCatalogo;
  consulta: ConsultaImoveis;
  textoBotao: string;
}

export default function FormBusca({
  action,
  busca,
  catalogo,
  consulta,
  textoBotao,
}: FormBuscaProps) {
  const codigoSelecionado =
    typeof consulta.codigo === "string" ? consulta.codigo : "";
  const precoMaximoInicial =
    busca.filtros.precoMaximo === Number.MAX_SAFE_INTEGER
      ? catalogo.precoMaximo
      : busca.filtros.precoMaximo;

  const [minimo, setMinimo] = useState(busca.filtros.precoMinimo);
  const [maximo, setMaximo] = useState(precoMaximoInicial);

  const minimoNormalizado = Math.min(minimo, maximo);
  const maximoNormalizado = Math.max(minimo, maximo);
  const baseCalculo = Math.max(catalogo.precoMaximo, 1);
  const esquerda = (minimoNormalizado / baseCalculo) * 100;
  const direita = (maximoNormalizado / baseCalculo) * 100;

  return (
    <form className="caixaBusca propertySearchForm" action={action} method="get">
      <div className="gridBuscaCima">
        <DropdownFiltro
          label="Finalidade"
          name="finalidade"
          selected={busca.filtros.finalidade}
          options={catalogo.finalidades.map((finalidade) => ({
            value: finalidade,
            count: catalogo.contagens.finalidades[finalidade] || 0,
          }))}
          renderLabel={(option: DropdownOption) =>
            `${option.value === "venda" ? "Venda" : "Locação"} (${option.count})`
          }
        />

        <DropdownFiltro
          label="Categoria"
          name="categoria"
          selected={busca.filtros.categoria}
          options={catalogo.categorias.map((categoria) => ({
            value: categoria,
            label: `${categoria} (${catalogo.contagens.categorias[categoria] || 0})`,
          }))}
        />

        <DropdownFiltro
          label="Cidade"
          name="cidade"
          selected={busca.filtros.cidade}
          options={catalogo.cidades.map((cidade) => ({
            value: cidade,
            label: `${cidade} (${catalogo.contagens.cidades[cidade] || 0})`,
          }))}
        />

        <DropdownFiltro
          label="Bairro"
          name="bairro"
          selected={busca.filtros.bairro}
          options={catalogo.bairros.map((bairro) => ({
            value: bairro,
            label: `${bairro} (${catalogo.contagens.bairros[bairro] || 0})`,
          }))}
        />

        <DropdownFiltro
          label="Quartos"
          name="quartos"
          selected={busca.filtros.quartos.map(String)}
          options={catalogo.quartos.map((quarto) => ({
            value: quarto,
            label: `${quarto} quarto${quarto > 1 ? "s" : ""} (${catalogo.contagens.quartos[quarto] || 0})`,
          }))}
        />
      </div>

      <div className="gridBuscaBaixo">
        <div className="filtroPreco">
          <div className="valores">
            <div className="valorBox">{formatarMoeda(minimoNormalizado)}</div>
            <div className="valorBox">
              {maximoNormalizado >= catalogo.precoMaximo
                ? `${formatarMoeda(maximoNormalizado)} +`
                : formatarMoeda(maximoNormalizado)}
            </div>
          </div>

          <div className="divSlider">
            <div className="slider" />
            <div
              className="sliderRange"
              style={{
                left: `${esquerda}%`,
                width: `${direita - esquerda}%`,
              }}
            />

            <input
              type="range"
              min="0"
              max={catalogo.precoMaximo}
              value={minimo}
              step="500"
              className="inputRange"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setMinimo(Number(event.target.value))
              }
            />

            <input
              type="range"
              min="0"
              max={catalogo.precoMaximo}
              value={maximo}
              step="500"
              className="inputRange"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setMaximo(Number(event.target.value))
              }
            />

            <input type="hidden" name="precoMin" value={minimoNormalizado} />
            <input type="hidden" name="precoMax" value={maximoNormalizado} />
          </div>
        </div>

        <div className="botaoBuscar">
          <button type="submit" className="btnBuscar">
            {textoBotao}
          </button>
        </div>

        <div className="campoCodigo">
          <input
            type="text"
            placeholder="Código do imóvel"
            className="inputCodigo"
            name="codigo"
            defaultValue={codigoSelecionado}
            maxLength={3}
          />
        </div>
      </div>
    </form>
  );
}
