import Event from '../models/Event.js';

class EventsDao {
  findById(id) {
    return Event.findById(id);
  }

  create(eventData) {
    return Event.create(eventData);
  }

  find(filter, { skip, limit, sort }) {
    return Event.find(filter).sort(sort).skip(skip).limit(limit);
  }

  count(filter) {
    return Event.countDocuments(filter);
  }

  updateById(id, eventData) {
    return Event.findByIdAndUpdate(id, eventData, { new: true, runValidators: true });
  }
}

export default new EventsDao();
