const nodemailer = require('nodemailer');
const environment = require('../../config/environment');

class EmailService {
  constructor() {
    const hasAuth = environment.smtp.user && environment.smtp.pass;
    if (hasAuth) {
      this.transporter = nodemailer.createTransport({
        host: environment.smtp.host,
        port: environment.smtp.port,
        secure: environment.smtp.port === 465,
        auth: {
          user: environment.smtp.user,
          pass: environment.smtp.pass
        }
      });
    } else {
      this.transporter = null;
    }
  }

  async sendPasswordResetLink(to, resetLink) {
    if (!this.transporter) {
      const err = new Error('SMTP no configurado. No se puede enviar el correo.');
      err.statusCode = 502;
      throw err;
    }

    const mailOptions = {
      from: environment.smtp.from,
      to,
      subject: 'Restablece tu contraseña - Repositorio Digital UNEFA',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#f4f7fc;border-radius:16px">
          <div style="text-align:center;margin-bottom:24px">
            <div style="display:inline-block;background:#0b57a4;color:white;width:48px;height:48px;line-height:48px;border-radius:16px;font-size:18px;font-weight:900">RD</div>
            <p style="color:#0b57a4;font-size:11px;font-weight:700;letter-spacing:3px;margin:8px 0 0 0">UNEFA</p>
          </div>
          <div style="background:white;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.06)">
            <h2 style="font-size:20px;margin:0 0 8px 0;color:#1e293b">Restablece tu contraseña</h2>
            <p style="font-size:14px;color:#64748b;line-height:1.6">Has solicitado restablecer tu contraseña en el Repositorio Digital UNEFA. Haz clic en el botón de abajo para crear una nueva contraseña.</p>
            <div style="text-align:center;margin:24px 0">
              <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#0b57a4,#073a6a);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700">Restablecer contraseña</a>
            </div>
            <p style="font-size:13px;color:#64748b;line-height:1.6">Este enlace expira en <strong>30 minutos</strong>. Si no solicitaste este cambio, ignora este mensaje.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
            <p style="font-size:12px;color:#94a3b8">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p style="font-size:11px;color:#94a3b8;word-break:break-all">${resetLink}</p>
          </div>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();
