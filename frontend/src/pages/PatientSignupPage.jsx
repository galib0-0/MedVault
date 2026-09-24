import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';
import PasswordStrength from '../components/PasswordStrength';
import { useToast } from '../components/Toast';
import { ArrowLeftIcon } from '../components/icons';
import useForm from '../lib/useForm';
import { signupPatient } from '../lib/auth';
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

  const { values, errors, touched, handleChange, handleBlur, validateAll, isValid } =
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
        !required(v)
          ? 'Password is required.'
          : isPassword(v)
          ? null
          : 'Use at least 8 characters with a letter and a number.',
      confirmPassword: (v, all) =>
        matches(v, all.password) ? null : 'Passwords do not match.',
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
    </AuthLayout>
  );
}
