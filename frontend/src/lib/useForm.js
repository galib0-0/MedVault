import { useState } from 'react';

export default function useForm(initialValues, rules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const errorFor = (name) => {
    const rule = rules[name];
    return rule ? rule(values[name], values) : null;
  };

  const setValue = (name, value) => {
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    const rule = rules[name];
    setErrors((e) => ({ ...e, [name]: rule ? rule(value, nextValues) : null }));
  };

  const handleChange = (name) => (e) => {
    setValue(name, e && e.target ? e.target.value : e);
  };

  const handleBlur = (name) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: errorFor(name) }));
  };

  const validateAll = () => {
    const next = {};
    let ok = true;
    Object.keys(rules).forEach((name) => {
      const err = errorFor(name);
      next[name] = err;
      if (err) ok = false;
    });
    setErrors(next);
    setTouched(Object.fromEntries(Object.keys(rules).map((n) => [n, true])));
    return ok;
  };

  const isValid = (name) => !errorFor(name);

  return {
    values,
    setValues,
    errors,
    touched,
    setValue,
    handleChange,
    handleBlur,
    validateAll,
    isValid,
  };
}
