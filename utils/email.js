const nodemailer = require('nodemailer');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Alessandro Battiato <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    // template for PUG templates, of course this needs a rework if used without SSR
    const html = 'the pug template file';

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
};

/*
const sendEmail = async (options) => {
  // Create a transporter (a service that will send the email)
  /*
    const transporter = nodemailer.createTransport({
      // service: 'Gmail', NOT IDEAL for real production applications
      // Activate in gmail "less secure app" option even though gmail is NOT a good option for production applications, because of emails limit
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  // Define the email options
  /*
    const mailOptions = {
      from: 'Alessandro Battiato <email@example>',
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html:
    };
  // Actually send the email
  await transporter.sendMail(mailOptions);
};
*/
