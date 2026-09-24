import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import PillButton from '../components/PillButton';
import CheckboxField from '../components/CheckboxField';
import RoleToggle from '../components/RoleToggle';
import GoogleButton from '../components/GoogleButton';
import { useToast } from '../components/Toast';
import { login } from '../lib/auth';
import { required, isEmail } from '../lib/validation';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [role, setRole] = useState('PATIENT');
  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validateField = (name, value) => {
    if (!required(value)) return `${name === 'email' ? 'Email' : 'Password'} is required.`;
    if (name === 'email' && !isEmail(value)) return 'Enter a valid email address.';
    return null;
  };

  const set = (name) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [name]: value }));
    const err = validateField(name, value);
    setErrors((er) => ({ ...er, [name]: err }));
    setValid((v) => ({ ...v, [name]: !err }));
  };

  const handleBlur = (name) => () => {
    const err = validateField(name, form[name]);
    setErrors((er) => ({ ...er, [name]: err }));
    setValid((v) => ({ ...v, [name]: !err }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    let ok = true;
    Object.keys(form).forEach((name) => {
      const err = validateField(name, form[name]);
      next[name] = err;
      if (err) ok = false;
    });
    setErrors(next);
    setValid(Object.fromEntries(Object.keys(form).map((n) => [n, !next[n]])));
    if (!ok) return;

    setSubmitting(true);
    try {
      const session = await login({ email: form.email, password: form.password });
      const isAdmin = session.role === 'ADMIN';
      const target =
        isAdmin
          ? role === 'DOCTOR'
            ? '/doctor'
            : '/patient'
          : session.role === 'DOCTOR'
          ? '/doctor'
          : '/patient';
      toast(
        isAdmin
          ? 'Signed in as Admin.'
          : session.role === 'DOCTOR'
          ? 'Welcome back, Doctor.'
          : 'Welcome back! Signed in to your Patient space.',
        'success'
      );
      navigate(target);
    } catch (err) {
      toast(err.message || 'Sign in failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      formTitle="Welcome back"
      formSubtitle="Sign in to access your MedVault space."
    >
      <RoleToggle value={role} onChange={setRole} />

      <form onSubmit={handleSubmit} noValidate>
        <FormField
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={set('email')}
          onBlur={handleBlur('email')}
          required
          error={errors.email}
          valid={valid.email}
          autoComplete="email"
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={set('password')}
          onBlur={handleBlur('password')}
          required
          error={errors.password}
          valid={valid.password}
          autoComplete="current-password"
        />

        <div className={styles.rowBetween}>
          <CheckboxField
            label="Remember me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            name="remember"
          />
          <button
            type="button"
            className={styles.forgot}
            onClick={() => toast('Password reset will be available soon.')}
          >
            Forgot password?
          </button>
        </div>

        <PillButton type="submit" full disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </PillButton>
      </form>

      <div className={styles.divider}>
        <span>or</span>
      </div>

      <GoogleButton
        onClick={() =>
          toast(
            `${role === 'DOCTOR' ? 'Doctor' : 'Patient'} Google Sign-In will be available soon.`
          )
        }
      />

      <p className={styles.footer}>
        New to MedVault AI? <Link to="/signup">Create an account</Link>
      </p>

      <p className={styles.demoNote}>
        Use your registered account credentials to sign in.
      </p>
    </AuthLayout>
  );
}
