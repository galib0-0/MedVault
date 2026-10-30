import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: 'Medical Practitioner' },
    doctorHospital: { type: String, default: 'MedVault Healthcare Network' },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientMedvaultId: { type: String, required: true },
    patientName: { type: String, required: true },
    purpose: { type: String, required: true },
    notes: { type: String, default: '' },
    duration: { type: String, default: '30 minutes' },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'DENIED', 'CANCELLED', 'EXPIRED'],
      default: 'PENDING',
      index: true,
    },
    respondedAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
    },
  },
  {
    timestamps: true,
  }
);

accessRequestSchema.methods.toJSON = function () {
  return {
    id: this._id,
    doctor: this.doctor,
    doctorName: this.doctorName,
    doctorSpecialization: this.doctorSpecialization,
    doctorHospital: this.doctorHospital,
    patient: this.patient,
    patientMedvaultId: this.patientMedvaultId,
    patientName: this.patientName,
    purpose: this.purpose,
    notes: this.notes,
    duration: this.duration,
    status: this.status,
    createdAt: this.createdAt,
    respondedAt: this.respondedAt,
    expiresAt: this.expiresAt,
  };
};

export default mongoose.model('AccessRequest', accessRequestSchema);
