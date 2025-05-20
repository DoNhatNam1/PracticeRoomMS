// Activity constants

export const ACTIVITY_USER_PATTERNS = {
  GET_USER_ACTIVITY: 'activity.getUserActivity',
  GET_USER_ROOM_USAGE: 'activity.getUserRoomUsage',
  GET_ROOM_USAGE_STATS: 'activity.getRoomUsageStats',
  LOG_ACTIVITY: 'activity.logActivity',
};

export const ACTIVITY_USER_EVENTS = {
    ACTIVITY_LOGGED: 'activity.logged',
    ROOM_USAGE_STARTED: 'activity.roomUsageStarted',
    ROOM_USAGE_ENDED: 'activity.roomUsageEnded',
    USER_CREATED: 'activity.userCreated',     
    USER_LOGGED_IN: 'activity.userLoggedIn',
    USER_LOGGED_OUT: 'activity.userLoggedOut',
    PASSWORD_CHANGED: 'activity.passwordChanged',
    ROLE_CHANGED: 'activity.roleChanged',
    ACCOUNT_STATUS_CHANGED: 'activity.accountStatusChanged',
    PROFILE_UPDATED: 'activity.profileUpdated', 
  };