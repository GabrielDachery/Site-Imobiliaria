import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const tentativas = new Map<string, { count: number; resetAt: number }>();
const LIMITE_POR_MINUTO = 3;

function verificarRateLimit(ip: string): boolean {
  const agora = Date.now();
  const registro = tentativas.get(ip);
  if (!registro || agora > registro.resetAt) {
    tentativas.set(ip, { count: 1, resetAt: agora + 60_000 });
    return true;
  }
  if (registro.count >= LIMITE_POR_MINUTO) return false;
  registro.count++;
  return true;
}

function escaparHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensagem: "Metodo nao permitido." });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    "desconhecido";

  if (!verificarRateLimit(ip)) {
    return res.status(429).json({ mensagem: "Muitas tentativas. Aguarde um minuto." });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ mensagem: "Preencha os campos obrigatorios." });
  }

  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof mensagem !== "string"
  ) {
    return res.status(400).json({ mensagem: "Dados invalidos." });
  }

  if (!RE_EMAIL.test(email)) {
    return res.status(400).json({ mensagem: "Email invalido." });
  }

  if (nome.length > 100 || email.length > 200 || mensagem.length > 5000) {
    return res.status(400).json({ mensagem: "Campos excedem o tamanho permitido." });
  }

  const nomeRemetente = nome.replace(/[\r\n]/g, "").trim();
  const emailRemetente = email.replace(/[\r\n]/g, "").trim();
  const telefoneStr = telefone ? String(telefone).replace(/[\r\n]/g, "").slice(0, 30) : null;
  const assuntoStr = assunto ? String(assunto).replace(/[\r\n]/g, "").slice(0, 150) : null;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_TO } =
    process.env;

  if (
    !EMAIL_HOST ||
    !EMAIL_PORT ||
    !EMAIL_USER ||
    !EMAIL_PASS ||
    !EMAIL_TO ||
    EMAIL_PASS === "senha-ou-app-password"
  ) {
    return res.status(500).json({ mensagem: "Credenciais de email nao configuradas." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE === "true",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Contato pelo site" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: `"${escaparHtml(nomeRemetente)}" <${escaparHtml(emailRemetente)}>`,
      subject: assuntoStr
        ? `Contato: ${escaparHtml(assuntoStr)}`
        : `Novo contato de ${escaparHtml(nomeRemetente)}`,
      html: `
        <h2>Novo contato pelo site</h2>
        <p><strong>Nome:</strong> ${escaparHtml(nomeRemetente)}</p>
        <p><strong>Email:</strong> ${escaparHtml(emailRemetente)}</p>
        <p><strong>Telefone:</strong> ${telefoneStr ? escaparHtml(telefoneStr) : "Nao informado"}</p>
        <p><strong>Assunto:</strong> ${assuntoStr ? escaparHtml(assuntoStr) : "Nao informado"}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${escaparHtml(mensagem).replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.status(200).json({ mensagem: "Email enviado com sucesso." });
  } catch {
    return res.status(500).json({ mensagem: "Erro ao enviar email." });
  }
}
