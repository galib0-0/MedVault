import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';
import PasswordStrength from '../components/PasswordStrength';
import GoogleButton from '../components/GoogleButton';
import GoogleSetupModal from '../components/GoogleSetupModal';
import { promptGoogleVerify } from '../lib/googleAuth';
import { useToast } from '../components/Toast';
import { ArrowLeftIcon } from '../components/icons';
import useForm from '../lib/useForm';
import { signupPatient, saveSession } from '../lib/auth';
import {
  required,
  isEmail,
  isIndianMobile,
  isPinCode,
  isPassword,
  isDateOfBirth,
  matches,
} from '../lib/validation';
import {
  INDIAN_STATES,
  BLOOD_GROUPS,
  GENDERS,
  RELATIONSHIPS,
} from '../lib/constants';
import styles from './PatientSignupPage.module.css';

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));

const EMPTY = {
  fullName: '',
  dob: '',
  gender: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  city: '',
  state: '',
  pinCode: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  emergencyContactRelationship: '',
  bloodGroup: '',
  allergies: '',
  medicalConditions: '',
  medications: '',
};

export default function PatientSignupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [showMedical, setShowMedical] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);

  const { values, setValues, errors, touched, handleChange, handleBlur, validateAll, isValid } =
    useForm(EMPTY, {
      fullName: (v) => (required(v) ? null : 'Full name is required.'),
      dob: (v) =>
        !required(v)
          ? 'Date of birth is required.'
          : isDateOfBirth(v)
          ? null
          : 'Enter a valid date of birth.',
      gender: (v) => (required(v) ? null : 'Please select your gender.'),
      mobile: (v) =>
        !required(v)
          ? 'Mobile number is required.'
          : isIndianMobile(v)
          ? null
          : 'Enter a valid 10-digit mobile number.',
      email: (v) =>
        !required(v)
          ? 'Email address is required.'
          : isEmail(v)
          ? null
          : 'Enter a valid email address.',
      password: (v) =>
        googleUser
          ? null
          : !required(v)
          ? 'Password is required.'
          : isPassword(v)
          ? null
          : 'Use at least 8 characters with a letter and a number.',
      confirmPassword: (v, all) =>
        googleUser ? null : matches(v, all.password) ? null : 'Passwords do not match.',
      address: (v) => (required(v) ? null : 'Address is required.'),
      city: (v) => (required(v) ? null : 'City is required.'),
      state: (v) => (required(v) ? null : 'Please select your state.'),
      pinCode: (v) =>
        !required(v)
          ? 'PIN code is required.'
          : isPinCode(v)
          ? null
          : 'Enter a valid 6-digit PIN code.',
      emergencyContactName: (v) =>
        required(v) ? null : 'Emergency contact name is required.',
      emergencyContactNumber: (v) =>
        !required(v)
          ? 'Emergency contact number is required.'
          : isIndianMobile(v)
          ? null
          : 'Enter a valid 10-digit mobile number.',
      emergencyContactRelationship: (v) =>
        required(v) ? null : 'Please select the relationship.',
    });

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const res = await promptGoogleVerify();
      if (res.exists) {
        saveSession(res.session);
        toast(`Welcome back! Signed in as ${res.user.fullName || res.user.email}.`, 'success');
        navigate(res.user.role === 'DOCTOR' ? '/doctor' : '/patient');
        return;
      }

      const gUser = res.googleUser;
      setGoogleUser(gUser);
      setValues((prev) => ({
        ...prev,
        fullName: gUser.fullName || prev.fullName,
        email: gUser.email || prev.email,
        password: prev.password || 'GoogleOAuth_Secured123!',
        confirmPassword: prev.confirmPassword || 'GoogleOAuth_Secured123!',
      }));
      toast('Google verified! Please fill in your basic personal and emergency details to complete signup.', 'info');
    } catch (err) {
      if (err.code === 'MISSING_CLIENT_ID') {
        setShowSetupModal(true);
      } else {
        toast(err.message || 'Google Sign-Up was cancelled or failed.', 'error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const field = (name) => ({
    name,
    value: values[name],
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: touched[name] ? errors[name] : undefined,
    valid: !!values[name] && isValid(name),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast('Please fix the highlighted fields to continue.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await signupPatient({
        ...values,
        googleId: googleUser?.googleId,
        googleAuth: Boolean(googleUser),
        profilePhoto: googleUser?.picture || undefined,
        gender: values.gender,
        bloodGroup: values.bloodGroup || null,
        allergies: values.allergies || null,
        medicalConditions: values.medicalConditions || null,
        medications: values.medications || null,
      });
      toast('Your MedVault patient account has been created.', 'success');
      navigate('/patient');
    } catch (err) {
      toast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      wide
      formTitle="Create your account"
      formSubtitle="Register as a Patient on MedVault AI."
    >
      {!googleUser ? (
        <div style={{ maxWidth: '340px', margin: '0 auto 20px' }}>
          <GoogleButton onClick={handleGoogleSignUp} disabled={googleLoading}>
            {googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}
          </GoogleButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0', color: '#94a3b8', fontSize: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span>or fill out details manually</span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          padding: '12px 16px',
          margin: '0 auto 24px',
          maxWidth: '560px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            {googleUser.picture ? (
              <img
                src={googleUser.picture}
                alt={googleUser.fullName}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #22c55e' }}
              />
            ) : (
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {googleUser.fullName?.charAt(0) || 'G'}
              </div>
            )}
            <div style={{ minWidth: 0, textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>✓ Google Account Connected</span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {googleUser.fullName} ({googleUser.email})
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Basic info pre-filled. Please complete your medical & address details below.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setGoogleUser(null);
              setValues((v) => ({ ...v, password: '', confirmPassword: '' }));
            }}
            style={{
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Change
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <h3 className={styles.sectionTitle}>Personal Information</h3>
        <div className={styles.grid}>
          <FormField
            label="Full Name"
            placeholder="Enter your full name"
            required
            {...field('fullName')}
            autoComplete="name"
          />
          <FormField
            label="Gender"
            as="select"
            placeholder="Select gender"
            required
            options={toOptions(GENDERS)}
            {...field('gender')}
          />
          <FormField
            label="Date of Birth"
            type="date"
            required
            max={new Date().toISOString().split('T')[0]}
            {...field('dob')}
          />
          <FormField
            label="Mobile Number"
            placeholder="10-digit mobile number"
            type="tel"
            required
            maxLength={10}
            {...field('mobile')}
            autoComplete="tel"
          />
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            required
            readOnly={Boolean(googleUser)}
            hint={googleUser ? 'Verified via your Google account' : undefined}
            {...field('email')}
            autoComplete="email"
          />
          {googleUser ? (
            <div style={{
              gridColumn: '1 / -1',
              background: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#475569',
              fontSize: '13px',
              margin: '4px 0 8px',
            }}>
              <span style={{ fontSize: '18px' }}>🔒</span>
              <div>
                <strong>Password not required.</strong> You can log in securely anytime using Google Sign-In with <strong>{googleUser.email}</strong>.
              </div>
            </div>
          ) : (
            <>
              <FormField
                label="Password"
                type="password"
                placeholder="Create a password"
                required
                {...field('password')}
                autoComplete="new-password"
                hint="Minimum 8 characters with a letter and a number."
              />
              {values.password && !errors.password && (
                <div className={styles.strengthWrap}>
                  <PasswordStrength value={values.password} />
                </div>
              )}
              <FormField
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your password"
                required
                {...field('confirmPassword')}
                autoComplete="new-password"
              />
            </>
          )}
        </div>

        <h3 className={styles.sectionTitle}>Address</h3>
        <div className={styles.grid}>
          <FormField
            label="Address"
            as="textarea"
            rows={2}
            placeholder="House no, street, area"
            required
            {...field('address')}
            autoComplete="street-address"
          />
          <FormField
            label="City"
            placeholder="Enter your city"
            required
            {...field('city')}
            autoComplete="address-level2"
          />
          <FormField
            label="State"
            as="select"
            placeholder="Select state"
            required
            options={toOptions(INDIAN_STATES)}
            {...field('state')}
          />
          <FormField
            label="PIN Code"
            placeholder="6-digit PIN code"
            maxLength={6}
            required
            {...field('pinCode')}
            autoComplete="postal-code"
          />
        </div>

        <h3 className={styles.sectionTitle}>Emergency Contact</h3>
        <p className={styles.sectionNote}>
          Used to reach a loved one during a medical emergency.
        </p>
        <div className={styles.grid}>
          <FormField
            label="Emergency Contact Name"
            placeholder="Full name"
            required
            {...field('emergencyContactName')}
          />
          <FormField
            label="Relationship with Emergency Contact"
            as="select"
            placeholder="Select relationship"
            required
            options={toOptions(RELATIONSHIPS)}
            {...field('emergencyContactRelationship')}
          />
          <FormField
            label="Emergency Contact Number"
            placeholder="10-digit mobile number"
            type="tel"
            maxLength={10}
            required
            {...field('emergencyContactNumber')}
          />
        </div>

        <div className={styles.optional}>
          <button
            type="button"
            className={styles.optionalToggle}
            onClick={() => setShowMedical((s) => !s)}
            aria-expanded={showMedical}
          >
            <span>Medical Profile (Optional)</span>
            <span className={styles.optionalChevron}>
              {showMedical ? 'Hide' : 'Show'}
            </span>
          </button>
          {showMedical && (
            <div className={styles.optionalBody}>
              <p className={styles.sectionNote}>
                Not required now &mdash; you can complete these later from your
                Medical Profile.
              </p>
              <div className={styles.grid}>
                <FormField
                  label="Blood Group"
                  as="select"
                  placeholder="Select blood group"
                  options={toOptions(BLOOD_GROUPS)}
                  {...field('bloodGroup')}
                />
                <FormField
                  label="Known Allergies"
                  placeholder="e.g. Penicillin, peanuts"
                  {...field('allergies')}
                />
                <FormField
                  label="Existing Medical Conditions"
                  as="textarea"
                  rows={2}
                  placeholder="e.g. Diabetes, hypertension"
                  {...field('medicalConditions')}
                />
                <FormField
                  label="Current Medications"
                  as="textarea"
                  rows={2}
                  placeholder="e.g. Metformin 500 mg daily"
                  {...field('medications')}
                />
              </div>
            </div>
          )}
        </div>

        <PillButton type="submit" full disabled={submitting}>
          {submitting ? 'Creating your account...' : 'Create Patient Account'}
        </PillButton>

        <p className={styles.footer}>
          <Link to="/signup">
            <ArrowLeftIcon /> Back to account type
          </Link>
          <span>
            Already have an account? <Link to="/login">Sign in</Link>
          </span>
        </p>
      </form>

      <GoogleSetupModal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
      />
    </AuthLayout>
  );
}
