import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';
import PasswordStrength from '../components/PasswordStrength';
import FileUpload from '../components/FileUpload';
import VerificationBadge from '../components/VerificationBadge';
import { useToast } from '../components/Toast';
import { ArrowLeftIcon, InfoIcon, ShieldIcon } from '../components/icons';
import useForm from '../lib/useForm';
import { signupDoctor } from '../lib/auth';
import {
  required,
  isEmail,
  isIndianMobile,
  isPassword,
  isDateOfBirth,
  matches,
  isNotFutureDate,
  isYear,
  isRegistrationNumber,
  isAllowedFileType,
  isFileSizeOk,
} from '../lib/validation';
import {
  INDIAN_STATES,
  MEDICAL_COUNCILS,
  QUALIFICATIONS,
  SPECIALIZATIONS,
} from '../lib/constants';
import styles from './DoctorSignupPage.module.css';

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));

const fileRule = (message) => (v) => {
  if (!v) return message;
  if (!isAllowedFileType(v) || !isFileSizeOk(v)) {
    return 'Upload a valid document (PDF, JPG or PNG, max 5 MB).';
  }
  return null;
};

const EMPTY = {
  fullName: '',
  dob: '',
  mobile: '',
  email: '',
  password: '',
  confirmPassword: '',
  profilePhoto: null,
  address: '',
  city: '',
  state: '',
  hospitalName: '',
  hospitalAddress: '',
  registrationNumber: '',
  stateMedicalCouncil: '',
  registrationDate: '',
  qualification: '',
  medicalCollege: '',
  graduationYear: '',
  specialization: '',
  registrationCertificate: null,
  degreeCertificate: null,
  professionalId: null,
};

const STEP1_RULES = {
  fullName: (v) => (required(v) ? null : 'Full name is required.'),
  dob: (v) =>
    !required(v)
      ? 'Date of birth is required.'
      : isDateOfBirth(v)
      ? null
      : 'Enter a valid date of birth.',
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
    !required(v)
      ? 'Password is required.'
      : isPassword(v)
      ? null
      : 'Use at least 8 characters with a letter and a number.',
  confirmPassword: (v, all) =>
    matches(v, all.password) ? null : 'Passwords do not match.',
  profilePhoto: fileRule('Profile photo is required.'),
  address: (v) => (required(v) ? null : 'Address is required.'),
  city: (v) => (required(v) ? null : 'City is required.'),
  state: (v) => (required(v) ? null : 'Please select your state.'),
  hospitalName: (v) => (required(v) ? null : 'Hospital / Clinic name is required.'),
  hospitalAddress: (v) =>
    required(v) ? null : 'Hospital / Clinic address is required.',
};

const STEP2_RULES = {
  registrationNumber: (v) =>
    !required(v)
      ? 'Medical Registration Number is required.'
      : isRegistrationNumber(v)
      ? null
      : 'Enter a valid registration number (4-20 alphanumeric characters).',
  stateMedicalCouncil: (v) =>
    required(v) ? null : 'Please select your State Medical Council.',
  registrationDate: (v) =>
    !required(v)
      ? 'Registration date is required.'
      : isNotFutureDate(v)
      ? null
      : 'Registration date cannot be in the future.',
  qualification: (v) => (required(v) ? null : 'Please select your qualification.'),
  medicalCollege: (v) =>
    required(v) ? null : 'Medical college / institution is required.',
  graduationYear: (v) =>
    !required(v)
      ? 'Graduation year is required.'
      : isYear(v)
      ? null
      : `Enter a valid year (1950 - ${new Date().getFullYear()}).`,
  specialization: (v) =>
    required(v) ? null : 'Please select your specialization.',
  registrationCertificate: fileRule('Medical registration certificate is required.'),
  degreeCertificate: fileRule('Degree certificate is required.'),
  professionalId: (v) =>
    v && (!isAllowedFileType(v) || !isFileSizeOk(v))
      ? 'Upload a valid document (PDF, JPG or PNG, max 5 MB).'
      : null,
};

export default function DoctorSignupPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const rules = step === 1 ? STEP1_RULES : STEP2_RULES;

  const { values, errors, touched, setValue, handleChange, handleBlur, validateAll, isValid } =
    useForm(EMPTY, rules);

  const field = (name) => ({
    name,
    value: values[name],
    onChange: handleChange(name),
    onBlur: handleBlur(name),
    error: touched[name] ? errors[name] : undefined,
    valid: !!values[name] && isValid(name),
  });

  const fileField = (name) => ({
    file: values[name],
    error: touched[name] ? errors[name] : undefined,
    valid: !!values[name] && isValid(name),
    onChange: (file) => setValue(name, file),
  });

  const goStep = (next) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast('Please complete the highlighted fields to continue.', 'error');
      return;
    }
    goStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) {
      toast('Please complete the highlighted fields to continue.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await signupDoctor({ ...values, role: 'DOCTOR' });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast(err.message || 'Signup failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOutToLogin = () => {
    localStorage.removeItem('medvault_session');
    navigate('/login');
  };

  if (submitted) {
    return (
      <AuthLayout
        formTitle="Application submitted"
        formSubtitle="Your doctor account has been created."
      >
        <div className={styles.success}>
          <div className={styles.successBadge}>
            <VerificationBadge status="PENDING" size="lg" />
          </div>
          <h3 className={styles.successTitle}>
            Your medical credentials are under verification.
          </h3>
          <p className={styles.successText}>
            Patient-record access will be enabled only after an administrator
            verifies your registration details against the appropriate official
            medical register.
          </p>
          <PillButton
            type="button"
            full
            onClick={() => navigate('/doctor')}
          >
            Go to Doctor Space
          </PillButton>
          <p className={styles.successFooter}>
            <button
              type="button"
              className={styles.textLink}
              onClick={handleSignOutToLogin}
            >
              Back to Login
            </button>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      wide
      formTitle="Create your doctor account"
      formSubtitle={
        step === 1
          ? 'Step 1 of 2 — Create your account.'
          : 'Step 2 of 2 — Professional verification.'
      }
    >
      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
          <span className={styles.stepNum}>1</span>
          <span>Account Creation</span>
        </div>
        <span className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
          <span className={styles.stepNum}>2</span>
          <span>Professional Verification</span>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={handleContinue} noValidate>
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
              label="Date of Birth"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              {...field('dob')}
            />
            <FormField
              label="Mobile Number"
              type="tel"
              placeholder="10-digit mobile number"
              maxLength={10}
              required
              {...field('mobile')}
              autoComplete="tel"
            />
            <FormField
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              required
              {...field('email')}
              autoComplete="email"
            />
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
              <PasswordStrength value={values.password} className={styles.strength} />
            )}
            <FormField
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              required
              {...field('confirmPassword')}
              autoComplete="new-password"
            />
            <FileUpload
              label="Profile Photo"
              required
              hint="Will appear on your professional profile."
              {...fileField('profilePhoto')}
            />
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
          </div>

          <h3 className={styles.sectionTitle}>Workplace</h3>
          <div className={styles.grid}>
            <FormField
              label="Hospital / Clinic Name"
              placeholder="Enter hospital or clinic name"
              required
              {...field('hospitalName')}
            />
            <FormField
              label="Hospital / Clinic Address"
              placeholder="Address of hospital or clinic"
              required
              {...field('hospitalAddress')}
            />
          </div>

          <PillButton type="submit" full>
            Continue to Professional Verification
          </PillButton>

          <p className={styles.footer}>
            <Link to="/signup">
              <ArrowLeftIcon /> Back to account type
            </Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.notice}>
            <ShieldIcon />
            <div>
              <strong>Doctor accounts must be verified.</strong>
              <p>
                The most important verification details are your{' '}
                <strong>Medical Registration Number</strong> and{' '}
                <strong>State Medical Council</strong>. Patient-record access is
                enabled only after verification.
              </p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Medical Registration</h3>
          <div className={styles.grid}>
            <FormField
              label="Medical Registration Number"
              placeholder="e.g. 12345 / APMC / 2020"
              required
              {...field('registrationNumber')}
              hint="This is your primary verification identifier."
            />
            <FormField
              label="State Medical Council"
              as="select"
              placeholder="Select council"
              required
              options={toOptions(MEDICAL_COUNCILS)}
              {...field('stateMedicalCouncil')}
            />
            <FormField
              label="Registration Date"
              type="date"
              required
              max={new Date().toISOString().split('T')[0]}
              {...field('registrationDate')}
            />
            <FormField
              label="Medical Qualification"
              as="select"
              placeholder="Select qualification"
              required
              options={toOptions(QUALIFICATIONS)}
              {...field('qualification')}
            />
            <FormField
              label="Medical College / Institution"
              placeholder="Name of institution"
              required
              {...field('medicalCollege')}
            />
            <FormField
              label="Graduation Year"
              placeholder="e.g. 2015"
              maxLength={4}
              required
              {...field('graduationYear')}
            />
            <FormField
              label="Specialization"
              as="select"
              placeholder="Select specialization"
              required
              options={toOptions(SPECIALIZATIONS)}
              {...field('specialization')}
            />
          </div>

          <div className={styles.summaryCard}>
            <InfoIcon />
            <span>
              Hospital / Clinic: <strong>{values.hospitalName || '—'}</strong>
            </span>
          </div>

          <h3 className={styles.sectionTitle}>Supporting Documents</h3>
          <p className={styles.sectionNote}>
            These documents support your verification. The medical registration
            status is the primary verification criterion.
          </p>
          <div className={styles.grid}>
            <FileUpload
              label="Medical Registration Certificate"
              required
              {...fileField('registrationCertificate')}
            />
            <FileUpload
              label="Degree Certificate"
              required
              {...fileField('degreeCertificate')}
            />
            <FileUpload
              label="Professional Identification Document"
              hint="Optional — e.g. government-issued professional ID."
              {...fileField('professionalId')}
            />
          </div>

          <PillButton type="submit" full disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </PillButton>

          <p className={styles.footer}>
            <button
              type="button"
              className={styles.textLink}
              onClick={() => goStep(1)}
            >
              <ArrowLeftIcon /> Back to account details
            </button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
