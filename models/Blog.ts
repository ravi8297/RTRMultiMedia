import mongoose, { Document, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  image?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
