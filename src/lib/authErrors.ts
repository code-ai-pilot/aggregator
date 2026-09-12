/**
 * Maps Firebase Auth error codes and exceptions to clear, user-facing error messages.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error) return 'An unexpected authentication error occurred. Please try again.';

  const code = typeof error === 'object' && error !== null && 'code' in error
    ? (error as { code: string }).code
    : '';

  const message = typeof error === 'object' && error !== null && 'message' in error
    ? (error as { message: string }).message
    : String(error);

  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please sign up or check the address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify and try again, or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address. Please sign in instead.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled. Please contact the administrator.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters with a combination of letters and numbers.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site and retry.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in popup is already active.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address using a different sign-in method.';
    case 'auth/requires-recent-login':
      return 'This action requires recent authentication. Please sign in again and retry.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connectivity and try again.';
    case 'auth/invalid-api-key':
    case 'auth/app-not-authorized':
      return 'Firebase Authentication is not yet fully configured with an active API key in this environment.';
    default:
      if (message.includes('API key not valid') || message.includes('apiKey')) {
        return 'Firebase Authentication API key is missing or invalid in the current environment.';
      }
      return message || 'Authentication failed. Please check your details and try again.';
  }
}
