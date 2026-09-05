/**
 * Input validation helpers
 * Used for client-side form validation
 */

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 50;
};

export const validatePhone = (phone) => {
  if (!phone) return true; // optional field
  const re = /^\+?[\d\s-]{7,15}$/;
  return re.test(phone);
};
