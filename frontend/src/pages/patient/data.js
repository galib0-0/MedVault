export const patient = {
  name: 'Galib Hussain',
  firstName: 'Galib',
  dob: 'Oct 14, 1998',
  age: 27,
  gender: 'Male',
  bloodGroup: 'B+',
  email: 'galibhussain200630@gmail.com',
  medvaultId: 'MV-21054618',
  organDonor: true,
  phone: '+91 98765 43210',
  emergencyContact: { name: 'Farhana Hussain', relation: 'Mother', phone: '+91 91234 56789' },
  address: 'Hyderabad, Telangana, India',
};

export const quickStats = {
  totalRecords: 12,
  lastDoctor: 'Dr. Ravi Kumar',
  lastDoctorSpecialty: 'General Medicine',
  lastDoctorVisit: 'Aug 10, 2026',
  lastUpload: 'CBC Blood Test',
  lastUploadAgo: '2 days ago',
  aiReady: 2,
  aiProcessing: 1,
};

export const recordTypes = [
  'Lab Reports',
  'Prescriptions',
  'X-Rays / Scans',
  'Discharge Summaries',
  'Medical Bills',
  'Other Documents',
];

export const records = [
  {
    id: 1,
    name: 'CBC Blood Report',
    type: 'Lab Reports',
    doctor: 'Dr. Ravi Kumar',
    hospital: 'Apollo Hospitals, Hyderabad',
    date: 'Aug 10, 2026',
    aiStatus: 'ready',
    critical: true,
  },
  {
    id: 2,
    name: 'Dr. Ravi Prescription',
    type: 'Prescriptions',
    doctor: 'Dr. Ravi Kumar',
    hospital: 'Apollo Hospitals, Hyderabad',
    date: 'Aug 5, 2026',
    aiStatus: 'processing',
    critical: false,
  },
  {
    id: 3,
    name: 'Chest X-Ray',
    type: 'X-Rays / Scans',
    doctor: 'Dr. Meera Nair',
    hospital: 'Yashoda Hospitals',
    date: 'Jul 28, 2026',
    aiStatus: 'ready',
    critical: false,
  },
  {
    id: 4,
    name: 'Lipid Profile Report',
    type: 'Lab Reports',
    doctor: 'Dr. Ravi Kumar',
    hospital: 'Apollo Hospitals, Hyderabad',
    date: 'Jun 18, 2026',
    aiStatus: 'ready',
    critical: false,
  },
  {
    id: 5,
    name: 'Discharge Summary — Appendectomy',
    type: 'Discharge Summaries',
    doctor: 'Dr. S. Reddy',
    hospital: 'Medicare Hospitals',
    date: 'Mar 2, 2025',
    aiStatus: 'ready',
    critical: false,
  },
  {
    id: 6,
    name: 'Hospital Bill — Consultation',
    type: 'Medical Bills',
    doctor: 'Apollo Hospitals',
    hospital: 'Apollo Hospitals, Hyderabad',
    date: 'Aug 5, 2026',
    aiStatus: 'none',
    critical: false,
  },
];

export const aiSummary = {
  reportName: 'CBC Blood Report',
  language: 'English',
  generatedAt: 'Aug 10, 2026',
  summary:
    'Your blood report is generally normal. However, your hemoglobin level appears slightly lower than the recommended range for your age and gender.',
  finding: 'Low Hemoglobin Detected',
  findingType: 'warning',
  recommendation:
    'Consider consulting your doctor regarding possible iron deficiency. Adding iron-rich foods to your diet and a follow-up test in 4–6 weeks is suggested.',
  disclaimer:
    'AI-generated summary for easier understanding. Please consult a qualified healthcare professional for medical advice.',
};

export const emergency = {
  bloodGroup: 'B+',
  rhNegative: false,
  allergies: ['Penicillin'],
  medications: ['Metformin 500mg daily'],
  chronicConditions: ['None reported'],
  emergencyContact: { name: 'Farhana Hussain', relation: 'Mother', phone: '+91 91234 56789' },
};

export const dependents = [
  {
    id: 1,
    name: 'Ahmed Hussain',
    relation: 'Son',
    age: 5,
    bloodGroup: 'O+',
    records: 8,
    vaccinations: { completed: 7, pending: 1 },
  },
  {
    id: 2,
    name: 'Zara Hussain',
    relation: 'Daughter',
    age: 2,
    bloodGroup: 'A+',
    records: 5,
    vaccinations: { completed: 5, pending: 2 },
  },
];

export const notifications = [
  {
    id: 1,
    title: 'AI Summary Ready',
    body: 'Your CBC Report summary is now available.',
    time: '2 hours ago',
    unread: true,
    tone: 'success',
  },
  {
    id: 2,
    title: 'Record Accessed',
    body: 'Dr. Ravi Kumar accessed your medical profile.',
    time: 'Yesterday',
    unread: true,
    tone: 'info',
  },
  {
    id: 3,
    title: 'Prescription Uploaded',
    body: 'Your prescription from Dr. Ravi Kumar was added.',
    time: 'Aug 5, 2026',
    unread: false,
    tone: 'info',
  },
  {
    id: 4,
    title: 'Emergency Info Updated',
    body: 'Your emergency contact details were updated.',
    time: 'Aug 3, 2026',
    unread: false,
    tone: 'info',
  },
];

export const activity = [
  {
    id: 1,
    icon: 'upload',
    text: 'You uploaded CBC Blood Report',
    time: '2 days ago',
  },
  {
    id: 2,
    icon: 'sparkles',
    text: 'AI summary generated for CBC Report',
    time: '2 days ago',
  },
  {
    id: 3,
    icon: 'doctor',
    text: 'Dr. Ravi Kumar accessed your records',
    time: 'Yesterday',
  },
  {
    id: 4,
    icon: 'prescription',
    text: 'Prescription uploaded',
    time: 'Aug 8, 2026',
  },
  {
    id: 5,
    icon: 'edit',
    text: 'Emergency information updated',
    time: 'Aug 5, 2026',
  },
];

export const timeline = [
  {
    year: 2024,
    items: [
      { id: 1, title: 'General Health Checkup', type: 'Checkup' },
    ],
  },
  {
    year: 2025,
    items: [
      { id: 2, title: 'Blood Test', type: 'Lab Report' },
      { id: 3, title: 'Prescription Added', type: 'Prescription' },
    ],
  },
  {
    year: 2026,
    items: [
      { id: 4, title: 'CBC Report', type: 'Lab Report' },
      { id: 5, title: 'Doctor Consultation', type: 'Consultation' },
      { id: 6, title: 'X-Ray Uploaded', type: 'Imaging' },
      { id: 7, title: 'Chest X-Ray', type: 'Imaging' },
    ],
  },
];

export const vaccinations = {
  overall: 75,
  items: [
    { id: 1, name: 'Hepatitis B', status: 'completed' },
    { id: 2, name: 'Polio', status: 'completed' },
    { id: 3, name: 'COVID-19', status: 'completed' },
    { id: 4, name: 'Tetanus Booster', status: 'done' },
    { id: 5, name: 'Influenza Vaccine', status: 'due' },
    { id: 6, name: 'Typhoid', status: 'upcoming' },
  ],
};

export const reminders = [
  {
    id: 1,
    icon: 'prescription',
    text: 'Prescription expires in 3 days',
    tone: 'warn',
  },
  {
    id: 2,
    icon: 'calendar',
    text: 'Annual health checkup due next month',
    tone: 'info',
  },
  {
    id: 3,
    icon: 'syringe',
    text: 'Vaccination due in 10 days',
    tone: 'info',
  },
];

export const navItems = [
  { id: 'overview', label: 'Dashboard', icon: 'home' },
  { id: 'records', label: 'My Records', icon: 'file' },
  { id: 'summary', label: 'AI Summaries', icon: 'sparkles' },
  { id: 'timeline', label: 'Health Timeline', icon: 'activity' },
  { id: 'vaccinations', label: 'Vaccinations', icon: 'syringe' },
  { id: 'dependents', label: 'Dependents', icon: 'users' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];