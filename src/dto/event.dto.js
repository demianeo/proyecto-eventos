const toObject = (value) => (value?.toObject ? value.toObject() : value);

const toOrganizerDTO = (organizer) => {
  const organizerObject = toObject(organizer);

  if (!organizerObject) return organizerObject;

  if (organizerObject.email) {
    return {
      id: (organizerObject._id || organizerObject.id).toString(),
      first_name: organizerObject.first_name,
      last_name: organizerObject.last_name,
      email: organizerObject.email
    };
  }

  return organizerObject.toString();
};

export const toEventDTO = (event) => {
  const eventObject = toObject(event);

  return {
    id: (eventObject._id || eventObject.id).toString(),
    title: eventObject.title,
    description: eventObject.description,
    category: eventObject.category,
    date: eventObject.date,
    location: eventObject.location,
    capacity: eventObject.capacity,
    price: eventObject.price,
    organizer: toOrganizerDTO(eventObject.organizer),
    status: eventObject.status
  };
};
