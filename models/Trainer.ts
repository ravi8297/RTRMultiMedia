import mongoose, { Document, Schema } from "mongoose";

export interface ITrainer extends Document {
  name: string;
  email: string;
  phone?: string;
  bio: string;
  expertise: string[];
  image?: string;
  yearsOfExperience: number;
  certifications?: string[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrainerSchema = new Schema<ITrainer>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      trim: true,
      maxlength: 1000,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: 0,
    },
    certifications: [
      {
        type: String,
        trim: true,
      },
    ],
    socialLinks: {
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      github: { type: String, trim: true },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Trainer || mongoose.model<ITrainer>("Trainer", TrainerSchema);