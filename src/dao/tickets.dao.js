import Ticket from '../models/Ticket.js';
import mongoose from 'mongoose';

class TicketsDao {
  create(ticketData) {
    return Ticket.create(ticketData);
  }

  findById(id) {
    return Ticket.findById(id);
  }

  findOne(filter) {
    return Ticket.findOne(filter);
  }

  find(filter, populate) {
    const query = Ticket.find(filter);
    return populate ? query.populate(populate.path, populate.select) : query;
  }

  count(filter = {}) {
    return Ticket.countDocuments(filter);
  }

  getReservedQuantity(eventId) {
    return Ticket.aggregate([
      { $match: { event: new mongoose.Types.ObjectId(eventId), status: { $in: ['confirmed', 'pending'] } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
  }

  updateById(id, data) {
    return Ticket.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }
}

export default new TicketsDao();
