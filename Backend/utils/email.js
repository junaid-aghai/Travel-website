const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter based on environment configuration.
 * Uses JSON transport (logs to console) in development when SMTP is not configured.
 */
function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass }
    });
  }

  // Fallback: JSON transport for development (logs email content)
  return nodemailer.createTransport({ jsonTransport: true });
}

/**
 * Sends a booking confirmation email to the customer.
 * @param {Object} booking - The booking document from MongoDB
 */
async function sendBookingConfirmation(booking) {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"TravelKro Admin" <no-reply@travelkro.com>',
      to: booking.userEmail,
      subject: `Booking Confirmed: ${booking.destinationName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb;">🎉 Your Booking is Confirmed!</h2>
          <p>Dear <strong>${booking.userName}</strong>,</p>
          <p>Great news! Your travel reservation for <strong>${booking.destinationName}</strong> has been officially confirmed by our admin team.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 5px 0;"><strong>Destination:</strong> ${booking.destinationName}</p>
            <p style="margin: 5px 0;"><strong>Travel Date:</strong> ${booking.travelDate || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Travelers:</strong> ${booking.persons} person(s)</p>
            <p style="margin: 5px 0;"><strong>Total Paid:</strong> $${(booking.totalPrice || 0).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">Confirmed</span></p>
          </div>
          <p>Thank you for choosing TravelKro! We wish you a safe and memorable journey.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #888;">TravelKro Inc. • Discover breathtaking destinations worldwide.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL NOTIFICATION SENT] To: ${booking.userEmail} | Subject: ${mailOptions.subject}`);
    return info;
  } catch (emailErr) {
    console.error('Email sending error:', emailErr);
  }
}

module.exports = { createTransporter, sendBookingConfirmation };
