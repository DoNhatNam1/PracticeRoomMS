// Auth constants

export const AUTH_PATTERNS = {
  REGISTER: 'auth.register',
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REFRESH_TOKEN: 'auth.refreshToken',
  VALIDATE_TOKEN: 'auth.validateToken',
  CHANGE_PASSWORD: 'auth.changePassword',
  FORGOT_PASSWORD: 'auth.forgotPassword',
  RESET_PASSWORD: 'auth.resetPassword',
};

export const AUTH_EVENTS = {
  LOGGED_IN: 'auth.loggedIn',
  LOGGED_OUT: 'auth.loggedOut',
  PASSWORD_CHANGED: 'auth.passwordChanged',
  PASSWORD_RESET_REQUESTED: 'auth.passwordResetRequested',
};