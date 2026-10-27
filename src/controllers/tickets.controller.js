import ticketsService from '../services/tickets.service.js';

export const createTicket = async (request, response, next) => {
  try {
    const ticket = await ticketsService.createTicket(request.params.eid, request.body, request.user);
    response.status(201).json({ status: 'success', payload: ticket });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (request, response, next) => {
  try {
    const tickets = await ticketsService.getMyTickets(request.user);
    response.status(200).json({ status: 'success', payload: tickets });
  } catch (error) {
    next(error);
  }
};

export const getEventTickets = async (request, response, next) => {
  try {
    const tickets = await ticketsService.getEventTickets(request.params.eid, request.user);
    response.status(200).json({ status: 'success', payload: tickets });
  } catch (error) {
    next(error);
  }
};

export const cancelTicket = async (request, response, next) => {
  try {
    const ticket = await ticketsService.cancelTicket(request.params.tid, request.user);
    response.status(200).json({ status: 'success', payload: ticket });
  } catch (error) {
    next(error);
  }
};
