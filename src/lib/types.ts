export interface Empresa {
  nome: string;
  telefone: string;
  email: string;
  instagram: string;
  facebook: string;
  endereco: string;
  /** WhatsApp só com dígitos e DDI, ex.: 5542999828281 (usado nos links wa.me). */
  whatsapp?: string;
  /** CRECI da imobiliária (pessoa jurídica). Aparece no rodapé quando preenchido. */
  creci?: string;
  /** Corretores com CRECI, exibidos no rodapé. */
  corretores?: { nome: string; creci: string }[];
}

export interface Imovel {
  id: number;
  codigo: string;
  titulo: string;
  finalidade: "venda" | "locacao";
  categoria: string;
  cidade: string;
  bairro: string;
  endereco: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  area: number;
  preco: number;
  imagem: string;
  imagens?: string[];
  descricao: string;
  destaque: boolean;
  comodidades?: string[];
}

export interface FiltrosImoveis {
  finalidade: string[];
  categoria: string[];
  cidade: string[];
  bairro: string[];
  quartos: number[];
  precoMinimo: number;
  precoMaximo: number;
  codigo: string;
}

export interface BuscaImoveis {
  itens: Imovel[];
  filtros: FiltrosImoveis;
}

export interface OpcoesCatalogo {
  finalidades: string[];
  categorias: string[];
  cidades: string[];
  bairros: string[];
  quartos: number[];
  contagens: {
    finalidades: Record<string, number>;
    categorias: Record<string, number>;
    cidades: Record<string, number>;
    bairros: Record<string, number>;
    quartos: Record<number, number>;
  };
  precoMaximo: number;
}

export type ConsultaImoveis = Record<string, string | string[] | undefined>;
