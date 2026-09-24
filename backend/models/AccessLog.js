import mongoose from 'mongoose';

const accessLogSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: 'General Practitioner' },
    doctorHospital: { type: String, default: 'Medical Facility' },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patientMedvaultId: { type: String, default: '—' },
    patientName: { type: String, default: '—' },
    accessType: {
      type: String,
      enum: ['EMERGENCY', 'STANDARD_CONSULTATION', 'DIRECT_LOOKUP'],
      default: 'EMERGENCY',
    },
    reason: { type: String, required: true },
    customExplanation: { type: String, default: '' },
    recordsAccessed: [{ type: String }],
    ipAddress: { type: String, default: '127.0.0.1' },
    authorizationStatus: {
      type: String,
      enum: ['AUTHORIZED', 'DENIED'],
      default: 'AUTHORIZED',
    },
  },
  {
    timestamps: true,
  }
);

accessLogSchema.methods.toJSON = function () {
  const formattedDate = this.createdAt
    ? new Date(this.createdAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return {
    id: this._id,
    doctor: this.doctorName,
    doctorSpecialization: this.doctorSpecialization,
    doctorHospital: this.doctorHospital,
    patientName: this.patientName,
    patientMedvaultId: this.patientMedvaultId,
    accessType: this.accessType,
    reason: this.reason,
    customExplanation: this.customExplanation,
    recordsAccessed: this.recordsAccessed || [],
    ipAddress: this.ipAddress,
    authorizationStatus: this.authorizationStatus,
    date: formattedDate,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('AccessLog', accessLogSchema);
