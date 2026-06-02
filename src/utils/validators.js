export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPhone = (phone) => {
  return /^\+?[0-9]{10,15}$/.test(phone);
};

export const isValidUsername = (username) => {
  return /^[a-zA-Z0-9_.]{3,30}$/.test(username);
};

export const isValidPassword = (password) => {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
};

export const isValidURL = (url) => {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { level: 'weak', color: '#EF4444', text: 'Weak' };
  if (score <= 4) return { level: 'medium', color: '#F59E0B', text: 'Medium' };
  return { level: 'strong', color: '#10B981', text: 'Strong' };
};