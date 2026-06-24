// Validation utilities for the Apply Now form

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  // Indian phone number: 10 digits, optionally prefixed with +91 or 0
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const re = /^(?:\+91|91|0)?[6-9]\d{9}$/;
  return re.test(cleaned);
};

export const validateStep = (step, formData) => {
  const errors = {};

  switch (step) {
    case 0: // Personal Info
      if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      else if (!validateEmail(formData.email)) errors.email = 'Enter a valid email address';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      else if (!validatePhone(formData.phone)) errors.phone = 'Enter a valid Indian phone number';
      break;

    case 1: // Education
      if (!formData.qualification) errors.qualification = 'Select your highest qualification';
      if (!formData.duration) errors.duration = 'Select degree duration';
      if (!formData.academicStatus) errors.academicStatus = 'Select your current status';
      if (!formData.department) errors.department = 'Select your department';
      break;

    case 2: // Languages
      if (!formData.languages.length) errors.languages = 'Select at least one language';
      break;

    case 3: // Domain
      if (!formData.domain) errors.domain = 'Select a career domain';
      break;

    case 4: // Program Goal
      if (!formData.program) errors.program = 'Select a program track';
      break;

    case 5: // Additional Info — optional, no validation needed
      break;

    default:
      break;
  }

  return errors;
};

export const calculateLeadScore = (formData) => {
  if (formData.domain === 'Confused — Need Guidance') {
    return 'Counselor Follow-up';
  }

  switch (formData.program) {
    case 'Certification + Internship + Placement':
      return 'High Priority';
    case 'Certification + Internship':
      return 'Medium Priority';
    case 'Certification':
      return 'Standard Priority';
    default:
      return 'Standard Priority';
  }
};

export const initialFormData = {
  fullName: '',
  email: '',
  phone: '',
  qualification: '',
  duration: '',
  academicStatus: '',
  department: '',
  languages: [],
  domain: '',
  program: '',
  careerGoals: ''
};
