import eventsDao from '../dao/events.dao.js';

class EventsRepository {
  findEvents(filter, options) {
    return eventsDao.find(filter, options);
  }

  findEventById(id) {
    return eventsDao.findById(id);
  }

  createEvent(eventData) {
    return eventsDao.create(eventData);
  }

  countEvents(filter) {
    return eventsDao.count(filter);
  }

  updateEvent(id, eventData) {
    return eventsDao.updateById(id, eventData);
  }
}

export default new EventsRepository();
