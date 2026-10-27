const toObject = (value) => (value?.toObject ? value.toObject() : value);

export const toUserDTO = (user) => {
  const userObject = toObject(user);

  return {
    id: (userObject?._id || userObject?.id).toString(),
    first_name: userObject.first_name,
    last_name: userObject.last_name,
    email: userObject.email,
    role: userObject.role
  };
};
