/**
 * Common validation functions
 * Reusable validation utilities for form inputs
 */

/**
 * Validates that a value is not empty
 * @param value - The value to validate
 * @param fieldName - The name of the field (for error message)
 * @returns Error message if invalid, null if valid
 */
export function validateRequired(
  value: string,
  fieldName: string
): string | null {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
}

/**
 * Validates that a value does not exceed maximum length
 * @param value - The value to validate
 * @param maxLength - Maximum allowed length
 * @param fieldName - The name of the field (for error message)
 * @returns Error message if invalid, null if valid
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): string | null {
  if (value && value.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or less`;
  }
  return null;
}

/**
 * Validates email format
 * @param email - The email to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email) {
    return null; // Use validateRequired for required checks
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return null;
}

/**
 * Validates phone number format (basic validation)
 * @param phone - The phone number to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePhone(phone: string): string | null {
  if (!phone) {
    return null; // Use validateRequired for required checks
  }

  // Basic phone validation - allows digits, spaces, dashes, parentheses, and +
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  if (!phoneRegex.test(phone)) {
    return "Please enter a valid phone number";
  }
  return null;
}

/**
 * Validates minimum length
 * @param value - The value to validate
 * @param minLength - Minimum required length
 * @param fieldName - The name of the field (for error message)
 * @returns Error message if invalid, null if valid
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string | null {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
}

