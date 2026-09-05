/**
 * SMTP CLIENT & HEALTHCHECK — MODULE AUTONOME (Node.js 24)
 * Pilier : 03_Developpement_App_and_Design / Apps / Outbound Sniper / Engine (< 230 lignes)
 * Connexion sécurisée directe (TLS socket) pour Gmail & Google Workspace (Port 465 SSL)
 */

const tls = require('node:tls');

class SmtpClient {
  constructor(options = {}) {
    this.host = options.host || 'smtp.gmail.com';
    this.port = options.port || 465;
    this.user = options.user || '';
    this.pass = options.pass || '';
    this.timeout = options.timeout || 10000;
  }

  cleanEmail(addr) {
    if (!addr) return '';
    const m = String(addr).match(/<([^>]+)>/);
    return (m ? m[1] : addr).trim();
  }

  async verifyConnection() {
    return new Promise((resolve) => {
      if (!this.user || !this.pass) {
        return resolve({
          success: false,
          code: 'NO_CREDENTIALS',
          message: "Identifiants manquants (Email ou Mot de passe d'application Google 16 car.)."
        });
      }

      let socket;
      let buffer = '';
      let step = 'INIT';
      let resolved = false;

      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        try {
          if (socket && !socket.destroyed) {
            socket.write('QUIT\r\n');
            socket.end();
          }
        } catch {}
        resolve(result);
      };

      const timer = setTimeout(() => {
        finish({
          success: false,
          code: 'TIMEOUT',
          message: `Délai dépassé (${this.timeout}ms) lors de la négociation avec ${this.host}:${this.port}.`
        });
      }, this.timeout);

      try {
        socket = tls.connect({ host: this.host, port: this.port, rejectUnauthorized: true }, () => {});
        socket.setEncoding('utf-8');

        socket.on('data', (data) => {
          buffer += data;
          const lines = buffer.split('\r\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.trim()) continue;
            const code = parseInt(line.substring(0, 3), 10);

            if (step === 'INIT' && code === 220) {
              step = 'EHLO';
              socket.write(`EHLO ${this.cleanEmail(this.user).split('@')[1] || 'localhost'}\r\n`);
            } else if (step === 'EHLO' && (code === 250 || line.startsWith('250 '))) {
              if (line.startsWith('250 ')) {
                step = 'AUTH_LOGIN';
                socket.write('AUTH LOGIN\r\n');
              }
            } else if (step === 'AUTH_LOGIN' && code === 334) {
              step = 'USER';
              socket.write(`${Buffer.from(this.cleanEmail(this.user)).toString('base64')}\r\n`);
            } else if (step === 'USER' && code === 334) {
              step = 'PASS';
              socket.write(`${Buffer.from(this.pass.replace(/\s+/g, '')).toString('base64')}\r\n`);
            } else if (step === 'PASS') {
              clearTimeout(timer);
              if (code === 235) {
                return finish({
                  success: true,
                  code: 'AUTH_SUCCESS',
                  message: 'Connexion SMTP Google validée avec succès (Handshake 235).'
                });
              } else {
                return finish({
                  success: false,
                  code: 'AUTH_FAILED',
                  message: `Échec d'authentification Google (${line}). Vérifiez votre mot de passe d'application 16 caractères.`
                });
              }
            } else if (code >= 400) {
              clearTimeout(timer);
              return finish({ success: false, code: `ERR_${code}`, message: `Erreur serveur SMTP : ${line}` });
            }
          }
        });

        socket.on('error', (err) => {
          clearTimeout(timer);
          finish({ success: false, code: 'SOCKET_ERROR', message: `Erreur réseau TLS : ${err.message}` });
        });
      } catch (err) {
        clearTimeout(timer);
        finish({ success: false, code: 'EXCEPTION', message: `Exception TLS : ${err.message}` });
      }
    });
  }

  async sendEmail({ from, to, subject, htmlBody, textBody }) {
    if (this.pass === 'dry_run_key' || !this.pass) {
      return { success: true, mode: 'DRY_RUN', messageId: `dry_${Date.now()}` };
    }

    const cleanSender = this.cleanEmail(from || this.user);
    const cleanRecipient = this.cleanEmail(to);

    return new Promise((resolve) => {
      let socket;
      let buffer = '';
      let step = 'INIT';
      let resolved = false;

      const finish = (res) => {
        if (resolved) return;
        resolved = true;
        try {
          if (socket && !socket.destroyed) {
            socket.write('QUIT\r\n');
            socket.end();
          }
        } catch {}
        resolve(res);
      };

      const timer = setTimeout(() => {
        finish({ success: false, error: 'Timeout envoi email (12s)' });
      }, 12000);

      try {
        socket = tls.connect({ host: this.host, port: this.port, rejectUnauthorized: true }, () => {});
        socket.setEncoding('utf-8');

        socket.on('data', (data) => {
          buffer += data;
          const lines = buffer.split('\r\n');
          buffer = lines.pop();

          for (const line of lines) {
            if (!line.trim()) continue;
            const code = parseInt(line.substring(0, 3), 10);

            if (step === 'INIT' && code === 220) {
              step = 'EHLO';
              socket.write(`EHLO ${cleanSender.split('@')[1] || 'localhost'}\r\n`);
            } else if (step === 'EHLO' && line.startsWith('250 ')) {
              step = 'AUTH_LOGIN';
              socket.write('AUTH LOGIN\r\n');
            } else if (step === 'AUTH_LOGIN' && code === 334) {
              step = 'USER';
              socket.write(`${Buffer.from(this.cleanEmail(this.user)).toString('base64')}\r\n`);
            } else if (step === 'USER' && code === 334) {
              step = 'PASS';
              socket.write(`${Buffer.from(this.pass.replace(/\s+/g, '')).toString('base64')}\r\n`);
            } else if (step === 'PASS' && code === 235) {
              step = 'MAIL_FROM';
              socket.write(`MAIL FROM:<${cleanSender}>\r\n`);
            } else if (step === 'MAIL_FROM' && code === 250) {
              step = 'RCPT_TO';
              socket.write(`RCPT TO:<${cleanRecipient}>\r\n`);
            } else if (step === 'RCPT_TO' && code === 250) {
              step = 'DATA';
              socket.write('DATA\r\n');
            } else if (step === 'DATA' && code === 354) {
              step = 'CONTENT';
              const msgId = `<sniper.${Date.now()}.${Math.random().toString(36).slice(2)}@${cleanSender.split('@')[1] || 'gmail.com'}>`;
              const mime = [
                `From: ${from}`,
                `To: ${to}`,
                `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
                `Message-ID: ${msgId}`,
                `Date: ${new Date().toUTCString()}`,
                `MIME-Version: 1.0`,
                `Content-Type: text/html; charset=UTF-8`,
                `Content-Transfer-Encoding: base64`,
                '',
                Buffer.from(htmlBody || textBody).toString('base64'),
                '.',
                ''
              ].join('\r\n');
              socket.write(mime);
            } else if (step === 'CONTENT' && code === 250) {
              clearTimeout(timer);
              return finish({ success: true, code: 'SENT', messageId: line, message: 'Email transmis à Google avec succès.' });
            } else if (code >= 400) {
              clearTimeout(timer);
              return finish({ success: false, code: `ERR_${code}`, error: line });
            }
          }
        });

        socket.on('error', (err) => {
          clearTimeout(timer);
          finish({ success: false, error: err.message });
        });
      } catch (err) {
        clearTimeout(timer);
        finish({ success: false, error: err.message });
      }
    });
  }
}

module.exports = { SmtpClient };
