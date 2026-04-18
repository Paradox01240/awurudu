// Sri Lankan NIC and Phone Number Validation Library

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  type?: 'nic' | 'phone' | 'email';
}

// Sri Lankan NIC validation (optional)
export function validateSriLankanNIC(nic: string): ValidationResult {
  // Remove spaces and convert to uppercase
  const cleanNIC = nic.trim().toUpperCase();
  
  // If NIC is empty, it's valid (optional field)
  if (!cleanNIC) {
    return { isValid: true, type: 'nic' };
  }
  
  // Old NIC format: 9 digits + V/X (e.g., 123456789V)
  const oldNICPattern = /^[0-9]{9}[VX]$/;
  
  // New NIC format: 12 digits (e.g., 200012345678)
  const newNICPattern = /^[0-9]{12}$/
  
  if (oldNICPattern.test(cleanNIC)) {
    // Validate old NIC format
    const digits = cleanNIC.substring(0, 9);
    const letter = cleanNIC.charAt(9);
    
    // Basic validation for old NIC
    if (letter === 'V' || letter === 'X') {
      return { isValid: true, type: 'nic' };
    } else {
      return { isValid: false, error: 'Invalid NIC format. Use V or X at the end', type: 'nic' };
    }
  }
  
  if (newNICPattern.test(cleanNIC)) {
    // Validate new NIC format
    return { isValid: true, type: 'nic' };
  }
  
  return { isValid: false, error: 'Invalid NIC format. Use 9 digits + V/X or 12 digits', type: 'nic' };
}

// Sri Lankan phone number validation
export function validateSriLankanPhone(phone: string): ValidationResult {
  const cleanPhone = phone.trim();
  
  if (!cleanPhone) {
    return { isValid: false, error: 'Phone number is required', type: 'phone' };
  }
  
  // Remove all non-digit characters
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  
  // Sri Lankan phone numbers: 10 digits starting with 0
  const phonePattern = /^0[0-9]{9}$/;
  
  if (!phonePattern.test(digitsOnly)) {
    return { isValid: false, error: 'Invalid Sri Lankan phone number. Use 10 digits starting with 0', type: 'phone' };
  }
  
  return { isValid: true, type: 'phone' };
}

// Email validation (optional)
export function validateEmail(email: string): ValidationResult {
  const cleanEmail = email.trim().toLowerCase();
  
  // If email is empty, it's valid (optional field)
  if (!cleanEmail) {
    return { isValid: true, type: 'email' };
  }
  
  // Basic email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailPattern.test(cleanEmail)) {
    return { isValid: false, error: 'Invalid email format', type: 'email' };
  }
  
  return { isValid: true, type: 'email' };
}

// Comprehensive voter information validation
export function validateVoterInfo(voterInfo: {
  name: string;
  nic: string;
  phone: string;
  email: string;
}): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate Name (required)
  if (!voterInfo.name || voterInfo.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters long');
  }
  
  // Validate Phone (required)
  const phoneValidation = validateSriLankanPhone(voterInfo.phone);
  if (!phoneValidation.isValid) {
    errors.push(phoneValidation.error || 'Invalid phone number');
  }
  
  // Validate NIC (optional - only validate if provided)
  if (voterInfo.nic && voterInfo.nic.trim()) {
    const nicValidation = validateSriLankanNIC(voterInfo.nic);
    if (!nicValidation.isValid) {
      errors.push(nicValidation.error || 'Invalid NIC format');
    }
  }
  
  // Validate Email (optional - only validate if provided)
  if (voterInfo.email && voterInfo.email.trim()) {
    const emailValidation = validateEmail(voterInfo.email);
    if (!emailValidation.isValid) {
      errors.push(emailValidation.error || 'Invalid email format');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
