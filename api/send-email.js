import { Resend } from "resend";

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(503).json({
      success: false,
      error: "E-Mail-Service ist nicht konfiguriert."
    });
  }

  const { name, email } = req.body || {};

  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({
      success: false,
      error: "Ungultige Eingabedaten."
    });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeName = escapeHtml(name.trim());
  const safeEmail = email.trim().toLowerCase();

  try {
    const data = await resend.emails.send({
      from: "MOEL <info@moel.de>",
      to: safeEmail,
      subject: "Ihre Einladung zur MOEL Eroffnung",
      html: `
        <div style="margin:0;padding:32px 18px;background:#0c090b;font-family:Georgia,'Times New Roman',serif;color:#f5ebdf;">
          <div style="max-width:620px;margin:0 auto;padding:32px;background:#171114;border:1px solid rgba(255,255,255,0.08);border-radius:24px;">
            <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:#d8bf9f;">
              MOEL Opening
            </p>
            <h1 style="margin:0 0 16px;font-size:34px;line-height:1.1;font-weight:500;">
              Vielen Dank, ${safeName}
            </h1>
            <p style="margin:0 0 16px;color:#d1c0b1;font-size:16px;line-height:1.7;">
              Ihre Teilnahme wurde erfolgreich bestatigt. Wir freuen uns darauf, Sie zur
              Eroffnung von MOEL willkommen zu heissen.
            </p>
            <p style="margin:0 0 4px;color:#f5ebdf;font-size:16px;"><strong>21. Marz 2026</strong></p>
            <p style="margin:0 0 26px;color:#d1c0b1;font-size:16px;line-height:1.6;">
              Eckenheimer Landstrasse 48<br>60318 Frankfurt am Main
            </p>
            <img
              src="https://rdnauhyhjiefgitgddoa.supabase.co/storage/v1/object/public/invitations/invitations.png"
              alt="MOEL Einladung"
              width="420"
              style="display:block;width:100%;max-width:420px;margin:0 auto 26px;border-radius:20px;"
            >
            <p style="margin:0;color:#d1c0b1;font-size:14px;line-height:1.7;">
              Diese Einladung wurde fur <strong style="color:#f5ebdf;">${escapeHtml(safeEmail)}</strong> erstellt.
            </p>
          </div>
        </div>
      `
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({
      success: false,
      error: "Die Einladung konnte nicht versendet werden."
    });
  }
}
