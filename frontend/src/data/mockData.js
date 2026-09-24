// MedVault AI - Comprehensive Mock Data for Doctor Portal & Patient Dashboard

export const DUMMY_EMERGENCY_ACCESSES = [
  {
    id: 1,
    patientName: 'Priya Sharma',
    medvaultId: 'MV-29183746',
    reason: 'Patient unconscious',
    dateTime: '15 Sept 2026 09:14 AM',
    duration: '47 mins',
    status: 'Completed',
  },
  {
    id: 2,
    patientName: 'Arjun Reddy',
    medvaultId: 'MV-48291037',
    reason: 'Emergency resuscitation',
    dateTime: '12 Sept 2026 02:33 PM',
    duration: '1 hr 12 mins',
    status: 'Completed',
  },
  {
    id: 3,
    patientName: 'Lakshmi Devi',
    medvaultId: 'MV-10293847',
    reason: 'Critical allergy check',
    dateTime: '08 Sept 2026 11:50 AM',
    duration: '23 mins',
    status: 'Completed',
  },
];

export const MOCK_DUMMY_PATIENT = {
  id: 'patient-demo-1',
  fullName: 'Mathew Miller',
  medvaultId: 'MV-36365758',
  dob: '14 May 1994',
  gender: 'Male',
  bloodGroup: 'O+',
  allergies: 'Peanuts, Penicillin',
  medicalConditions: 'Asthma, Type 2 Diabetes',
  medications: 'Metformin 500mg, Albuterol Inhaler',
  emergencyContactName: 'Ravi Miller',
  emergencyContactRelationship: 'Father',
  emergencyContactNumber: '+91 98765 43210',
  email: 'matthew.miller@example.com',
  mobile: '+91 98765 43210',
};

export const MOCK_TRANSLATIONS = {
  English: null,
  Telugu: `## 1. సాధారణ ఆరోగ్య నివేదిక\nపేషెంట్ నివేదికలు స్థిరంగా ఉన్నవి. రక్తంలో గ్లూకోజ్ నివేదిక మితమైన శ్రద్ధ అవసరం.\n\n## 2. 🔴 శ్రద్ధ వహించాల్సినవి\n- బ్లడ్ షుగర్ లెవెల్స్ (145 mg/dL) సాధారణ పరిమితి కంటే కాస్త ఎక్కువ.`,
  Hindi: `## 1. सामान्य स्वास्थ्य अवलोकन\nमरीज की मेडिकल रिपोर्ट का विश्लेषण पूरा हो चुका है।\n\n## 2. 🔴 ध्यान देने योग्य बातें\n- ब्लड शुगर (145 mg/dL) थोड़ा बढ़ा हुआ है।`,
  Tamil: `## 1. பொது சுகாதார சுருக்கம்\nநோயாளியின் மருத்துவ அறிக்கைகள் ஆய்வு செய்யப்பட்டுள்ளன.`,
  Kannada: `## 1. ಸಾಮನ್ಯ ಆರೋಗ್ಯ ಸಾರಾಂಶ\nರೋಗಿಯ ವೈದ್ಯಕೀಯ ವರದಿಗಳ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.`,
  Malayalam: `## 1. ജനറൽ ഹെൽത്ത് സംഗ്രഹം\nരോഗിയുടെ മെഡിക്കൽ റിപ്പോർട്ടുകൾ അവലോകനം ചെയ്തു.`,
  Bengali: `## 1. সামগ্রিক স্বাস্থ্য সারাংশ\nরোগীর মেডিকেল রিপোর্ট বিশ্লেষণ করা হয়েছে।`,
  Marathi: `## 1. एकूण आरोग्य सारांश\nरुग्णाच्या वैद्यकीय अहवालाचे विश्लेषण पूर्ण झाले आहे.`,
};

// Trust Score dummy data (Part 2B)
export const DUMMY_DOCTOR_TRUST_SCORE = {
  score: 87,
  status: 'Good', // 'Excellent' | 'Good' | 'Fair' | 'Poor'
  totalRoutineAccesses: 47,
  approvedRoutineAccesses: 47,
  totalEmergencyAccesses: 3,
  verifiedEmergencyAccesses: 3,
  flaggedAccesses: 1,
  clearedFlags: 1,
  violations: 0,
  accessLevel: 'FULL',
  nextReview: '2026-10-01',
};

// Admin Review Queue Dummy Data (Part 2C)
export const DUMMY_FLAGGED_ACCESSES = [
  {
    id: 'flag-101',
    severity: 'CRITICAL', // 'CRITICAL' | 'FLAGGED' | 'REVIEW'
    riskScore: 95,
    doctorId: 'D001',
    doctorName: 'Dr. Ravi Kumar',
    specialization: 'Dentist',
    hospitalName: 'Apollo Hospitals, Hyderabad',
    patientId: 'patient-demo-1',
    patientName: 'Mathew Miller',
    patientMedvaultId: 'MV-36365758',
    dateTime: '17 Sept 2026, 02:15 AM',
    duration: '1 minute 20 seconds',
    durationSeconds: 80,
    flagReasons: [
      'Unusual access volume: 7 patients in 60 minutes',
      'Repeated access: 4 times in 24 hours',
      'Off-hours emergency access: 2:15 AM, duration only 80 seconds',
      'Specialization mismatch: Dentist accessed Cardiac & Neuro reports',
      'Session too short: 80 seconds (possible unauthorized probe)',
      'Access from new device & location: Mumbai vs Hyderabad',
    ],
    status: 'PENDING_REVIEW', // 'PENDING_REVIEW' | 'LEGITIMATE' | 'WARNING_ISSUED' | 'SUSPENDED'
    fileLogs: [
      { name: 'Cardiac_ECG_Report.pdf', duration: '35s', openedAt: '02:15:10 AM' },
      { name: 'Brain_MRI_Neuro.pdf', duration: '45s', openedAt: '02:15:45 AM' },
    ],
    deviceInfo: 'iPhone 13 (iOS 17.2) - New Device',
    location: 'Mumbai, MH (IP: 103.21.124.88)',
  },
  {
    id: 'flag-102',
    severity: 'FLAGGED',
    riskScore: 72,
    doctorId: 'D004',
    doctorName: 'Dr. Sameer Sen',
    specialization: 'Dermatologist',
    hospitalName: 'KIMS Hospital, Secunderabad',
    patientId: 'patient-demo-2',
    patientName: 'Priya Sharma',
    patientMedvaultId: 'MV-29183746',
    dateTime: '16 Sept 2026, 11:45 PM',
    duration: '2 minutes 10 seconds',
    durationSeconds: 130,
    flagReasons: [
      'Off-hours emergency access: 11:45 PM',
      'Specialization mismatch: Dermatologist accessed Oncology Report',
      'Unusual location: Bangalore vs Hyderabad',
    ],
    status: 'PENDING_REVIEW',
    fileLogs: [
      { name: 'Oncology_Biopsy_Summary.pdf', duration: '130s', openedAt: '11:45:12 PM' },
    ],
    deviceInfo: 'MacBook Pro - Chrome 124',
    location: 'Bangalore, KA',
  },
  {
    id: 'flag-103',
    severity: 'REVIEW',
    riskScore: 48,
    doctorId: 'D007',
    doctorName: 'Dr. Anita Desai',
    specialization: 'Ophthalmologist',
    hospitalName: 'Care Hospital, Vizag',
    patientId: 'patient-demo-3',
    patientName: 'Arjun Reddy',
    patientMedvaultId: 'MV-48291037',
    dateTime: '15 Sept 2026, 04:30 PM',
    duration: '85 seconds',
    durationSeconds: 85,
    flagReasons: [
      'Session too short: 85 seconds',
      'Repeated access: 4 times in 24 hours',
    ],
    status: 'PENDING_REVIEW',
    fileLogs: [
      { name: 'Retinal_Scan_Report.pdf', duration: '85s', openedAt: '04:30:05 PM' },
    ],
    deviceInfo: 'Windows PC - Firefox 122',
    location: 'Vizag, AP',
  },
];

// Patient Access History List (Part 1B)
export const DUMMY_PATIENT_ACCESS_HISTORY = [
  {
    id: 'acc-1',
    accessType: 'Routine', // 'Routine' | 'Emergency'
    doctorName: 'Dr. Ravi Kumar',
    specialty: 'Cardiologist',
    hospital: 'Apollo Hospitals, Hyderabad',
    date: '17 Sept 2026, 10:42 AM',
    duration: '22 minutes',
    purpose: 'Scheduled Consultation',
    recordsViewedCount: 2,
    totalRecords: 12,
    status: 'Expected', // 'Expected' | 'Reported'
  },
  {
    id: 'acc-2',
    accessType: 'Emergency',
    doctorName: 'Dr. Priya Sharma',
    specialty: 'Emergency Medicine',
    hospital: 'KIMS Hospital, Secunderabad',
    date: '15 Sept 2026, 02:14 AM',
    duration: '47 minutes',
    purpose: 'Patient unconscious',
    recordsViewedCount: 5,
    totalRecords: 12,
    status: 'Expected',
  },
  {
    id: 'acc-3',
    accessType: 'Routine',
    doctorName: 'Dr. Anil Reddy',
    specialty: 'Diabetologist',
    hospital: 'Care Hospital, Hyderabad',
    date: '12 Sept 2026, 11:30 AM',
    duration: '18 minutes',
    purpose: 'Follow-up Visit',
    recordsViewedCount: 1,
    totalRecords: 12,
    status: 'Expected',
  },
];

// Test Access Log for Anomaly Detection Engine (Part 2A)
export const ANOMALY_TEST_LOG = {
  doctorId: 'D001',
  doctorName: 'Dr. Ravi Kumar',
  specialization: 'Dentist',
  patientId: 'MV-36365758',
  accessType: 'emergency',
  reason: 'Patient unconscious',
  startTime: '2026-09-17T02:15:00',
  endTime: '2026-09-17T02:16:20',
  durationSeconds: 80,
  recordsAccessed: ['Cardiac Report', 'Neuro Report'],
  device: 'iPhone 13 - New Device',
  location: 'Mumbai',
  lastKnownCity: 'Hyderabad',
  accessesLast60Mins: 7,
  accessesToPatientLast24Hrs: 4,
};
