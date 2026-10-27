import mongoose from 'mongoose';

export const isValidObjectId = (value) => mongoose.isValidObjectId(value);
