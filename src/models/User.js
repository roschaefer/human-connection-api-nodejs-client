/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */
import mongoose, { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema(
  {
    deviceHash: { type: String, required: true, unique: true },
    pushTokens: [
      {
        token: String,
        os: String,
      },
    ],
    notificationSettings: {
      disableAll: { type: Boolean, default: false },
      disableUntil: { type: Date },
      procedures: [{ type: Schema.Types.ObjectId, ref: 'Procedure' }],
      tags: [],
    },
  },
  { timestamps: true },
);

UserSchema.methods = {
  createToken() {
    return jwt.sign(
      {
        _id: this._id,
      },
      process.env.AUTH_JWT_SECRET,
    );
  },
};

export default mongoose.model('User', UserSchema);
