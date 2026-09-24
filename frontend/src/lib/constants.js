export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const RELATIONSHIPS = [
  'Spouse',
  'Parent',
  'Child',
  'Sibling',
  'Friend',
  'Relative',
  'Guardian',
  'Other',
];

export const QUALIFICATIONS = [
  'MBBS',
  'MD',
  'MS',
  'DNB',
  'BDS',
  'MDS',
  'BHMS',
  'BAMS',
  'BUMS',
  'BNYS',
  'Other',
];

export const SPECIALIZATIONS = [
  'General Medicine',
  'General Surgery',
  'Pediatrics',
  'Gynecology & Obstetrics',
  'Orthopedics',
  'Cardiology',
  'Dermatology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
  'Neurology',
  'Oncology',
  'Radiology',
  'Anesthesiology',
  'Emergency Medicine',
  'Family Medicine',
  'Other',
];

export const STATE_MEDICAL_COUNCILS = [
  ...INDIAN_STATES.map((s) => `${s} Medical Council`),
  'National Medical Commission (NMC)',
  'Other',
];

export const MEDICAL_COUNCILS = STATE_MEDICAL_COUNCILS;
