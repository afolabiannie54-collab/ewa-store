import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOTPEmail(email, name, otp) {
  await resend.emails.send({
    from: 'EWA <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your EWA account',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FEFAE0;">
        <h1 style="color: #283618; font-size: 24px;">Hi ${name},</h1>
        <p style="color: #606C38; font-size: 15px; line-height: 1.6;">
          Use the code below to verify your EWA account. This code expires in 10 minutes.
        </p>
        <div style="background: #283618; color: #FEFAE0; font-size: 32px; font-weight: 600; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #7A7A5C; font-size: 13px;">
          If you didn't create an EWA account, you can safely ignore this email.
        </p>
      </div>
    `
  })
}

export async function sendEmailChangeOTP(newEmail, name, otp) {
  await resend.emails.send({
    from: 'EWA <onboarding@resend.dev>',
    to: newEmail,
    subject: 'Confirm your new email address',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FEFAE0;">
        <h1 style="color: #283618; font-size: 24px;">Hi ${name},</h1>
        <p style="color: #606C38; font-size: 15px; line-height: 1.6;">
          You requested to change your EWA account email to this address. Use the code below to confirm. This code expires in 10 minutes.
        </p>
        <div style="background: #283618; color: #FEFAE0; font-size: 32px; font-weight: 600; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="color: #7A7A5C; font-size: 13px;">
          If you didn't request this change, you can safely ignore this email and your account email will stay the same.
        </p>
      </div>
    `
  })
}

export async function sendOrderEmail(email, subject, heading, message) {
  await resend.emails.send({
    from: 'EWA <onboarding@resend.dev>',
    to: email,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FEFAE0;">
        <h1 style="color: #283618; font-size: 22px;">${heading}</h1>
        <p style="color: #606C38; font-size: 15px; line-height: 1.6;">${message}</p>
      </div>
    `
  })
}

export async function sendInquiryReply(email, name, originalMessage, replyMessage) {
  await resend.emails.send({
    from: 'EWA <onboarding@resend.dev>',
    to: email,
    subject: 'Re: Your message to EWA',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #FEFAE0;">
        <h1 style="color: #283618; font-size: 22px;">Hi ${name},</h1>
        <p style="color: #606C38; font-size: 15px; line-height: 1.6;">${replyMessage}</p>
        <div style="background: #FFFFFF; border-left: 3px solid #D6CEB8; padding: 16px; margin-top: 24px; border-radius: 8px;">
          <p style="color: #7A7A5C; font-size: 12px; margin-bottom: 8px;">Your original message:</p>
          <p style="color: #7A7A5C; font-size: 13px; font-style: italic;">"${originalMessage}"</p>
        </div>
      </div>
    `
  })
}