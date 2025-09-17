const transporter = require("../config/mail.config");

const sendEmail = async (senderEmail, recipientEmail, subject, message) => {
  try {

    if (!recipientEmail) {
      throw new Error("Recipient email is not defined");
    }

    await transporter.sendMail({
      from: senderEmail,
      to: recipientEmail,
      subject,
      html: message,
    });
    console.log("✅ Email sent successfully");
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

const sendEmailWithAttachment = async (mailOptions) => {
  try {
    console.log(`📤 Sending email to ${mailOptions.to}...`);
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${mailOptions.to}`);
  } catch (error) {
    console.error("❌ Error sending email with attachment:", error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendEmailWithAttachment,
};
