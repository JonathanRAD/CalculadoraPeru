import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(req: Request) {
  try {
    const { name, email, motive, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios (nombre, correo o mensaje).' },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured in environment variables.');
      return NextResponse.json(
        { error: 'El servicio de correo no está configurado actualmente.' },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    const motiveLabels: Record<string, string> = {
      sugerencia: 'Sugerencia de Calculadora',
      correccion: 'Reporte de Corrección / Tasa',
      alianza: 'Alianza Editorial / Comercial',
      otro: 'Consulta General',
    };

    const motiveText = motiveLabels[motive] || 'Mensaje de Usuario';

    const { data, error } = await resend.emails.send({
      from: 'CalculaPerú <contacto@calculaperu.com.pe>',
      to: ['rujeljonathan4@gmail.com'],
      replyTo: email,
      subject: `[CalculaPerú] ${motiveText}: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #00875a; padding-bottom: 12px; margin-bottom: 20px;">
            <h2 style="color: #00875a; margin: 0; font-size: 20px;">Nuevo Mensaje desde CalculaPerú</h2>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Recibido a través del formulario de contacto oficial</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold; width: 130px;">Remitente:</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: bold;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Correo de contacto:</td>
              <td style="padding: 8px 0; color: #00875a;"><a href="mailto:${email}" style="color: #00875a; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: bold;">Motivo:</td>
              <td style="padding: 8px 0; color: #0f172a;">${motiveText}</td>
            </tr>
          </table>

          <div style="background-color: #f8fafc; border-left: 4px solid #00875a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 13px; text-transform: uppercase;">Mensaje del Usuario:</h4>
            <p style="margin: 0; color: #1e293b; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>

          <div style="font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="margin: 0;">Puedes responder directamente a este correo haciendo clic en <strong>Responder</strong> para escribirle a ${email}.</p>
            <p style="margin: 4px 0 0 0;">CalculaPerú © ${new Date().getFullYear()} - calculaperu.com.pe</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return NextResponse.json(
        { error: 'Hubo un error al procesar el envío del correo.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error('API Contact route error:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar la solicitud.' },
      { status: 500 }
    );
  }
}
