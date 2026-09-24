import mongoose from 'mongoose';
import path from 'node:path';

const recordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    category: { type: String, default: 'Other Documents' },
    categoryId: { type: String, default: 'other' },
    storagePath: { type: String, required: true },
    aiStatus: {
      type: String,
      enum: ['processing', 'ready', 'failed'],
      default: 'processing',
    },
    aiSummary: { type: mongoose.Schema.Types.Mixed, default: null },
    critical: { type: Boolean, default: false },
  },
  {
    minimize: false,
    timestamps: true,
  }
);

recordSchema.methods.toJSON = function () {
  const date = this.createdAt
    ? new Date(this.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '—';
  
  const fileName = this.storagePath ? path.basename(this.storagePath) : '';
  const fileUrl = fileName ? `/uploads/${this.user}/${fileName}` : null;

  return {
    id: this._id,
    name: this.originalName,
    type: this.category,
    categoryId: this.categoryId,
    doctor: 'Added by user',
    hospital: 'MedVault Records',
    size: this.size,
    mimeType: this.mimeType,
    aiStatus: this.aiStatus,
    aiSummary: this.aiSummary || null,
    critical: this.critical,
    fileUrl,
    date,
    createdAt: this.createdAt,
  };
};

export default mongoose.model('Record', recordSchema);
