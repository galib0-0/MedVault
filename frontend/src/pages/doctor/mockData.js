// Mock data for Doctor Portal features

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
  fullName: 'Priya Sharma',
  medvaultId: 'MV-29183746',
  dob: '14 May 1994',
  gender: 'Female',
  bloodGroup: 'O+',
  allergies: 'Peanuts, Penicillin',
  medicalConditions: 'Asthma, Type 2 Diabetes',
  medications: 'Metformin 500mg, Albuterol Inhaler',
  emergencyContactName: 'Ravi Miller',
  emergencyContactRelationship: 'Father',
  emergencyContactNumber: '+91 98765 43210',
};

export const MOCK_TRANSLATIONS = {
  English: null, // Uses real AI report
  Telugu: `## 1. సాధారణ ఆరోగ్య నివేదిక
పేషెంట్ నివేదికలు స్థిరంగా ఉన్నవి. రక్తంలో గ్లూకోజ్ మరియు లిపిడ్ ప్రొఫైల్స్ మితమైన శ్రద్ధ అవసరం.

## 2. 🔴 శ్రద్ధ వహించాల్సినవి
- బ్లడ్ షుగర్ లెవెల్స్ (145 mg/dL) సాధారణ పరిమితి కంటే కాస్త ఎక్కువ.
- పెన్సిలిన్ అలెర్జీ నమోదైంది.`,
  Hindi: `## 1. सामान्य स्वास्थ्य अवलोकन
मरीज की मेडिकल रिपोर्ट का विश्लेषण पूरा हो चुका है। मुख्य रक्त पैरामीटर स्थिर हैं।

## 2. 🔴 ध्यान देने योग्य बातें
- ब्लड शुगर (145 mg/dL) थोड़ा बढ़ा हुआ है।
- पेनिसिलिन एलर्जी दर्ज की गई है।`,
  Tamil: `## 1. பொது சுகாதார சுருக்கம்
நோயாளியின் மருத்துவ அறிக்கைகள் ஆய்வு செய்யப்பட்டுள்ளன. ரத்த சர்க்கரை அளவு சற்று அதிகமாக உள்ளது.

## 2. 🔴 கவனிக்க வேண்டியவை
- ரத்த சர்க்கரை (145 mg/dL) வரம்பிற்கு மேல் உள்ளது.`,
  Kannada: `## 1. ಸಾಮನ್ಯ ಆರೋಗ್ಯ ಸಾರಾಂಶ
ರೋಗಿಯ ವೈದ್ಯಕೀಯ ವರದಿಗಳ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ. ರಕ್ತದ ಸಕ್ಕರೆ ಪ್ರಮಾಣ ಸ್ವಲ್ಪ ಹೆಚ್ಚಾಗಿದೆ.`,
  Malayalam: `## 1. ജനറൽ ഹെൽത്ത് സംഗ്രഹം
രോഗിയുടെ മെഡിക്കൽ റിപ്പോർട്ടുകൾ അവലോകനം ചെയ്തു. ബ്ലഡ് ഷുഗർ അളവ് സാധാരണയേക്കാൾ കൂടുതലാണ്.`,
  Bengali: `## 1. সামগ্রিক স্বাস্থ্য সারাংশ
রোগীর মেডিকেল রিপোর্ট বিশ্লেষণ করা হয়েছে। রক্তে শর্করার মাত্রা কিছুটা বেশি।`,
  Marathi: `## 1. एकूण आरोग्य सारांश
रुग्णाच्या वैद्यकीय अहवालाचे विश्लेषण पूर्ण झाले आहे. रक्तातील साखरेची पातळी थोडी वाढली आहे.`,
};
