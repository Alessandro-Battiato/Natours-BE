const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create a transporter (a service that will send the email)
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

module.exports = sendEmail;
