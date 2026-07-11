export function formatarPreco(valor: number): string {
  return Number(valor).toLocaleString("pt-BR");
}

export function formatarFinalidade(finalidade: "venda" | "locacao"): string {
  return finalidade === "venda" ? "Venda" : "Locação";
}
