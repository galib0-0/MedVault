import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'PATIENT', 'DOCTOR'],
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', null],
      default: null,
    },
    medvaultId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profile: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

userSchema.methods.toAuthJSON = function () {
  return {
    id: this._id,
    email: this.email,
    fullName: this.fullName,
    name: this.fullName,
    role: this.role,
    verificationStatus: this.verificationStatus,
    medvaultId: this.medvaultId,
    createdAt: this.createdAt,
    profile: this.profile || {},
  };
};

export default mongoose.model('User', userSchema);