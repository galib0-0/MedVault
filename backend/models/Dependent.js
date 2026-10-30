import mongoose from 'mongoose';

const vaccinationItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    dueAge: { type: String, default: 'Milestone' },
    status: {
      type: String,
      enum: ['completed', 'due', 'upcoming'],
      default: 'upcoming',
    },
    administeredDate: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { _id: true }
);

const dependentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male',
    },
    relationship: {
      type: String,
      enum: ['Son', 'Daughter', 'Ward', 'Other'],
      default: 'Son',
    },
    bloodGroup: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    birthHospital: {
      type: String,
      default: '',
      trim: true,
    },
    birthWeight: {
      type: String,
      default: '',
      trim: true,
    },
    allergies: {
      type: [String],
      default: [],
    },
    pediatricNotes: {
      type: String,
      default: '',
      trim: true,
    },
    vaccinations: {
      type: [vaccinationItemSchema],
      default: [],
    },
    isIndependent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

// Calculate accurate age text and numerical years
dependentSchema.methods.getAgeInfo = function () {
  if (!this.dob) return { ageText: 'Unknown', ageYears: 0, isAdulthood: false };

  const birth = new Date(this.dob);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  let ageText = '';
  if (years >= 1) {
    ageText = `${years} ${years === 1 ? 'yr' : 'yrs'}`;
    if (months > 0 && years < 5) {
      ageText += ` ${months} mo`;
    }
  } else if (months >= 1) {
    ageText = `${months} ${months === 1 ? 'month' : 'months'}`;
  } else {
    const diffDays = Math.max(0, Math.floor((now - birth) / (1000 * 60 * 60 * 24)));
    ageText = `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  }

  const isAdulthood = years >= 18;

  return { ageText, ageYears: years, isAdulthood };
};

dependentSchema.methods.toJSON = function () {
  const { ageText, ageYears, isAdulthood } = this.getAgeInfo();

  const totalVaccines = this.vaccinations.length;
  const completedVaccines = this.vaccinations.filter((v) => v.status === 'completed').length;
  const pendingVaccines = this.vaccinations.filter((v) => v.status === 'due' || v.status === 'upcoming').length;

  return {
    id: this._id,
    _id: this._id,
    parentId: this.parent,
    name: this.fullName,
    fullName: this.fullName,
    dob: this.dob,
    gender: this.gender,
    relation: this.relationship,
    relationship: this.relationship,
    bloodGroup: this.bloodGroup,
    birthHospital: this.birthHospital,
    birthWeight: this.birthWeight,
    allergies: this.allergies,
    pediatricNotes: this.pediatricNotes,
    age: ageText,
    ageYears,
    isAdulthood,
    records: 0, // dynamic count populated in route
    vaccinations: {
      completed: completedVaccines,
      pending: pendingVaccines,
      total: totalVaccines,
      items: this.vaccinations,
    },
    isIndependent: this.isIndependent,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('Dependent', dependentSchema);
