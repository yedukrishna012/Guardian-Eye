const AUTH_ERROR_MESSAGES = {
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account exists for that email address.',
  'auth/wrong-password': 'The password is incorrect.',
  'auth/email-already-in-use': 'An account already exists for that email address.',
  'auth/weak-password': 'Choose a password with at least 6 characters.',
  'auth/missing-password': 'Enter your password.',
  'auth/too-many-requests': 'Too many attempts. Wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase.',
  'auth/requires-recent-login': 'Sign in again before making this change.',
  'auth/password-does-not-meet-requirements': 'Choose a stronger password.',
}

export function getAuthErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.'
  return AUTH_ERROR_MESSAGES[error.code] || error.message || 'Something went wrong. Please try again.'
}
