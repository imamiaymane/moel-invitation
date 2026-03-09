import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { name, email } = req.body;

    await resend.emails.send({
      from: "MOEL <info@moel.de>",
      to: email,
      subject: "Ihre Einladung zur MOEL Eröffnung",
      html: `
        <h2>Vielen Dank ${name}</h2>
        <p>Ihre Teilnahme wurde bestätigt.</p>

        <p><b>20. März 2026</b></p>
        <p>Eckenheimer Landstraße 48<br>60318 Frankfurt</p>

        <img src="https://rdnauhyhjiefgitgddoa.supabase.co/storage/v1/object/public/invitations/invitation.png" width="400"/>
      `
    });

    res.status(200).json({ success: true });

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
}