import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import { empresa } from "../../src/lib/empresa";

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

const COR_ACENTO = "#f5a300";

interface DadosEmail {
  titulo: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  /** Mensagem ja escapada para HTML (com <br> nas quebras de linha). */
  mensagemHtml: string;
  logoUrl: string;
  fontUrl: string;
}

/** Fonte do site + fallbacks serifados (clientes que nao suportam @font-face). */
const FONTE_DISPLAY = "'Universal', Georgia, 'Times New Roman', serif";

function montarEmailHtml(dados: DadosEmail): string {
  const { titulo, nome, email, telefone, assunto, mensagemHtml, logoUrl, fontUrl } =
    dados;

  const linha = (rotulo: string, valor: string) => `
                <tr>
                  <td style="padding:14px 0;border-bottom:1px solid #eeeeee;font-family:Arial,Helvetica,sans-serif;">
                    <span style="display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9a9a9a;margin-bottom:5px;">${rotulo}</span>
                    <span style="display:block;font-size:16px;color:#111111;font-weight:bold;">${valor}</span>
                  </td>
                </tr>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @font-face {
      font-family: 'Universal';
      src: url('${fontUrl}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:14px;overflow:hidden;">
          <tr>
            <td align="center" style="background-color:#000000;padding:34px 24px 26px;">
              <img src="${logoUrl}" alt="Mondialle Imobiliária" width="190" style="display:block;border:0;width:190px;max-width:70%;height:auto;">
            </td>
          </tr>
          <tr>
            <td style="height:4px;background-color:${COR_ACENTO};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:32px 36px 8px;font-family:Arial,Helvetica,sans-serif;">
              <h1 style="margin:0 0 4px;font-size:22px;color:#111111;">${titulo}</h1>
              <p style="margin:0 0 16px;font-size:14px;color:#888888;">Recebido pelo site da Mondialle Imobiliária</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${linha("Nome", nome)}
                ${linha("Email", email)}
                ${linha("Telefone", telefone || "Não informado")}
                ${assunto ? linha("Assunto", assunto) : ""}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 36px 34px;font-family:Arial,Helvetica,sans-serif;">
              <span style="display:block;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9a9a9a;margin:14px 0 8px;">Mensagem</span>
              <div style="background-color:#fbf6ea;border-left:4px solid ${COR_ACENTO};border-radius:8px;padding:16px 18px;font-size:15px;line-height:1.6;color:#333333;">${mensagemHtml}</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#000000;padding:26px 36px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 12px;font-size:22px;color:#ffffff;letter-spacing:3px;font-family:${FONTE_DISPLAY};">MONDIALLE <span style="color:${COR_ACENTO};">IMOBILIÁRIA</span></p>
              <p style="margin:0;font-size:13px;line-height:1.8;color:#b8b8b8;">
                ${escaparHtml(empresa.email)}<br>
                ${escaparHtml(empresa.telefone)}<br>
                ${escaparHtml(empresa.endereco)}
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#aaaaaa;">Email automático do site - responda para falar diretamente com o remetente.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function montarEmailTexto(dados: {
  titulo: string;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string | null;
  mensagem: string;
}): string {
  return [
    dados.titulo,
    "",
    `Nome: ${dados.nome}`,
    `Email: ${dados.email}`,
    `Telefone: ${dados.telefone || "Não informado"}`,
    dados.assunto ? `Assunto: ${dados.assunto}` : null,
    "",
    "Mensagem:",
    dados.mensagem,
  ]
    .filter((linha) => linha !== null)
    .join("\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ mensagem: "Método não permitido." });
  }

  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    "desconhecido";

  if (!verificarRateLimit(ip)) {
    return res.status(429).json({ mensagem: "Muitas tentativas. Aguarde um minuto." });
  }

  const { nome, email, telefone, assunto, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res.status(400).json({ mensagem: "Preencha os campos obrigatórios." });
  }

  if (
    typeof nome !== "string" ||
    typeof email !== "string" ||
    typeof mensagem !== "string"
  ) {
    return res.status(400).json({ mensagem: "Dados inválidos." });
  }

  if (!RE_EMAIL.test(email)) {
    return res.status(400).json({ mensagem: "Email inválido." });
  }

  if (nome.length > 100 || email.length > 200 || mensagem.length > 5000) {
    return res.status(400).json({ mensagem: "Campos excedem o tamanho permitido." });
  }

  const nomeRemetente = nome.replace(/[\r\n]/g, "").trim();
  const emailRemetente = email.replace(/[\r\n]/g, "").trim();
  const telefoneStr = telefone ? String(telefone).replace(/[\r\n]/g, "").slice(0, 30) : null;
  const assuntoStr = assunto ? String(assunto).replace(/[\r\n]/g, "").slice(0, 150) : null;

  const ehAnuncio = assuntoStr?.toLowerCase().startsWith("anúncio") ?? false;
  const titulo = ehAnuncio ? "Novo anúncio de imóvel" : "Novo contato pelo site";

  const proto =
    (req.headers["x-forwarded-proto"] as string)?.split(",")[0]?.trim() || "https";
  const host = req.headers.host;
  const baseUrl = (process.env.SITE_URL || (host ? `${proto}://${host}` : "")).replace(
    /\/$/,
    "",
  );
  const logoUrl = `${baseUrl}/assets/images/Logo%20branca%20sem%20fundo.png`;
  const fontUrl = `${baseUrl}/assets/fonts/universal_serif/Universal%20Serif.ttf`;

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
    return res.status(500).json({ mensagem: "Credenciais de email não configuradas." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: EMAIL_SECURE === "true",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: {
        name: ehAnuncio ? "Anúncio pelo site" : "Contato pelo site",
        address: EMAIL_USER,
      },
      to: EMAIL_TO,
      replyTo: { name: nomeRemetente, address: emailRemetente },
      subject: ehAnuncio
        ? (assuntoStr ?? "Novo anúncio de imóvel")
        : assuntoStr
          ? `Contato: ${assuntoStr}`
          : `Novo contato de ${nomeRemetente}`,
      html: montarEmailHtml({
        titulo,
        nome: escaparHtml(nomeRemetente),
        email: escaparHtml(emailRemetente),
        telefone: telefoneStr ? escaparHtml(telefoneStr) : null,
        assunto: assuntoStr ? escaparHtml(assuntoStr) : null,
        mensagemHtml: escaparHtml(mensagem).replace(/\n/g, "<br>"),
        logoUrl,
        fontUrl,
      }),
      text: montarEmailTexto({
        titulo,
        nome: nomeRemetente,
        email: emailRemetente,
        telefone: telefoneStr,
        assunto: assuntoStr,
        mensagem,
      }),
    });

    return res.status(200).json({ mensagem: "Email enviado com sucesso." });
  } catch {
    return res.status(500).json({ mensagem: "Erro ao enviar email." });
  }
}
