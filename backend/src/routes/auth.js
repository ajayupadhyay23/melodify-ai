const express = require('express');
const { Resend } = require('resend');
const supabase = require('../config/supabase');

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ── Generate 6-digit OTP ──────────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Styled email HTML ─────────────────────────────────────────────────────────
function buildEmailHTML(otp, email) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#0a0a1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a1a;padding:40px 20px;">
    <tr><td align="center">
      <table width="500" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#12122a,#1a1a35);border:1px solid rgba(139,92,246,0.25);border-radius:20px;overflow:hidden;max-width:500px;width:100%;">
        <tr><td style="background:linear-gradient(135deg,#4c1d95,#1e3a5f);padding:36px 40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:12px;">🎵</div>
          <h1 style="color:#fff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;">Melodify AI</h1>
          <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:6px 0 0;">Music Theory Trainer</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#e0d0ff;font-size:20px;font-weight:700;margin:0 0 12px;">Verify Your Email Address</h2>
          <p style="color:#a0a0c0;font-size:15px;line-height:1.6;margin:0 0 32px;">
            Use the 6-digit code below to complete your registration for
            <strong style="color:#c084fc;">${email}</strong>.
            This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background:rgba(139,92,246,0.12);border:2px solid rgba(139,92,246,0.4);border-radius:16px;padding:28px;text-align:center;margin-bottom:32px;">
            <p style="color:#a0a0c0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Your Verification Code</p>
            <div style="letter-spacing:14px;font-size:44px;font-weight:900;color:#c084fc;font-family:'Courier New',monospace;padding-left:14px;">${otp}</div>
          </div>
          <p style="color:#606080;font-size:13px;line-height:1.6;margin:0;">
            If you didn't request this code, you can safely ignore this email.<br>
            Do not share this code with anyone.
          </p>
        </td></tr>
        <tr><td style="border-top:1px solid rgba(139,92,246,0.1);padding:20px 40px;text-align:center;">
          <p style="color:#404060;font-size:12px;margin:0;">© 2025 Melodify AI · Music Theory Trainer</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  try {
    // Save OTP to Supabase
    const { error: dbError } = await supabase
      .from('otp_codes')
      .upsert({ email, code: otp, expires_at: expiresAt, used: false }, { onConflict: 'email' });

    if (dbError) {
      console.error('DB Error saving OTP:', dbError.message);
      return res.status(500).json({ success: false, error: 'Failed to save OTP. Run the otp_codes table SQL in Supabase.' });
    }

    // Send email via Resend
    console.log(`\n-----------------------------------------`);
    console.log(`🔑 OTP CODE for ${email}: ${otp}`);
    console.log(`-----------------------------------------\n`);

    const { error: emailError } = await resend.emails.send({
      from: 'Melodify AI <onboarding@resend.dev>',
      to: [email],
      subject: '🎵 Your Melodify Verification Code',
      html: buildEmailHTML(otp, email),
    });

    if (emailError) {
      console.warn('Resend Notification:', emailError.message);
      // We still return success:true because the user can see the OTP in the server logs
      // and we don't want to block registration if only the email part fails.
      return res.json({ 
        success: true, 
        message: 'OTP generated (Email delivery restricted in dev mode. Check server console for code.)',
        devMode: true 
      });
    }

    console.log(`✅ OTP sent to ${email}`);
    res.json({ success: true, message: 'OTP sent successfully' });

  } catch (err) {
    console.error('Send OTP Error:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error during OTP generation' });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ success: false, error: 'Email and code are required' });

  try {
    const { data, error } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code.trim())
      .eq('used', false)
      .single();

    if (error || !data) {
      return res.status(400).json({ success: false, error: 'Invalid OTP code. Please try again.' });
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as used
    await supabase.from('otp_codes').update({ used: true }).eq('email', email);

    console.log(`✅ OTP verified for ${email}`);
    res.json({ success: true, message: 'OTP verified successfully' });

  } catch (err) {
    console.error('Verify OTP Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
