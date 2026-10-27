import eventsRepository from '../repositories/events.repository.js';
import { toEventDTO } from '../dto/event.dto.js';
import { isValidObjectId } from '../utils/object-id.js';

const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'finished'];
const SORT_FIELDS = ['date', 'price', 'createdAt', 'title'];
const UPDATABLE_FIELDS = ['title', 'description', 'category', 'date', 'location', 'capacity', 'price'];

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isBlank = (value) => typeof value !== 'string' || !value.trim();

const parseDate = (value, message = 'La fecha no es válida') => {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    throw createError(400, message);
  }

  return date;
};

const validateFutureDate = (value) => {
  const date = parseDate(value);

  if (date <= new Date()) {
    throw createError(400, 'La fecha del evento debe ser futura');
  }

  return date;
};

const validateNumber = (value, field, minimum) => {
  if (value === undefined || value === null || value === '' || !Number.isFinite(Number(value)) || Number(value) < minimum) {
    throw createError(400, field);
  }

  return Number(value);
};

const validateRequiredText = (value, field) => {
  if (isBlank(value)) {
    throw createError(400, field);
  }

  return value.trim();
};

const validateEventId = (id) => {
  if (!isValidObjectId(id)) {
    throw createError(404, 'Evento no encontrado');
  }
};

const ensureMutable = (event) => {
  if (event.status === 'cancelled') {
    throw createError(400, 'Los eventos cancelados no pueden modificarse');
  }
};

const ensureOwnerOrAdmin = (event, user) => {
  const isAdmin = user.role === 'admin';
  const isOwner = event.organizer.toString() === user.id.toString();

  if (!isAdmin && !isOwner) {
    throw createError(403, 'No autorizado');
  }
};

const getExistingEvent = async (id) => {
  validateEventId(id);
  const event = await eventsRepository.findEventById(id);

  if (!event) {
    throw createError(404, 'Evento no encontrado');
  }

  return event;
};

const sanitizeUpdate = (data = {}) => {
  const updateData = {};

  for (const field of UPDATABLE_FIELDS) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (updateData.title !== undefined) updateData.title = validateRequiredText(updateData.title, 'El título es obligatorio');
  if (updateData.description !== undefined) updateData.description = validateRequiredText(updateData.description, 'La descripción es obligatoria');
  if (updateData.category !== undefined) updateData.category = validateRequiredText(updateData.category, 'La categoría es obligatoria');
  if (updateData.location !== undefined) updateData.location = validateRequiredText(updateData.location, 'La ubicación es obligatoria');
  if (updateData.date !== undefined) updateData.date = validateFutureDate(updateData.date);
  if (updateData.capacity !== undefined) updateData.capacity = validateNumber(updateData.capacity, 'La capacidad debe ser mayor a 0', 1);
  if (updateData.price !== undefined) updateData.price = validateNumber(updateData.price, 'El precio debe ser mayor o igual a 0', 0);

  return updateData;
};

const parsePositiveInteger = (value, fallback, field, maximum) => {
  if (value === undefined) return fallback;
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || (maximum && parsed > maximum)) {
    throw createError(400, field);
  }

  return parsed;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class EventsService {
  async createEvent(data, user) {
    const eventData = {
      title: validateRequiredText(data?.title, 'El título es obligatorio'),
      description: validateRequiredText(data?.description, 'La descripción es obligatoria'),
      category: validateRequiredText(data?.category, 'La categoría es obligatoria'),
      date: validateFutureDate(data?.date),
      location: validateRequiredText(data?.location, 'La ubicación es obligatoria'),
      capacity: validateNumber(data?.capacity, 'La capacidad debe ser mayor a 0', 1),
      price: validateNumber(data?.price, 'El precio debe ser mayor o igual a 0', 0),
      organizer: user.id,
      status: 'draft'
    };

    return toEventDTO(await eventsRepository.createEvent(eventData));
  }

  async getEvents(query = {}) {
    const filter = {};

    if (query.status !== undefined) {
      if (!EVENT_STATUSES.includes(query.status)) {
        throw createError(400, 'El estado no es válido');
      }
      filter.status = query.status;
    }

    if (query.category !== undefined) {
      if (isBlank(query.category)) throw createError(400, 'La categoría no es válida');
      filter.category = query.category.trim();
    }

    if (query.location !== undefined) {
      if (isBlank(query.location)) throw createError(400, 'La ubicación no es válida');
      filter.location = { $regex: escapeRegex(query.location.trim()), $options: 'i' };
    }

    if (query.dateFrom !== undefined || query.dateTo !== undefined) {
      const dateFilter = {};
      const dateFrom = query.dateFrom !== undefined ? parseDate(query.dateFrom, 'dateFrom no es válida') : null;
      const dateTo = query.dateTo !== undefined ? parseDate(query.dateTo, 'dateTo no es válida') : null;

      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw createError(400, 'dateFrom no puede ser mayor que dateTo');
      }

      if (dateFrom) dateFilter.$gte = dateFrom;
      if (dateTo) dateFilter.$lte = dateTo;
      filter.date = dateFilter;
    }

    const page = parsePositiveInteger(query.page, 1, 'page debe ser un entero mayor o igual a 1');
    const limit = parsePositiveInteger(query.limit, 10, 'limit debe ser un entero entre 1 y 100', 100);
    const sort = query.sort || 'date';
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;

    if (!SORT_FIELDS.includes(sortField)) {
      throw createError(400, 'El campo de ordenamiento no es válido');
    }

    const [data, total] = await Promise.all([
      eventsRepository.findEvents(filter, {
        skip: (page - 1) * limit,
        limit,
        sort: sort.startsWith('-') ? { [sortField]: -1 } : { [sortField]: 1 }
      }),
      eventsRepository.countEvents(filter)
    ]);

    return {
      data: data.map(toEventDTO),
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit)
    };
  }

  async getEventById(id) {
    const event = await getExistingEvent(id);
    return toEventDTO(event);
  }

  async updateEvent(id, data, user) {
    const event = await getExistingEvent(id);
    ensureMutable(event);
    ensureOwnerOrAdmin(event, user);

    return toEventDTO(await eventsRepository.updateEvent(id, sanitizeUpdate(data)));
  }

  async updateEventStatus(id, newStatus, user) {
    if (!EVENT_STATUSES.includes(newStatus)) {
      throw createError(400, 'El estado no es válido');
    }

    const event = await getExistingEvent(id);
    ensureMutable(event);
    ensureOwnerOrAdmin(event, user);

    if (event.status === 'finished' && newStatus === 'published') {
      throw createError(400, 'Los eventos finalizados no pueden publicarse');
    }

    if (newStatus === 'published' && event.date <= new Date()) {
      throw createError(400, 'No se puede publicar un evento cuya fecha ya ocurrió');
    }

    return toEventDTO(await eventsRepository.updateEvent(id, { status: newStatus }));
  }
}

export default new EventsService();
