import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'EWA <hello@annaafolabi.online>'

function wrap(bodyHtml) {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>EWA Skincare</title>
</head>
<body style="margin:0;padding:0;background-color:#F0EBD0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F0EBD0;">
    <tr>
      <td align="center" style="padding:48px 16px 56px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td align="center" style="background-color:#283618;padding:28px 40px;border-radius:16px 16px 0 0;">
              <span style="font-size:30px;font-weight:700;color:#FEFAE0;letter-spacing:-1.5px;font-family:Georgia,'Times New Roman',serif;">Ewa</span>
            </td>
          </tr>

          <!-- BODY CARD -->
          <tr>
            <td style="background-color:#FFFFFF;padding:40px 40px 36px;border-left:1px solid #E2DCC8;border-right:1px solid #E2DCC8;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#F5F0DC;padding:22px 40px;border-radius:0 0 16px 16px;border:1px solid #E2DCC8;border-top:none;">
              <p style="margin:0 0 4px;font-size:13px;color:#7A7A5C;line-height:1.6;text-align:center;">
                EWA Skincare &middot; Lagos, Nigeria
              </p>
              <p style="margin:0;font-size:13px;color:#7A7A5C;line-height:1.6;text-align:center;">
                Questions? <a href="mailto:hello@ewaskincare.com" style="color:#606C38;text-decoration:underline;">hello@ewaskincare.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function otpBlock(otp) {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:28px 0;">
      <tr>
        <td align="center" style="background-color:#283618;padding:28px;border-radius:14px;">
          <span style="font-size:40px;font-weight:700;color:#FEFAE0;letter-spacing:12px;font-family:Courier,monospace;">${otp}</span>
        </td>
      </tr>
    </table>`
}

function h1(text) {
  return `<h1 style="margin:0 0 14px;font-size:24px;font-weight:700;color:#283618;line-height:1.25;font-family:Georgia,'Times New Roman',serif;">${text}</h1>`
}

function body(text) {
  return `<p style="margin:0 0 16px;font-size:16px;color:#374151;line-height:1.75;">${text}</p>`
}

function small(text) {
  return `<p style="margin:0 0 8px;font-size:13px;color:#7A7A5C;line-height:1.6;">${text}</p>`
}

function divider() {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;"><tr><td style="border-top:1px solid #E8E3D0;font-size:0;line-height:0;">&nbsp;</td></tr></table>`
}

export async function sendOTPEmail(email, name, otp) {
  const html = wrap(`
    ${h1(`Hi ${name},`)}
    ${body('Thanks for signing up. Use the verification code below to confirm your email address and activate your EWA account.')}
    ${body('This code expires in <strong style="color:#283618;">10 minutes</strong>.')}
    ${otpBlock(otp)}
    ${divider()}
    ${small("If you didn't create an EWA account, you can safely ignore this email.")}
  `)
  await resend.emails.send({ from: FROM, to: email, subject: 'Verify your EWA account', html })
}

export async function sendEmailChangeOTP(newEmail, name, otp) {
  const html = wrap(`
    ${h1(`Hi ${name},`)}
    ${body('You requested to change your EWA account email to this address. Use the code below to confirm the change.')}
    ${body('This code expires in <strong style="color:#283618;">10 minutes</strong>.')}
    ${otpBlock(otp)}
    ${divider()}
    ${small("If you didn't request this change, you can safely ignore this email — your account email will remain unchanged.")}
  `)
  await resend.emails.send({ from: FROM, to: newEmail, subject: 'Confirm your new email address', html })
}

export async function sendPasswordResetEmail(email, name, otp) {
  const html = wrap(`
    ${h1(`Hi ${name},`)}
    ${body('We received a request to reset your EWA account password. Use the code below to set a new one.')}
    ${body('This code expires in <strong style="color:#283618;">10 minutes</strong>.')}
    ${otpBlock(otp)}
    ${divider()}
    ${small("If you didn't request a password reset, no action is needed — your account is safe and your password has not been changed.")}
  `)
  await resend.emails.send({ from: FROM, to: email, subject: 'Reset your EWA password', html })
}

export async function sendOrderEmail(email, subject, heading, message) {
  const html = wrap(`
    ${h1(heading)}
    ${body(message)}
    ${divider()}
    ${small('If you have any questions about your order, reply to this email or visit our <a href="https://ewaskincare.com/contact" style="color:#606C38;text-decoration:underline;">Contact page</a>.')}
  `)
  await resend.emails.send({ from: FROM, to: email, subject, html })
}

export async function sendInquiryReply(email, name, originalMessage, replyMessage) {
  const html = wrap(`
    ${h1(`Hi ${name},`)}
    ${body(replyMessage)}
    ${divider()}
    <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#7A7A5C;text-transform:uppercase;letter-spacing:0.08em;">Your original message</p>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="background-color:#F5F0DC;border-left:3px solid #606C38;padding:14px 18px;border-radius:0 8px 8px 0;">
          <p style="margin:0;font-size:14px;color:#4A4A35;line-height:1.7;font-style:italic;">&ldquo;${originalMessage}&rdquo;</p>
        </td>
      </tr>
    </table>
    ${divider()}
    ${small('Feel free to reply directly to this email if you have any follow-up questions.')}
  `)
  await resend.emails.send({ from: FROM, to: email, subject: 'Re: Your message to EWA', html })
}
