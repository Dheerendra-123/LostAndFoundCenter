// const nodemailer = require('nodemailer');

// const sendClaimNotification = async (claimer, form) => {
//   try {
//     // Create transporter with Gmail service - using OAuth2 is better for production
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASSWORD
//         // For production, consider using OAuth2:
//         // type: 'OAuth2',
//         // user: process.env.EMAIL_USER,
//         // clientId: process.env.OAUTH_CLIENT_ID,
//         // clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         // refreshToken: process.env.OAUTH_REFRESH_TOKEN
//       }
//       // Remove debug options for production
//     });

//     // Verify SMTP connection without logging
//     await transporter.verify();
    
//     const recipientEmail = form.contact_email;
//     const recipientName = form.contact_name;
//     const platformName = 'Lost & Found Platform';

//     const mailOptions = {
//       // Use a consistent, trusted "from" address that matches your sending domain
//       from: `"${platformName}" <${process.env.EMAIL_USER}>`,
//       // Keep the reply-to as the claimer's email
//       replyTo: claimer.email,
//       to: recipientEmail,
//       subject: `Claim Request for your ${form.type === 'Lost' ? 'lost' : 'found'} item: ${form.item}`,
//       // Add text alternative for better deliverability
//       text: `
// Hello ${recipientName},

// I believe the ${form.type === 'Lost' ? 'lost' : 'found'} item you reported on the Lost & Found platform belongs to me. I would like to claim it.

// Item Details:
// - Item: ${form.item}
// - Category: ${form.category}
// - Location: ${form.location}
// - Date ${form.type === 'Lost' ? 'Lost' : 'Found'}: ${new Date(form.date_lost).toLocaleDateString()}

// My Contact Information:
// - Name: ${claimer.name}
// - Email: ${claimer.email}

// I would appreciate if we could arrange a time to meet so I can verify and retrieve my item.

// Please reply to this email at your earliest convenience so we can coordinate the return of the item.

// This message was sent through the Lost & Found platform.
//       `,
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

//     // Add headers to improve deliverability
//     mailOptions.headers = {
//       'X-Priority': '3', // Normal priority
//       'X-MSMail-Priority': 'Normal',
//       'Importance': 'Normal',
//       'List-Unsubscribe': `<mailto:unsubscribe@${process.env.EMAIL_DOMAIN}>`
//     };

//     // Send email with minimal logging
//     const result = await transporter.sendMail(mailOptions);
    
//     // Log only essential information, not full response
//     console.log(`Email sent successfully to ${recipientEmail}`);
    
//     return {
//       success: true,
//       messageId: result.messageId
//     };
//   } catch (error) {
//     console.error('Failed to send claim notification email:', error.message);
//     throw error;
//   }
// };

// module.exports = {
//   sendClaimNotification
// }; 


const nodemailer = require('nodemailer');

const sendClaimNotification = async (claimer, form) => {
  try {
    // Gmail-specific transporter configuration
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD // Use app password, not regular password
        // Note: Make sure you've enabled 2FA on your Gmail account and generated an app password
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    
    const recipientEmail = form.contact_email;
    const recipientName = form.contact_name;
    const platformName = 'Lost & Found Platform';
    const formattedDate = new Date(form.date_lost).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    // Create a simple but effective HTML content that avoids spam triggers
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Item Claim Request</title>
      </head>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2; margin-top: 0;">Item Claim Request</h2>
          <p>Hello ${recipientName},</p>
          <p>I believe the ${form.type === 'Lost' ? 'lost' : 'found'} item you reported on the Lost & Found platform belongs to me. I would like to claim it.</p>
          
          <div style="background-color: #f5f7fa; border-radius: 5px; margin: 20px 0; padding: 15px;">
            <h3 style="margin-top: 0; color: #444;">Item Details:</h3>
            <p><strong>Item:</strong> ${form.item}</p>
            <p><strong>Category:</strong> ${form.category}</p>
            <p><strong>Location:</strong> ${form.location}</p>
            <p><strong>Date ${form.type === 'Lost' ? 'Lost' : 'Found'}:</strong> ${formattedDate}</p>
          </div>
          
          <div style="background-color: #e3f2fd; border-radius: 5px; margin: 20px 0; padding: 15px;">
            <h3 style="margin-top: 0; color: #1976d2;">My Contact Information:</h3>
            <p><strong>Name:</strong> ${claimer.name}</p>
            <p><strong>Email:</strong> ${claimer.email}</p>
            <p>I would appreciate if we could arrange a time to meet so I can verify and retrieve my item.</p>
          </div>
          
          <p>Please reply to this email at your earliest convenience so we can coordinate the return of the item.</p>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #777; border-top: 1px solid #ddd; padding-top: 10px;">
            This message was sent through the Lost &amp; Found platform.
          </p>
        </div>
      </body>
      </html>
    `;

    // Create a plain text version that closely matches the HTML
    const textContent = `
Hello ${recipientName},

I believe the ${form.type === 'Lost' ? 'lost' : 'found'} item you reported on the Lost & Found platform belongs to me. I would like to claim it.

ITEM DETAILS:
- Item: ${form.item}
- Category: ${form.category}
- Location: ${form.location}
- Date ${form.type === 'Lost' ? 'Lost' : 'Found'}: ${formattedDate}

MY CONTACT INFORMATION:
- Name: ${claimer.name}
- Email: ${claimer.email}

I would appreciate if we could arrange a time to meet so I can verify and retrieve my item.

Please reply to this email at your earliest convenience so we can coordinate the return of the item.

This message was sent through the Lost & Found platform.
    `;

    // Use the Gmail address as the from address (required for Gmail)
    const fromAddress = `"${platformName}" <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: fromAddress,
      to: `"${recipientName}" <${recipientEmail}>`,
      replyTo: `"${claimer.name}" <${claimer.email}>`,
      subject: `Claim Request: ${form.item} (${form.type === 'Lost' ? 'Lost' : 'Found'} Item)`,
      text: textContent,
      html: htmlContent,
      // Add important headers that Gmail will respect
      headers: {
        'X-Priority': '3', // Normal priority
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Auto-Response-Suppress': 'OOF, AutoReply'
      }
    };

    // Send email
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent successfully to ${recipientEmail}`);
    
    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    console.error('Failed to send claim notification email:', error.message);
    throw error;
  }
};

module.exports = {
  sendClaimNotification
};