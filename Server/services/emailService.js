// const nodemailer = require('nodemailer');

// const sendClaimNotification = async (claimer, form) => {
//   try {
//     // Create transporter with Gmail service and debug options
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//       },
//       logger: true, // Logs to console
//       debug: true   // Show detailed SMTP logs
//     });

//     // Verify SMTP connection
//     console.log("🔧 Verifying email transporter...");
//     await transporter.verify();
//     console.log("✅ Transporter verified. Ready to send emails.");

//     const recipientEmail = form.contact_email;
//     const recipientName = form.contact_name;

//     const mailOptions = {
//       from: `"${claimer.name}" <${claimer.email}>`,
//       replyTo: claimer.email,
//       to: recipientEmail,
//       subject: `Claim Request for your ${form.type === 'Lost' ? 'lost' : 'found'} item: ${form.item}`,
//       html: `
//         <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
//           <h2 style="color: #1976d2;">Item Claim Request</h2>
//           <p>Hello ${recipientName},</p>
//           <p>I believe the ${form.type === 'Lost' ? 'lost' : 'found'} item you reported on the Lost & Found platform belongs to me. I would like to claim it.</p>

//           <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #444;">Item Details:</h3>
//             <p><strong>Item:</strong> ${form.item}</p>
//             <p><strong>Category:</strong> ${form.category}</p>
//             <p><strong>Location:</strong> ${form.location}</p>
//             <p><strong>Date ${form.type === 'Lost' ? 'Lost' : 'Found'}:</strong> ${new Date(form.date_lost).toLocaleDateString()}</p>
//           </div>

//           <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
//             <h3 style="margin-top: 0; color: #1976d2;">My Contact Information:</h3>
//             <p><strong>Name:</strong> ${claimer.name}</p>
//             <p><strong>Email:</strong> ${claimer.email}</p>
//             <p>I would appreciate if we could arrange a time to meet so I can verify and retrieve my item.</p>
//           </div>

//           <p>Please reply to this email at your earliest convenience so we can coordinate the return of the item.</p>

//           <p style="margin-top: 30px; font-size: 0.9em; color: #777;">This message was sent through the Lost & Found platform.</p>
//         </div>
//       `
//     };

//     console.log('📧 Sending email to:', recipientEmail);

//     // Send email
//     const result = await transporter.sendMail(mailOptions);

//     console.log('✅ Email sent successfully! Message ID:', result.messageId);
//     console.log('📨 Full response:', result);

//     return result;
//   } catch (error) {
//     console.error('❌ Failed to send claim notification email:', error);
//     throw error;
//   }
// };

// module.exports = {
//   sendClaimNotification
// };


const nodemailer = require('nodemailer');

const sendClaimNotification = async (claimer, form) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.in',
      port: 465,
      secure: true, // SSL
      auth: {
        user: process.env.EMAIL_USER,     
        pass: process.env.EMAIL_PASSWORD  
      },
      logger: true,
      debug: true
    });

    await transporter.verify();
    console.log("✅ Zoho transporter ready.");

    const recipientEmail = form.contact_email;
    const recipientName = form.contact_name;

    const mailOptions = {
      from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
      replyTo: claimer.email,
      to: recipientEmail,
      subject: `Claim Request for your ${form.type === 'Lost' ? 'lost' : 'found'} item: ${form.item}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1976d2;">Item Claim Request</h2>
          <p>Hello ${recipientName},</p>
          <p>I believe the ${form.type === 'Lost' ? 'lost' : 'found'} item you reported on the Lost & Found platform belongs to me. I would like to claim it.</p>

          <div style="background-color: #f5f7fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #444;">Item Details:</h3>
            <p><strong>Item:</strong> ${form.item}</p>
            <p><strong>Category:</strong> ${form.category}</p>
            <p><strong>Location:</strong> ${form.location}</p>
            <p><strong>Date ${form.type === 'Lost' ? 'Lost' : 'Found'}:</strong> ${new Date(form.date_lost).toLocaleDateString()}</p>
          </div>

          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">My Contact Information:</h3>
            <p><strong>Name:</strong> ${claimer.name}</p>
            <p><strong>Email:</strong> ${claimer.email}</p>
            <p>I would appreciate if we could arrange a time to meet so I can verify and retrieve my item.</p>
          </div>

          <p>Please reply to this email at your earliest convenience so we can coordinate the return of the item.</p>
          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">This message was sent through the Lost & Found platform.</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent! Message ID:", result.messageId);
    return result;

  } catch (error) {
    console.error('❌ Failed to send claim notification email:', error);
    throw error;
  }
};

module.exports = {
  sendClaimNotification
};
