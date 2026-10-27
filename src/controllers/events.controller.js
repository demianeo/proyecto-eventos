import eventsService from '../services/events.service.js';

export const getEvents = async (request, response, next) => {
  try {
    const result = await eventsService.getEvents(request.query);
    response.status(200).json({ status: 'success', ...result });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (request, response, next) => {
  try {
    const event = await eventsService.createEvent(request.body, request.user);

    response.status(201).json({
      status: 'success',
      payload: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (request, response, next) => {
  try {
    const event = await eventsService.updateEvent(request.params.id, request.body, request.user);

    response.status(200).json({
      status: 'success',
      payload: event
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (request, response, next) => {
  try {
    const event = await eventsService.getEventById(request.params.id);
    response.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (request, response, next) => {
  try {
    const event = await eventsService.updateEventStatus(request.params.id, request.body?.status, request.user);
    response.status(200).json({ status: 'success', payload: event });
  } catch (error) {
    next(error);
  }
};
