import nodemailer from 'nodemailer';

const hasMailConfiguration = () => [
  process.env.MAIL_HOST,
  process.env.MAIL_PORT,
  process.env.MAIL_USER,
  process.env.MAIL_PASS,
  process.env.MAIL_FROM
].every(Boolean);

const createTransporter = () => nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: Number(process.env.MAIL_PORT) === 465,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

export const sendTicketConfirmation = async ({ email, ticket, event }) => {
  if (!hasMailConfiguration()) {
    console.warn('Email de confirmación no enviado: faltan variables MAIL_*');
    return false;
  }

  await createTransporter().sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `Confirmación de inscripción: ${event.title}`,
    text: `Tu reserva ${ticket.reservationCode} fue confirmada para ${event.title}. Cantidad: ${ticket.quantity}.`
  });

  return true;
};
