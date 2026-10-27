const toObject = (value) => (value?.toObject ? value.toObject() : value);

export const toCurrentUserDTO = (user) => {
  const userObject = toObject(user);

  return {
    id: (userObject?._id || userObject?.id).toString(),
    email: userObject.email,
    role: userObject.role
  };
};
