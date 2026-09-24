import mongoose from 'mongoose';

const doctorNoteSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorName: { type: String, required: true },
    doctorSpecialization: { type: String, default: 'Medical Practitioner' },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    note: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['General', 'Diagnosis', 'Prescription Note', 'Follow-up', 'Emergency'],
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

doctorNoteSchema.methods.toJSON = function () {
  const formattedDate = this.createdAt
    ? new Date(this.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  return {
    id: this._id,
    doctorName: this.doctorName,
    doctorSpecialization: this.doctorSpecialization,
    note: this.note,
    category: this.category,
    date: formattedDate,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('DoctorNote', doctorNoteSchema);
