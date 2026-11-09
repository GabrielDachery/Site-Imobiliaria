import type { Empresa } from "./types";

export const empresa: Empresa = {
  nome: "Mondialle Imobiliária",
  telefone: "(42) 99982-8281",
  email: "mondialleimobiliaria@gmail.com",
  instagram: "https://www.instagram.com/mondialleimobiliaria/",
  facebook: "https://www.facebook.com/profile.php?id=61584971055990",
  endereco: "Rua Floriano Peixoto, 180 sala 155 - Centro, União da Vitória",
  whatsapp: "5542999828281",
  // CRECI da imobiliária (pessoa jurídica, com o J): preencher quando confirmado, por exemplo "CRECI PR 12.345-J".
  creci: "",
  corretores: [
    { nome: "André Luís Aleixo", creci: "CRECI PR F-16.425" },
    { nome: "Cléo Marcia Bier Loss", creci: "CRECI PR F 14.127" },
  ],
};
