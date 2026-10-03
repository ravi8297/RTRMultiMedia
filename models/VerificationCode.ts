import mongoose, { Document, Schema } from "mongoose";

/**
 * Verification codes used to activate/verify user accounts.
 *
 * The code itself is NEVER stored — only a bcrypt hash. When a code is
 * generated we hash it before persisting and return the plain text to the
 * caller so it can be delivered to the user (email/SMS). Verification is done
 * by re-hashing the candidate and comparing hashes.
 */
export type VerificationPurpose =
  | "activate-account"
  | "verify-email"
  | "reset-password";

export interface IVerificationCode extends Document {
  codeHash: string;
  user: mongoose.Types.ObjectId;
  purpose: VerificationPurpose;
  expiresAt: Date;
  attempts: number;
  used: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    codeHash: {
      type: String,
      required: [true, "Code hash is required"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose is required"],
      enum: Object.values(VerificationPurpose),
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry is required"],
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup for "the latest valid code for this user + purpose".
VerificationCodeSchema.index({ user: 1, purpose: 1, used: 1 });

// Auto-purge documents whose expiry has passed.
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.VerificationCode ||
  mongoose.model<IVerificationCode>("VerificationCode", VerificationCodeSchema);