import type { NextApiRequest, NextApiResponse } from "next";
import pool from "../../src/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const secret = process.env.DIAGNOSTIC_SECRET;
  const fornecido = req.headers["x-diagnostic-key"];

  if (!secret || fornecido !== secret) {
    return res.status(404).end();
  }

  try {
    await pool.query("SELECT 1");
    return res.status(200).json({ conectado: true });
  } catch {
    return res.status(500).json({ conectado: false });
  }
}
