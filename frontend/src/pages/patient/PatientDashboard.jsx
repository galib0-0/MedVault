import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo';
import { useToast } from '../../components/Toast';
import { signOut, getSession } from '../../lib/auth';
import { usePatientData } from './usePatientData';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatCards from './components/StatCards';
import UploadCard from './components/UploadCard';
import RecordsSection from './components/RecordsSection';
import AISummaryCard from './components/AISummaryCard';
import EmergencyCard from './components/EmergencyCard';
import ActivityFeed from './components/ActivityFeed';
import NotificationsPanel from './components/NotificationsPanel';
import RemindersSection from './components/RemindersSection';
import VaccinationSection from './components/VaccinationSection';
import TimelineSection from './components/TimelineSection';
import DependentsSection from './components/DependentsSection';
import ProfileSection from './components/ProfileSection';
import ProfileEditModal from './components/ProfileEditModal';
import AccessHistorySection from '../../components/patient/AccessHistorySection';
import OTPApprovalPopup from '../../components/patient/OTPApprovalPopup';
import PostAccessNotification from '../../components/shared/PostAccessNotification';
import { useAccess } from '../../context/AccessContext';

import styles from './patient.module.css';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const [version, setVersion] = useState(0);
  const [active, setActive] = useState('overview');
  const [drawer, setDrawer] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const session = useMemo(() => getSession(), [version]);
  const name = session?.name || 'Patient';
  const data = usePatientData(session);
  const { triggerSimulatedRequest } = useAccess();

  const sectionRefs = useRef({});
  const goTo = (id) => {
    setActive(id);
    if (id === 'overview') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (id === 'settings') {
      toast('Settings will be available soon.', 'info');
      return;
    }
    const el = sectionRefs.current[id] || document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };

  const bindRef = (id) => (el) => {
    sectionRefs.current[id] = el;
  };

  const comingSoon = () => toast('This section is coming soon.', 'info');

  const scrollToUpload = () => {
    goTo('overview');
    window.setTimeout(() => {
      const el = document.getElementById('upload');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  const openEdit = () => {
    if (data.isAdmin) {
      comingSoon();
      return;
    }
    setEditOpen(true);
  };

  const handleUploaded = () => {
    data.refresh();
    setVersion((v) => v + 1);
  };

  return (
    <div className={styles.dash}>
      <Sidebar
        active={active}
        onNavigate={goTo}
        onSignOut={handleSignOut}
        open={drawer}
        onClose={() => setDrawer(false)}
        name={name}
      />

      <div className={styles.dashMain}>
        <TopBar name={name} onMenu={() => setDrawer(true)} onNavigate={goTo} />

        <main className={styles.content}>
          {data.isAdmin && (
            <div className={styles.previewBanner}>
              Administrator preview — you are viewing demo patient data. Regular patients only
              see their own data.
            </div>
          )}

          <StatCards quickStats={data.quickStats} />

          <div id="upload">
            <UploadCard onComplete={handleUploaded} />
          </div>

          <div className={styles.gridWrap}>
            <div className={`${styles.slot} ${styles.slotCol1}`} ref={bindRef('records')}>
              <RecordsSection records={data.records} loading={data.recordsLoading} onViewAll={() => goTo('records')} onUpload={scrollToUpload} />
            </div>
            <div className={styles.slot} ref={bindRef('emergency')}>
              <EmergencyCard emergency={data.emergency} onEdit={openEdit} />
            </div>
            <div className={`${styles.slot} ${styles.slotCol1}`} ref={bindRef('summary')}>
              <AISummaryCard aiSummary={data.aiSummary} onUpload={scrollToUpload} />
            </div>
            <div className={styles.slot} ref={bindRef('notifications')}>
              <NotificationsPanel notifications={data.notifications} />
            </div>
            <div className={`${styles.slot} ${styles.slotCol1}`} ref={bindRef('timeline')}>
              <TimelineSection timeline={data.timeline} onExplore={() => goTo('timeline')} />
            </div>
            <div className={styles.slot} ref={bindRef('reminders')}>
              <RemindersSection reminders={data.reminders} />
            </div>
            <div className={styles.slot} ref={bindRef('activity')}>
              <ActivityFeed activity={data.activity} />
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <div ref={bindRef('vaccinations')}>
              <VaccinationSection vaccinations={data.vaccinations} />
            </div>
            <div ref={bindRef('dependents')}>
              <DependentsSection dependents={data.dependents} onAdd={comingSoon} />
            </div>
          </div>

          <div ref={bindRef('access-history')} className="mt-6 mb-6">
            <AccessHistorySection />
          </div>

          <div ref={bindRef('profile')}>
            <ProfileSection
              profile={data.profile}
              onEditProfile={data.isAdmin ? null : () => setEditOpen(true)}
              onViewQr={comingSoon}
              onDownloadQr={comingSoon}
            />
          </div>

          <footer className={styles.footer}>
            <Logo className={styles.footerLogo} />
            <p>
              MedVault AI — Centralized healthcare records with AI-powered summaries.
              Data is encrypted and access is strictly controlled.
            </p>
          </footer>
        </main>
      </div>

      <ProfileEditModal
        open={editOpen}
        session={session}
        onClose={() => setEditOpen(false)}
        onSaved={() => setVersion((v) => v + 1)}
      />

      {/* FEATURE 1 & 2: Patient In-App OTP & Post-Access Emergency Notification Popups */}
      <OTPApprovalPopup />
      <PostAccessNotification />
    </div>
  );
}