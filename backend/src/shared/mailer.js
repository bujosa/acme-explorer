import SendGridMailer from '@sendgrid/mail';

class NodeMailer {
  constructor(mailer, options = {}) {
    this.mailer = mailer ?? SendGridMailer;
  }

  send({ email, subject, text }) {
    if (process.env.NODE_ENV !== 'test') {
      this.mailer.setApiKey(process.env.SENDGRID_API_KEY);
      const mailOptions = {
        from: 'no-reply@acme-explorer.com',
        to: email,
        subject: subject,
        text: text
      };

      return this.mailer.send(mailOptions);
    }
  }
}

export const Mailer = new NodeMailer();
