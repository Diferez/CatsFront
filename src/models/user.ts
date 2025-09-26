import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export interface User {
  readonly email: string;
  readonly password: string;
  readonly name: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface UserDocument extends User, Document {
  readonly _id: Types.ObjectId;
  toJSON(): Omit<User, 'password'>;
}

const UserSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc: UserDocument, ret: Record<string, unknown>) => {
        delete (ret as { password?: unknown }).password;
        return ret;
      }
    }
  }
);

export const UserModel =
  (mongoose.models.User as Model<UserDocument>) ?? mongoose.model<UserDocument>('User', UserSchema);
