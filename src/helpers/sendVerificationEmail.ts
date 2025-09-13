import { resend, FROM_EMAIL } from '@/lib/resend';
import { ApiResponse } from '@/types/ApiResponse';
import VerificationEmail from '../../emails/VerificationEmail';
import { render } from '@react-email/render';

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
  try {
    const html = await render(VerificationEmail({ username, code: verifyCode }));
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || FROM_EMAIL,
      to: email,
      subject: 'Your Verification Code',
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      return { success: false, message: 'Failed to send verification email.' };
    }
    return { success: true, message: 'Verification email sent successfully.' };
  } catch (e) {
    console.error('Error sending verification email:', e);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
