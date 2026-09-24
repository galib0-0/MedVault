import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import PillButton from '../../components/PillButton';
import VerificationBadge from '../../components/VerificationBadge';
import MarkdownBody from '../patient/components/MarkdownBody';
import {
  SearchIcon,
  ShieldIcon,
  LogoutIcon,
  UserIcon,
  FileTextIcon,
  AlertIcon,
  CheckCircleIcon,
  InfoIcon,
  PillIcon,
  HeartPulseIcon,
  PlusIcon,
  EyeIcon,
  CalendarIcon,
  ClockIcon,
  BuildingIcon,
  GraduationCapIcon,
  BellIcon,
} from '../../components/icons';
import { getSession, signOut } from '../../lib/auth';
import {
  searchPatients,
  requestEmergencyAccess,
  getPatientRecords,
  addDoctorNote,
  getDoctorNotes,
} from '../../lib/doctor';
import EmergencyAccessModal from './components/EmergencyAccessModal';
import RequestAccessModal from '../../components/doctor/RequestAccessModal';
import DedicatedEmergencyAccess from './components/DedicatedEmergencyAccess';
import TrustScore from '../../components/doctor/TrustScore';
import AdminReviewQueue from '../AdminReviewQueue';
import { useAccess } from '../../context/AccessContext';
import { MOCK_DUMMY_PATIENT, MOCK_TRANSLATIONS } from './mockData';
import styles from './doctor.module.css';

// Document Category Filters
const CATEGORY_FILTERS = [
  'All',
  'Lab Reports',
  'Prescriptions',
  'X-Rays',
  'Discharge',
  'Bills',
];

// Language Options for AI Summary
const SUMMARY_LANGUAGES = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Bengali',
  'Marathi',
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const session = getSession() || {};
  const isVerified = session.verificationStatus === 'VERIFIED' || session.role === 'ADMIN';

  const {
    sessionType,
    setSessionType,
    activePatientSession,
    setActivePatientSession,
    endSession,
    setPatientAccessHistory,
  } = useAccess();

  // Navigation Tabs: 'lookup' | 'emergency-page' | 'active' | 'history' | 'profile' | 'notifications' | 'admin-queue'
  const [activeTab, setActiveTab] = useState('lookup');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Active Patient Data
  const [emergencyCard, setEmergencyCard] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [accessLogs, setAccessLogs] = useState([]);
  const [accessGrantedTime, setAccessGrantedTime] = useState('');

  // Emergency Session Countdown Timer (7200s down)
  const [emergencySecondsLeft, setEmergencySecondsLeft] = useState(7200);
  const [isSessionExpiredModalOpen, setIsSessionExpiredModalOpen] = useState(false);

  // Routine Session Count-Up Timer (0s up)
  const [routineSecondsUp, setRoutineSecondsUp] = useState(0);

  // Category filter & Language translation states
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);

  // Doctor Notes state
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [noteCategory, setNoteCategory] = useState('General');
  const [savingNote, setSavingNote] = useState(false);

  // Modals
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [pendingTargetPatient, setPendingTargetPatient] = useState(null);

  // Emergency Session Countdown Effect
  useEffect(() => {
    if (!activePatientSession || sessionType !== 'emergency') return;

    const interval = setInterval(() => {
      setEmergencySecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsSessionExpiredModalOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePatientSession, sessionType]);

  // Routine Session Count-Up Effect
  useEffect(() => {
    if (!activePatientSession || sessionType !== 'routine') return;

    const interval = setInterval(() => {
      setRoutineSecondsUp((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activePatientSession, sessionType]);

  // Format Timer HH:MM:SS
  const formatTimer = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Search handler
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError('');
    try {
      const data = await searchPatients(searchQuery.trim());
      setSearchResults(data.patients || []);
      if ((data.patients || []).length === 0) {
        setSearchError('No matching patient found with that MedVault ID, name, or email.');
      }
    } catch (err) {
      setSearchError(err.message || 'Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Trigger Emergency Access Modal
  const triggerEmergencyAccess = (patient) => {
    setPendingTargetPatient(patient);
    setShowEmergencyModal(true);
  };

  // Trigger Routine Request Access Modal
  const triggerRoutineRequest = (patient) => {
    setPendingTargetPatient(patient);
    setShowRequestModal(true);
  };

  // Grant Emergency Access Callback
  const handleGrantEmergencyAccess = async ({ patientId, medvaultId, reason, customExplanation }) => {
    const data = await requestEmergencyAccess({ patientId, medvaultId, reason, customExplanation });

    const currentFormattedTime = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setActivePatientSession(pendingTargetPatient);
    setSessionType('emergency');
    setEmergencyCard(data.emergencyCard);
    setAccessGrantedTime(currentFormattedTime);
    setEmergencySecondsLeft(7200);

    const recordsToSet = (data.records || []).length > 0 ? data.records : [
      {
        id: 'rec-1',
        name: 'Blood_Routine_Lab_Report.pdf',
        type: 'Lab Reports',
        categoryId: 'lab',
        date: '15 Sept 2026',
        aiStatus: 'ready',
        aiSummary: {
          report: `## 1. OVERALL HEALTH SUMMARY\nBlood report shows hemoglobin at 13.5 g/dL (normal) and blood glucose fasting at 145 mg/dL (slightly elevated).\n\n## 2. 🔴 REQUIRES ACTION — IMPORTANT FINDINGS\n### Elevated Fasting Glucose\n- **Value**: 145 mg/dL (Reference: 70-99 mg/dL)\n- **Meaning**: Borderline hyperglycemia requiring dietary control.`,
        },
        fileUrl: '/uploads/demo/Blood_Routine_Lab_Report.pdf',
      },
      {
        id: 'rec-2',
        name: 'Chest_XRay_Diagnostic_Report.pdf',
        type: 'Lab Reports',
        categoryId: 'lab',
        date: '10 Sept 2026',
        aiStatus: 'ready',
        aiSummary: {
          report: `## 1. OVERALL HEALTH SUMMARY\nChest X-Ray reveals clear lung fields with normal cardiac contour.`,
        },
        fileUrl: '/uploads/demo/Chest_XRay_Diagnostic_Report.pdf',
      },
    ];

    setPatientRecords(recordsToSet);
    if (recordsToSet.length > 0) {
      setSelectedRecord(recordsToSet[0]);
    }

    setActiveTab('active');

    setAccessLogs((prev) => [
      {
        id: data.emergencyCard?.auditLogId || Date.now(),
        patientName: pendingTargetPatient.fullName,
        medvaultId: pendingTargetPatient.medvaultId,
        reason,
        date: currentFormattedTime,
        status: 'AUTHORIZED',
      },
      ...prev,
    ]);

    loadNotes(pendingTargetPatient.id);
  };

  // Routine Access Granted Callback (After Patient OTP Approval)
  const handleRoutineAccessGranted = ({ patient, purpose, duration }) => {
    const currentFormattedTime = new Date().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setActivePatientSession(patient);
    setSessionType('routine');
    setAccessGrantedTime(currentFormattedTime);
    setRoutineSecondsUp(0);

    const defaultRecords = [
      {
        id: 'rec-1',
        name: 'Blood_Routine_Lab_Report.pdf',
        type: 'Lab Reports',
        categoryId: 'lab',
        date: '15 Sept 2026',
        aiStatus: 'ready',
        aiSummary: {
          report: `## 1. OVERALL HEALTH SUMMARY\nBlood report shows hemoglobin at 13.5 g/dL (normal) and blood glucose fasting at 145 mg/dL.`,
        },
        fileUrl: '/uploads/demo/Blood_Routine_Lab_Report.pdf',
      },
      {
        id: 'rec-2',
        name: 'Prescription_Cardiology.pdf',
        type: 'Prescriptions',
        categoryId: 'prescription',
        date: '12 Sept 2026',
        aiStatus: 'ready',
        aiSummary: {
          report: `## 1. OVERALL HEALTH SUMMARY\nPrescription details Metformin 500mg daily.`,
        },
        fileUrl: '/uploads/demo/Prescription_Cardiology.pdf',
      },
    ];

    setPatientRecords(defaultRecords);
    setSelectedRecord(defaultRecords[0]);
    setActiveTab('active');

    loadNotes(patient.id);
  };

  // Dedicated Emergency Access Handler
  const handleDedicatedAccess = async ({ patient, reason, customExplanation }) => {
    setPendingTargetPatient(patient);
    await handleGrantEmergencyAccess({
      patientId: patient.id,
      medvaultId: patient.medvaultId,
      reason,
      customExplanation,
    });
  };

  // Load clinical notes
  const loadNotes = async (patientId) => {
    try {
      const res = await getDoctorNotes(patientId);
      setDoctorNotes(res.notes || []);
    } catch {
      setDoctorNotes([]);
    }
  };

  // Add clinical note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || !activePatientSession) return;

    setSavingNote(true);
    try {
      const res = await addDoctorNote(activePatientSession.id, { note: newNote, category: noteCategory });
      setDoctorNotes((prev) => [res.note, ...prev]);
      setNewNote('');
    } catch (err) {
      setDoctorNotes((prev) => [
        {
          id: Date.now(),
          doctorName: session.name || 'Dr. Medical Practitioner',
          category: noteCategory,
          note: newNote,
          date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
      setNewNote('');
    } finally {
      setSavingNote(false);
    }
  };

  // End Session Early (Emergency or Routine)
  const handleEndSessionEarly = () => {
    const isEmergency = sessionType === 'emergency';
    const msg = isEmergency
      ? 'End emergency session? Patient will be notified.'
      : 'End routine access session?';

    if (window.confirm(msg)) {
      endSession(activePatientSession, sessionType);
      setActiveTab('lookup');
    }
  };

  // Language Change Handler
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    if (newLang === 'English') return;

    setIsTranslating(true);
    setTimeout(() => {
      setIsTranslating(false);
    }, 1000);
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const parsePills = (text) => {
    if (!text || text.toLowerCase().includes('none') || text === '—') return [];
    return text.split(/[,;]+/).map((item) => item.trim()).filter(Boolean);
  };

  const filteredRecords = patientRecords.filter((rec) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Lab Reports') return rec.type === 'Lab Reports' || rec.categoryId === 'lab';
    if (activeCategory === 'Prescriptions') return rec.type === 'Prescriptions' || rec.categoryId === 'prescription';
    if (activeCategory === 'X-Rays') return rec.type === 'X-Rays / Scans' || rec.categoryId === 'xray';
    if (activeCategory === 'Discharge') return rec.type === 'Discharge Summaries' || rec.categoryId === 'discharge';
    if (activeCategory === 'Bills') return rec.type === 'Medical Bills' || rec.categoryId === 'bill';
    return true;
  });

  const getCategoryCount = (cat) => {
    if (cat === 'All') return patientRecords.length;
    if (cat === 'Lab Reports') return patientRecords.filter((r) => r.type === 'Lab Reports' || r.categoryId === 'lab').length;
    if (cat === 'Prescriptions') return patientRecords.filter((r) => r.type === 'Prescriptions' || r.categoryId === 'prescription').length;
    if (cat === 'X-Rays') return patientRecords.filter((r) => r.type === 'X-Rays / Scans' || r.categoryId === 'xray').length;
    if (cat === 'Discharge') return patientRecords.filter((r) => r.type === 'Discharge Summaries' || r.categoryId === 'discharge').length;
    if (cat === 'Bills') return patientRecords.filter((r) => r.type === 'Medical Bills' || r.categoryId === 'bill').length;
    return 0;
  };

  // If Admin Queue tab selected
  if (activeTab === 'admin-queue') {
    return <AdminReviewQueue />;
  }

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <Logo withText className={styles.logo} />
          <span className={styles.portalTag}>Doctor Portal</span>
        </div>

        <div className={styles.topRight}>
          <VerificationBadge status={session.verificationStatus || 'PENDING'} />
          <div className={styles.doctorInfo}>
            <span className={styles.doctorName}>{session.name || 'Dr. Medical Practitioner'}</span>
            <span className={styles.hospitalSub}>
              {session.hospitalName || 'MedVault Health System'} {session.specialization ? `· ${session.specialization}` : ''}
            </span>
          </div>
          <button className={styles.signOutBtn} onClick={handleSignOut} title="Sign Out">
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className={styles.mainLayout}>
        {/* EDIT 3: Left Navigation Sidebar */}
        <aside className={styles.navSidebar}>
          <nav className={styles.navList}>
            {/* 1. Patient Lookup */}
            <button
              className={`${styles.navItem} ${activeTab === 'lookup' ? styles.navActive : ''}`}
              onClick={() => setActiveTab('lookup')}
            >
              <SearchIcon />
              <span>Patient Lookup</span>
            </button>

            {/* 2. Emergency Access (SECOND ITEM, highlighted red) */}
            <button
              className={`${styles.navItem} ${activeTab === 'emergency-page' ? styles.navActiveRed : ''}`}
              onClick={() => setActiveTab('emergency-page')}
            >
              <ShieldIcon />
              <span>Emergency Access</span>
            </button>

            {/* 3. Active Patient File */}
            <button
              className={`${styles.navItem} ${activeTab === 'active' ? styles.navActive : ''}`}
              onClick={() => setActiveTab('active')}
              disabled={!activePatientSession}
            >
              <UserIcon />
              <span>Active Patient File</span>
              {activePatientSession && <span className={styles.activeDot} />}
            </button>

            {/* 4. Audit Access History */}
            <button
              className={`${styles.navItem} ${activeTab === 'history' ? styles.navActive : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <ShieldIcon />
              <span>Audit Access History</span>
            </button>

            {/* 5. My Credentials (RENAMED from Doctor Verification) */}
            <button
              className={`${styles.navItem} ${activeTab === 'profile' ? styles.navActive : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <GraduationCapIcon />
              <span>My Credentials</span>
            </button>

            {/* Admin Flagged Review Queue (If Admin Role) */}
            {session.role === 'ADMIN' && (
              <button
                className={`${styles.navItem} ${activeTab === 'admin-queue' ? styles.navActiveRed : ''}`}
                onClick={() => setActiveTab('admin-queue')}
              >
                <AlertIcon />
                <span>Admin Review Queue</span>
              </button>
            )}

            {/* 6. Notifications (LAST ITEM, bell icon, badge count 3) */}
            <button
              className={`${styles.navItem} ${activeTab === 'notifications' ? styles.navActive : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <BellIcon />
              <span>Notifications</span>
              <span className={styles.notifBadge}>3</span>
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className={styles.contentArea}>
          {/* EDIT 2 SECTION A: Emergency Red Session Banner vs Routine Blue Session Banner */}
          {activePatientSession && sessionType === 'emergency' && (
            <div className={styles.emergencySessionBanner}>
              <div className={styles.sessionBannerLeft}>
                🔴 Emergency Session Active
              </div>

              <div className={styles.sessionBannerCenter}>
                {emergencySecondsLeft < 300 ? (
                  <span className={styles.timerBlink}>
                    <AlertIcon /> Time Remaining: {formatTimer(emergencySecondsLeft)}
                  </span>
                ) : emergencySecondsLeft < 600 ? (
                  <span className={styles.timerWarning}>
                    ⚠️ Time Remaining: {formatTimer(emergencySecondsLeft)}
                  </span>
                ) : (
                  <span className={styles.timerNormal}>
                    Time Remaining: {formatTimer(emergencySecondsLeft)}
                  </span>
                )}
              </div>

              <button className={styles.endSessionBtn} onClick={handleEndSessionEarly}>
                End Session Early
              </button>
            </div>
          )}

          {/* PART 1A: Routine Access BLUE Session Banner */}
          {activePatientSession && sessionType === 'routine' && (
            <div className={styles.emergencySessionBanner} style={{ background: '#1d4ed8' }}>
              <div className={styles.sessionBannerLeft}>
                📋 Routine Access — Patient Approved
              </div>

              <div className={styles.sessionBannerCenter}>
                <span className={styles.timerNormal}>
                  Session: {formatTimer(routineSecondsUp)}
                </span>
              </div>

              <button className={styles.endSessionBtn} onClick={handleEndSessionEarly}>
                End Session
              </button>
            </div>
          )}

          {/* Verification Warning Banner if Pending */}
          {!isVerified && (
            <div className={styles.verificationBanner}>
              <AlertIcon />
              <div>
                <strong>Verification Pending</strong>
                <p>
                  Your medical registration credentials are currently under administrative verification. Patient record access features require a <strong>VERIFIED</strong> account status per medical compliance rules.
                </p>
              </div>
            </div>
          )}

          {/* TAB 1: PATIENT LOOKUP */}
          {activeTab === 'lookup' && (
            <section className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <SearchIcon className={styles.headerIcon} />
                  <div>
                    <h2>Patient Search & Record Authorization</h2>
                    <p className={styles.subtitle}>
                      Search patient by <strong>MedVault ID</strong> (e.g. MV-10293847), full name, or registered email.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSearch} className={styles.searchBarRow}>
                <div className={styles.searchInputWrap}>
                  <SearchIcon className={styles.searchIconInside} />
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Enter MedVault ID (e.g. MV-84920193), Patient Name, or Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <PillButton type="submit" variant="primary" disabled={searching}>
                  {searching ? 'Searching...' : 'Search Patient'}
                </PillButton>
              </form>

              {searchError && <div className={styles.errorBanner}>{searchError}</div>}

              {/* Search Results List with TWO Side-by-Side Action Buttons */}
              {searchResults.length > 0 && (
                <div className={styles.resultsWrapper}>
                  <h3>Found {searchResults.length} Patient(s)</h3>
                  <div className={styles.resultsGrid}>
                    {searchResults.map((p) => (
                      <div key={p.id} className={styles.patientCard}>
                        <div className={styles.patientAvatar}>
                          {p.fullName ? p.fullName.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div className={styles.patientMeta}>
                          <h4>{p.fullName}</h4>
                          <span className={styles.mvIdBadge}>{p.medvaultId}</span>
                          <p className={styles.patientSubInfo}>
                            DOB: {p.dob} · Gender: {p.gender} · Blood: <strong>{p.bloodGroup}</strong>
                          </p>
                        </div>

                        {/* PART 1A: TWO BUTTONS (Request Access + Emergency Access) */}
                        <div className={styles.patientActions} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => triggerRoutineRequest(p)}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            📋 Request Access
                          </button>

                          <button
                            type="button"
                            onClick={() => triggerEmergencyAccess(p)}
                            style={{
                              background: 'transparent',
                              color: '#dc2626',
                              border: '1px solid #dc2626',
                              padding: '8px 14px',
                              borderRadius: '10px',
                              fontWeight: '700',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            🚨 Emergency Access
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* EDIT 4: DEDICATED EMERGENCY ACCESS PAGE */}
          {activeTab === 'emergency-page' && (
            <DedicatedEmergencyAccess onAuthorizeAccess={handleDedicatedAccess} />
          )}

          {/* EDIT 2: ACTIVE PATIENT FILE PAGE */}
          {activeTab === 'active' && activePatientSession && (
            <div className={styles.activePatientGrid}>
              {/* EDIT 2 SECTION B: Left Panel (Patient Info) */}
              <div className={styles.emergencyColumn}>
                <div className={styles.emergencySummaryCard}>
                  {/* Read Only Badge ONLY for Emergency Access */}
                  {sessionType === 'emergency' && (
                    <span
                      className={styles.readOnlyBadge}
                      title="Emergency access is read-only. You cannot modify patient records."
                    >
                      👁️ Read Only
                    </span>
                  )}

                  <div className={styles.emergencyBadgeHeader}>
                    <ShieldIcon /> {sessionType === 'emergency' ? 'Emergency Medical Summary' : 'Patient Medical Summary'}
                  </div>

                  {/* Access granted timestamp */}
                  <div className={styles.accessGrantedTime}>
                    Access granted: {accessGrantedTime || '17 Sept 2026, 10:42 AM'}
                  </div>

                  {/* 56px Circle Blue Avatar with patient initial */}
                  <div className={styles.leftPanelAvatar}>
                    {activePatientSession.fullName ? activePatientSession.fullName.charAt(0).toUpperCase() : 'P'}
                  </div>

                  <h3>{activePatientSession.fullName}</h3>
                  <div className={styles.idChip}>{activePatientSession.medvaultId}</div>

                  <div className={styles.vitalsGroup}>
                    <div className={styles.vitalTile}>
                      <span className={styles.vitalLabel}>Blood Group</span>
                      <strong className={styles.vitalValue}>{emergencyCard?.bloodGroup || activePatientSession.bloodGroup || 'A+'}</strong>
                    </div>
                    <div className={styles.vitalTile}>
                      <span className={styles.vitalLabel}>DOB</span>
                      <span className={styles.vitalValueText}>{emergencyCard?.dob || activePatientSession.dob}</span>
                    </div>
                  </div>

                  {/* Allergies, Chronic Conditions, Medications with Pill Badges */}
                  <div className={styles.criticalListSection}>
                    {/* Known Allergies */}
                    <div className={styles.criticalSectionTitle}>
                      ⚠️ Known Allergies
                    </div>
                    {parsePills(emergencyCard?.allergies || activePatientSession.allergies).length > 0 ? (
                      <div className={styles.pillContainer}>
                        {parsePills(emergencyCard?.allergies || activePatientSession.allergies).map((alg) => (
                          <span key={alg} className={styles.allergyPill}>{alg}</span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noneTextGreen}>✅ No known allergies on record</div>
                    )}

                    {/* Chronic Conditions */}
                    <div className={styles.criticalSectionTitle}>
                      <HeartPulseIcon className={styles.criticalIcon} /> Chronic Conditions
                    </div>
                    {parsePills(emergencyCard?.medicalConditions || activePatientSession.medicalConditions).length > 0 ? (
                      <div className={styles.pillContainer}>
                        {parsePills(emergencyCard?.medicalConditions || activePatientSession.medicalConditions).map((c) => (
                          <span key={c} className={styles.conditionPill}>{c}</span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noneTextGreen}>✅ No chronic conditions on record</div>
                    )}

                    {/* Current Medications */}
                    <div className={styles.criticalSectionTitle}>
                      <PillIcon className={styles.criticalIcon} /> Current Medications
                    </div>
                    {parsePills(emergencyCard?.medications || activePatientSession.medications).length > 0 ? (
                      <div className={styles.pillContainer}>
                        {parsePills(emergencyCard?.medications || activePatientSession.medications).map((m) => (
                          <span key={m} className={styles.medicationPill}>{m}</span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noneTextGreen}>✅ No current medications on record</div>
                    )}
                  </div>

                  {/* Emergency Contact Block at bottom of left panel */}
                  <div className={styles.emergencyContactBlock}>
                    <div className={styles.contactLabel}>📞 Emergency Contact</div>
                    {emergencyCard?.emergencyContact?.name || activePatientSession.emergencyContactName ? (
                      <div>
                        <div className={styles.contactDetail}>
                          <strong>
                            {emergencyCard?.emergencyContact?.name || activePatientSession.emergencyContactName} ({emergencyCard?.emergencyContact?.relationship || activePatientSession.emergencyContactRelationship || 'Father'})
                          </strong>
                          {' — '}
                          <a href={`tel:${emergencyCard?.emergencyContact?.number || activePatientSession.emergencyContactNumber}`}>
                            {emergencyCard?.emergencyContact?.number || activePatientSession.emergencyContactNumber || '+91 98765 43210'}
                          </a>
                        </div>
                        <span className={styles.contactSubtext}>Contact in case patient is unreachable</span>
                      </div>
                    ) : (
                      <div className={styles.noContactText}>No emergency contact on file</div>
                    )}
                  </div>
                </div>

                {/* Doctor Clinical Notes Panel */}
                <div className={styles.notesCard}>
                  <h3><FileTextIcon /> Doctor Clinical Notes</h3>
                  <form onSubmit={handleAddNote} className={styles.noteForm}>
                    <textarea
                      className={styles.noteTextarea}
                      rows="3"
                      placeholder="Add clinical observations, diagnosis notes, or instructions..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      required
                    />
                    <div className={styles.noteFormFooter}>
                      <select
                        className={styles.selectCategory}
                        value={noteCategory}
                        onChange={(e) => setNoteCategory(e.target.value)}
                      >
                        <option value="General">General</option>
                        <option value="Diagnosis">Diagnosis</option>
                        <option value="Prescription Note">Prescription Note</option>
                        <option value="Follow-up">Follow-up</option>
                        <option value="Emergency">Emergency</option>
                      </select>
                      <PillButton type="submit" variant="primary" disabled={savingNote}>
                        <PlusIcon /> {savingNote ? 'Saving...' : 'Add Note'}
                      </PillButton>
                    </div>
                  </form>

                  <div className={styles.notesFeed}>
                    {doctorNotes.map((n) => (
                      <div key={n.id} className={styles.noteItem}>
                        <div className={styles.noteHeader}>
                          <strong>{n.doctorName}</strong>
                          <span className={styles.noteCategoryTag}>{n.category}</span>
                        </div>
                        <p>{n.note}</p>
                        <span className={styles.noteDate}>{n.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* EDIT 2 SECTION C: Right Panel (Documents Section) */}
              <div className={styles.recordsColumn}>
                <div className={styles.sectionCard}>
                  {/* Category Filter Tabs */}
                  <div className={styles.categoryFilterRow}>
                    {CATEGORY_FILTERS.map((cat) => (
                      <button
                        key={cat}
                        className={`${styles.catFilterBtn} ${activeCategory === cat ? styles.catFilterBtnActive : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat} ({getCategoryCount(cat)})
                      </button>
                    ))}
                  </div>

                  <div className={styles.recordsHeader}>
                    <h2>Uploaded Medical Records ({filteredRecords.length})</h2>
                  </div>

                  {/* Document Tab Cards with AI Status Indicator */}
                  <div className={styles.recordsListHorizontal}>
                    {filteredRecords.map((r) => (
                      <button
                        key={r.id}
                        className={`${styles.recordTab} ${selectedRecord?.id === r.id ? styles.recordTabActive : ''}`}
                        onClick={() => setSelectedRecord(r)}
                      >
                        <FileTextIcon />
                        <div>
                          <strong>{r.name}</strong>
                          <span>{r.type} · {r.date}</span>

                          {/* AI Status Indicator */}
                          <div>
                            {r.aiStatus === 'ready' || r.aiSummary ? (
                              <span className={styles.aiBadgeReady}>✅ AI Summary Ready</span>
                            ) : r.aiStatus === 'processing' ? (
                              <span className={styles.aiBadgeProcessing}>⏳ Processing...</span>
                            ) : (
                              <span className={styles.aiBadgeFailed}>❌ No AI Summary</span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedRecord ? (
                    <div className={styles.reportViewerCard}>
                      <div className={styles.reportViewerHeader}>
                        <div>
                          <h3>{selectedRecord.name}</h3>
                          <p className={styles.recordCategoryLabel}>{selectedRecord.type} · Uploaded on {selectedRecord.date}</p>
                        </div>

                        {selectedRecord.fileUrl && (
                          <a
                            href={selectedRecord.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewOriginalBtn}
                          >
                            <EyeIcon /> View Original Report
                          </a>
                        )}
                      </div>

                      {/* AI Generated Summary Info Bar & Language Selector */}
                      <div className={styles.aiInfoBar}>
                        <span className={styles.aiLabelLeft}>
                          🤖 AI Generated Summary
                        </span>
                        <select
                          className={styles.langSelectDropdown}
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                        >
                          {SUMMARY_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      <span className={styles.aiDisclaimerItalic}>
                        AI-generated summary for informational purposes only. Not a substitute for professional medical consultation.
                      </span>

                      {/* AI Report Body or Translation Loader */}
                      <div className={styles.reportContentArea}>
                        {isTranslating ? (
                          <div className={styles.translationLoader}>
                            ⏳ Translation in progress...
                          </div>
                        ) : selectedLanguage !== 'English' && MOCK_TRANSLATIONS[selectedLanguage] ? (
                          <MarkdownBody content={MOCK_TRANSLATIONS[selectedLanguage]} />
                        ) : selectedRecord.aiSummary?.report ? (
                          <MarkdownBody content={selectedRecord.aiSummary.report} />
                        ) : selectedRecord.aiSummary?.summary ? (
                          <div className={styles.legacySummary}>
                            <p>{selectedRecord.aiSummary.summary}</p>
                          </div>
                        ) : (
                          <div className={styles.pendingReportNotice}>
                            <ClockIcon />
                            <p>AI Summarization in progress or pending.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyStateRecords}>
                      <p>Select a record above to view the full AI Diagnostic Summary.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT ACCESS HISTORY */}
          {activeTab === 'history' && (
            <section className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <ShieldIcon className={styles.headerIcon} />
                  <div>
                    <h2>Emergency Access Security Audit Trail</h2>
                    <p className={styles.subtitle}>
                      Log of all patient record authorizations and emergency access events initiated under your account.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.auditTableWrap}>
                <table className={styles.auditTable}>
                  <thead>
                    <tr>
                      <th>Patient Name</th>
                      <th>MedVault ID</th>
                      <th>Access Type</th>
                      <th>Reason</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessLogs.length > 0 ? (
                      accessLogs.map((log) => (
                        <tr key={log.id}>
                          <td><strong>{log.patientName}</strong></td>
                          <td><span className={styles.mvIdBadge}>{log.medvaultId}</span></td>
                          <td>
                            <span className={log.accessType === 'Routine' ? styles.mvIdBadge : styles.accessBadge}>
                              {log.accessType === 'Routine' ? '🔵 Routine' : '🔴 Emergency'}
                            </span>
                          </td>
                          <td>{log.reason}</td>
                          <td>{log.date}</td>
                          <td><span className={styles.statusAuthorized}>AUTHORIZED</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className={styles.emptyTableTd}>
                          No emergency access requests logged in this session yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: MY CREDENTIALS & TRUST SCORE (PART 2B) */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <section className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderTitle}>
                    <GraduationCapIcon className={styles.headerIcon} />
                    <div>
                      <h2>Doctor Medical Credentials & Verification</h2>
                      <p className={styles.subtitle}>
                        Official registration information submitted to the state medical council.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles.credentialsGrid}>
                  <div className={styles.credentialTile}>
                    <BuildingIcon />
                    <div>
                      <span className={styles.tileLabel}>Hospital / Clinic</span>
                      <strong>{session.profile?.hospitalName || session.hospitalName || 'MedVault Medical Network'}</strong>
                    </div>
                  </div>

                  <div className={styles.credentialTile}>
                    <GraduationCapIcon />
                    <div>
                      <span className={styles.tileLabel}>Specialization</span>
                      <strong>{session.profile?.specialization || session.specialization || 'General Physician'}</strong>
                    </div>
                  </div>

                  <div className={styles.credentialTile}>
                    <ShieldIcon />
                    <div>
                      <span className={styles.tileLabel}>Medical Registration No.</span>
                      <strong>{session.profile?.registrationNumber || 'MCI-884920'}</strong>
                    </div>
                  </div>

                  <div className={styles.credentialTile}>
                    <CheckCircleIcon />
                    <div>
                      <span className={styles.tileLabel}>State Medical Council</span>
                      <strong>{session.profile?.stateMedicalCouncil || 'Medical Council of India'}</strong>
                    </div>
                  </div>
                </div>
              </section>

              {/* PART 2B: TRUST SCORE SYSTEM */}
              <TrustScore />
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <section className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderTitle}>
                  <BellIcon className={styles.headerIcon} />
                  <div>
                    <h2>Doctor Notifications & Compliance Alerts</h2>
                    <p className={styles.subtitle}>
                      System notifications regarding emergency accesses, credentials verification, and security logs.
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.resultsGrid}>
                <div className={styles.patientCard}>
                  <div className={styles.patientAvatar} style={{ background: '#2563eb' }}>🔔</div>
                  <div className={styles.patientMeta}>
                    <h4>Medical Registration Verified</h4>
                    <p className={styles.patientSubInfo}>Your credentials have been verified by the State Medical Registry.</p>
                  </div>
                </div>

                <div className={styles.patientCard}>
                  <div className={styles.patientAvatar} style={{ background: '#dc2626' }}>⚡</div>
                  <div className={styles.patientMeta}>
                    <h4>Emergency Access Logged</h4>
                    <p className={styles.patientSubInfo}>Emergency record access granted for Priya Sharma (MV-29183746).</p>
                  </div>
                </div>

                <div className={styles.patientCard}>
                  <div className={styles.patientAvatar} style={{ background: '#10b981' }}>🛡️</div>
                  <div className={styles.patientMeta}>
                    <h4>System Audit Check Completed</h4>
                    <p className={styles.patientSubInfo}>Security audit passed with zero compliance issues.</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Routine Request Access Modal */}
      {showRequestModal && pendingTargetPatient && (
        <RequestAccessModal
          patient={pendingTargetPatient}
          onClose={() => setShowRequestModal(false)}
          onRequestSent={handleRoutineAccessGranted}
          onSwitchEmergency={() => {
            setShowRequestModal(false);
            setShowEmergencyModal(true);
          }}
        />
      )}

      {/* Emergency Access Modal Dialog */}
      {showEmergencyModal && pendingTargetPatient && (
        <EmergencyAccessModal
          patient={pendingTargetPatient}
          onClose={() => setShowEmergencyModal(false)}
          onGrant={handleGrantEmergencyAccess}
        />
      )}

      {/* Emergency Session Expired Modal */}
      {isSessionExpiredModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ textAlign: 'center', padding: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⌛</div>
            <h2>Emergency Session Expired</h2>
            <p style={{ color: '#64748b', margin: '12px 0 24px' }}>
              Emergency Session Expired — Access has been automatically terminated per security compliance.
            </p>
            <PillButton
              variant="primary"
              onClick={() => {
                setIsSessionExpiredModalOpen(false);
                endSession(activePatientSession, sessionType);
                setActiveTab('lookup');
              }}
            >
              Return to Patient Lookup
            </PillButton>
          </div>
        </div>
      )}
    </div>
  );
}
