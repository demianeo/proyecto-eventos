import crypto from 'crypto';
import eventsRepository from '../repositories/events.repository.js';
import ticketsRepository from '../repositories/tickets.repository.js';
import { toTicketDTO } from '../dto/ticket.dto.js';
import { sendTicketConfirmation } from '../config/mail.config.js';
import { isValidObjectId } from '../utils/object-id.js';

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, message) => {
  if (!isValidObjectId(id)) {
    throw createError(404, message);
  }
};

const validateQuantity = (quantity) => {
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    throw createError(400, 'La cantidad debe ser un número entero mayor a 0');
  }

  return Number(quantity);
};

const getEvent = async (eventId) => {
  validateObjectId(eventId, 'Evento no encontrado');
  const event = await eventsRepository.findEventById(eventId);

  if (!event) {
    throw createError(404, 'Evento no encontrado');
  }

  return event;
};

const ensureEventAvailable = (event) => {
  if (event.status !== 'published') {
    throw createError(400, 'El evento no está disponible para inscripciones');
  }
};

class TicketsService {
  async createTicket(eventId, data, user) {
    const quantity = validateQuantity(data?.quantity);
    const event = await getEvent(eventId);
    ensureEventAvailable(event);

    const existingTicket = await ticketsRepository.findActiveTicketByUserAndEvent(user.id, eventId);

    if (existingTicket) {
      throw createError(409, 'Ya tenés una inscripción activa para este evento');
    }

    const reservedQuantity = await ticketsRepository.getReservedQuantity(eventId);

    if (event.capacity - reservedQuantity < quantity) {
      throw createError(400, 'No hay cupos disponibles suficientes');
    }

    const ticket = await ticketsRepository.createTicket({
      user: user.id,
      event: eventId,
      status: 'confirmed',
      quantity,
      reservationCode: `TKT-${crypto.randomUUID().toUpperCase()}`
    });

    try {
      await sendTicketConfirmation({ email: user.email, ticket, event });
    } catch (error) {
      console.error(`No se pudo enviar el email de confirmación: ${error.message}`);
    }

    return toTicketDTO(ticket);
  }

  async getMyTickets(user) {
    const tickets = await ticketsRepository.findUserTickets(user.id);
    return tickets.map(toTicketDTO);
  }

  async getEventTickets(eventId, user) {
    const event = await getEvent(eventId);
    const isAdmin = user.role === 'admin';
    const isOwner = event.organizer.toString() === user.id.toString();

    if (!isAdmin && !isOwner) {
      throw createError(403, 'No autorizado');
    }

    const tickets = await ticketsRepository.findEventTickets(eventId);
    return tickets.map(toTicketDTO);
  }

  async cancelTicket(ticketId, user) {
    validateObjectId(ticketId, 'Ticket no encontrado');
    const ticket = await ticketsRepository.findTicketById(ticketId);

    if (!ticket) {
      throw createError(404, 'Ticket no encontrado');
    }

    const isAdmin = user.role === 'admin';
    const isOwner = ticket.user.toString() === user.id.toString();

    if (!isAdmin && !isOwner) {
      throw createError(403, 'No autorizado');
    }

    if (ticket.status === 'cancelled') {
      throw createError(400, 'El ticket ya está cancelado');
    }

    return toTicketDTO(await ticketsRepository.cancelTicket(ticketId, new Date()));
  }
}

export default new TicketsService();
