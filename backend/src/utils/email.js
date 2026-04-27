const nodemailer = require('nodemailer');

/**
 * Krijon transporterin e email-it.
 * Në mjedis development, përdor console.log si fallback.
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return null;
};

const transporter = createTransporter();

/**
 * Dërgon email
 * @param {Object} options - { to, subject, html }
 */
const dergoEmail = async ({ to, subject, html }) => {
  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@makinaqera.al',
        to,
        subject,
        html
      });
      console.log(`📧 Email u dërgua te: ${to}`);
    } catch (error) {
      console.error('❌ Gabim gjatë dërgimit të email:', error.message);
    }
  } else {
    // Fallback në development — shfaq në console
    console.log('\n📧 ═══════════════════════════════════════');
    console.log(`  Dërguesi: ${process.env.EMAIL_FROM || 'noreply@makinaqera.al'}`);
    console.log(`  Marrësi: ${to}`);
    console.log(`  Subjekti: ${subject}`);
    console.log('  Përmbajtja:', html.replace(/<[^>]*>/g, ' ').substring(0, 200));
    console.log('═══════════════════════════════════════\n');
  }
};

/**
 * Dërgon email verifikim
 */
const dergoEmailVerifikim = async (email, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verifiko-email/${token}`;
  await dergoEmail({
    to: email,
    subject: 'Verifiko adresën tënde të email-it — Makina Qera',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a237e, #0d47a1); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Makina Qera</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1a237e;">Përshëndetje!</h2>
          <p style="color: #424242; line-height: 1.6;">
            Faleminderit që u regjistruat në platformën tonë. 
            Klikoni butonin më poshtë për të verifikuar adresën tuaj të email-it.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${url}" 
               style="background: linear-gradient(135deg, #1a237e, #0d47a1); color: white; padding: 14px 32px; 
                      border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Verifiko Email-in
            </a>
          </div>
          <p style="color: #757575; font-size: 13px;">
            Nëse nuk e keni krijuar ju këtë llogari, injoroni këtë email.
          </p>
        </div>
      </div>
    `
  });
};

/**
 * Dërgon njoftim për konfirmim rezervimi
 */
const dergoKonfirmimRezerimi = async (email, qiradhenie) => {
  await dergoEmail({
    to: email,
    subject: 'Konfirmim Rezervimi — Makina Qera',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a237e, #0d47a1); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚗 Makina Qera</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <h2 style="color: #2e7d32;">✅ Rezervimi u konfirmua!</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Automjeti:</strong> ${qiradhenie.automjet || 'N/A'}</p>
            <p><strong>Data tërheqjes:</strong> ${qiradhenie.data_terheqjes || 'N/A'}</p>
            <p><strong>Data dorëzimit:</strong> ${qiradhenie.data_dorezimit || 'N/A'}</p>
            <p><strong>Vendi tërheqjes:</strong> ${qiradhenie.vendi_terheqjes || 'N/A'}</p>
          </div>
        </div>
      </div>
    `
  });
};

/**
 * Dërgon paralajmërim për sigurim që skadon
 */
const dergoParalajmerimSigurim = async (email, sigurim) => {
  await dergoEmail({
    to: email,
    subject: '⚠️ Paralajmërim: Sigurimi po skadon — Makina Qera',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e65100, #ff6d00); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Paralajmërim Sigurimi</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-radius: 0 0 12px 12px;">
          <p style="color: #424242; line-height: 1.6;">
            Sigurimi i mëposhtëm po skadon së shpejti:
          </p>
          <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #e65100; margin: 20px 0;">
            <p><strong>Automjeti:</strong> ${sigurim.targa || 'N/A'}</p>
            <p><strong>Shoqëria:</strong> ${sigurim.emri_shoqerise || 'N/A'}</p>
            <p><strong>Skadon më:</strong> ${sigurim.data_mbarimit || 'N/A'}</p>
          </div>
        </div>
      </div>
    `
  });
};

module.exports = {
  dergoEmail,
  dergoEmailVerifikim,
  dergoKonfirmimRezerimi,
  dergoParalajmerimSigurim
};
