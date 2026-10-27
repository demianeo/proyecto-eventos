const toObject = (value) => (value?.toObject ? value.toObject() : value);

const toEventSummaryDTO = (event) => {
  const eventObject = toObject(event);

  if (!eventObject) return eventObject;

  if (eventObject.title !== undefined) {
    return {
      id: (eventObject._id || eventObject.id).toString(),
      title: eventObject.title,
      date: eventObject.date,
      location: eventObject.location
    };
  }

  return eventObject.toString();
};

const toTicketUserDTO = (user) => {
  const userObject = toObject(user);

  if (!userObject?.email) return undefined;

  return {
    id: (userObject._id || userObject.id).toString(),
    email: userObject.email
  };
};

export const toTicketDTO = (ticket) => {
  const ticketObject = toObject(ticket);
  const user = toTicketUserDTO(ticketObject.user);

  return {
    id: (ticketObject._id || ticketObject.id).toString(),
    event: toEventSummaryDTO(ticketObject.event),
    status: ticketObject.status,
    quantity: ticketObject.quantity,
    reservationCode: ticketObject.reservationCode,
    createdAt: ticketObject.createdAt,
    cancelledAt: ticketObject.cancelledAt,
    ...(user ? { user } : {})
  };
};
