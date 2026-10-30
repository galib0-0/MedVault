import React, { useState, useEffect } from 'react';
import { getAdminDoctors, verifyDoctor } from '../../lib/admin';
import { SearchIcon, CheckCircleIcon, AlertIcon } from '../../components/icons';
import styles from '../doctor/doctor.module.css';

export default function DoctorVerificationTab() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Action modal state: { type: 'VERIFIED' | 'REJECTED' | 'SUSPENDED', doctor }
  const [actionModal, setActionModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminDoctors(statusFilter);
      setDoctors(data.doctors || []);
    } catch (err) {
      setError(err.message || 'Failed to load doctors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    setUpdating(true);
    try {
      await verifyDoctor(actionModal.doctor.id, {
        status: actionModal.type,
        notes: notes.trim(),
      });
      setActionModal(null);
      setNotes('');
      await fetchDoctors();
    } catch (err) {
      alert(err.message || 'Verification update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      doc.fullName?.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q) ||
      doc.profile?.registrationNumber?.toLowerCase().includes(q) ||
      doc.profile?.specialization?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
            ✓ Verified
          </span>
        );
      case 'PENDING':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
            ⏳ Pending Verification
          </span>
        );
      case 'REJECTED':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
            ✕ Rejected
          </span>
        );
      case 'SUSPENDED':
        return (
          <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
            ⚠️ Suspended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Top Controls & Status Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#1d4ed8' : '#f8fafc',
                color: statusFilter === st ? '#ffffff' : '#475569',
                border: '1px solid ' + (statusFilter === st ? '#1d4ed8' : '#e2e8f0'),
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              {st === 'ALL' ? 'All Doctors' : st}
            </button>
          ))}
        </div>

        <div className={styles.searchInputWrap} style={{ width: '280px' }}>
          <SearchIcon className={styles.searchIconInside} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search by name, reg # or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ Loading doctor applications...
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca' }}>
          ⚠️ {error}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>👨‍⚕️</div>
          <h4 style={{ margin: '0 0 4px', color: '#0f172a' }}>No doctor accounts match this filter</h4>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
            New doctor registrations will automatically appear here for verification.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredDoctors.map((doc) => {
            const p = doc.profile || {};
            return (
              <div
                key={doc.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '800',
                      }}
                    >
                      🩺
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                        {doc.fullName}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {doc.email} • Registered {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(doc.verificationStatus)}</div>
                </div>

                {/* Professional Credentials Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Medical Council Reg #</span>
                    <strong style={{ color: '#0f172a' }}>{p.registrationNumber || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>State Medical Council</span>
                    <strong style={{ color: '#0f172a' }}>{p.stateMedicalCouncil || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Specialization</span>
                    <strong style={{ color: '#0f172a' }}>{p.specialization || 'General'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Qualification</span>
                    <strong style={{ color: '#0f172a' }}>{p.qualification || 'MBBS'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>Hospital / Clinic</span>
                    <strong style={{ color: '#0f172a' }}>{p.hospitalName || 'Independent'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block' }}>College & Year</span>
                    <strong style={{ color: '#0f172a' }}>{p.medicalCollege ? `${p.medicalCollege} (${p.graduationYear || '—'})` : '—'}</strong>
                  </div>
                </div>

                {p.verificationNotes && (
                  <div style={{ background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '11px', color: '#475569', marginBottom: '14px' }}>
                    <strong>Admin Note:</strong> {p.verificationNotes}
                  </div>
                )}

                {/* Admin Actions */}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {doc.verificationStatus !== 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => setActionModal({ type: 'VERIFIED', doctor: doc })}
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Approve Credentials
                    </button>
                  )}

                  {doc.verificationStatus !== 'REJECTED' && (
                    <button
                      type="button"
                      onClick={() => setActionModal({ type: 'REJECTED', doctor: doc })}
                      style={{
                        background: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fca5a5',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Reject Application
                    </button>
                  )}

                  {doc.verificationStatus === 'VERIFIED' && (
                    <button
                      type="button"
                      onClick={() => setActionModal({ type: 'SUSPENDED', doctor: doc })}
                      style={{
                        background: '#475569',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      ⚠️ Suspend Doctor
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog Modal */}
      {actionModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard} style={{ maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>
              {actionModal.type === 'VERIFIED'
                ? 'Approve Doctor Credentials'
                : actionModal.type === 'REJECTED'
                ? 'Reject Doctor Application'
                : 'Suspend Doctor Account'}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
              Doctor: <strong>{actionModal.doctor.fullName}</strong> ({actionModal.doctor.email})
            </p>

            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Verification / Admin Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  className={styles.textarea}
                  placeholder="Enter details on official state medical register match, reason, etc..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setActionModal(null)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    background:
                      actionModal.type === 'VERIFIED'
                        ? '#16a34a'
                        : actionModal.type === 'REJECTED'
                        ? '#dc2626'
                        : '#475569',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: updating ? 'not-allowed' : 'pointer',
                  }}
                >
                  {updating ? 'Saving...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
