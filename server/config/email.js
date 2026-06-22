import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email simulado] Para: ${to} | Asunto: ${subject}`);
    return { success: true, simulated: true };
  }
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Bienvenida a Montessori en Casa",
    html: `<h2>Hola ${name}</h2><p>Tu cuenta fue creada. Te avisaremos cuando esté activa para reservar sesiones.</p>`,
  });

export const sendAppointmentRequestedEmail = (email, name, date, serviceType) =>
  sendEmail({
    to: email,
    subject: "Solicitud de cita recibida",
    html: `<h2>Hola ${name}</h2><p>Recibimos tu solicitud para <b>${serviceType}</b> el <b>${date}</b>. Adriana confirmará pronto.</p>`,
  });

export const sendAppointmentConfirmedEmail = (email, name, date, meetingLink) =>
  sendEmail({
    to: email,
    subject: "Tu cita fue confirmada",
    html: `<h2>Hola ${name}</h2><p>Tu sesión del <b>${date}</b> está confirmada.${meetingLink ? `<br><a href="${meetingLink}">Unirse a la videollamada</a>` : ""}</p>`,
  });

export const sendSessionNotePublishedEmail = (email, name) =>
  sendEmail({
    to: email,
    subject: "Nueva nota de sesión disponible",
    html: `<h2>Hola ${name}</h2><p>Adriana publicó una nueva nota de sesión. Ingresa a tu panel para leerla.</p><p><a href="${process.env.FRONTEND_URL}/sesiones">Ver mis sesiones</a></p>`,
  });
