import ticketsDao from '../dao/tickets.dao.js';

class TicketsRepository {
  createTicket(data) {
    return ticketsDao.create(data);
  }

  findTicketById(id) {
    return ticketsDao.findById(id);
  }

  findActiveTicketByUserAndEvent(userId, eventId) {
    return ticketsDao.findOne({
      user: userId,
      event: eventId,
      status: { $in: ['confirmed', 'pending'] }
    });
  }

  async getReservedQuantity(eventId) {
    const result = await ticketsDao.getReservedQuantity(eventId);
    return result[0]?.total || 0;
  }

  findUserTickets(userId) {
    return ticketsDao.find({ user: userId }, { path: 'event', select: 'title date location' });
  }

  findEventTickets(eventId) {
    return ticketsDao.find({ event: eventId });
  }

  cancelTicket(id, cancelledAt) {
    return ticketsDao.updateById(id, { status: 'cancelled', cancelledAt });
  }
}

export default new TicketsRepository();
