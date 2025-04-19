// User entity constants

export const USERS_PATTERNS = {
  // Giữ lại các patterns từ USER_PATTERNS
  FIND_ALL: 'user.findAll',
  FIND_ONE: 'user.findOne',
  FIND_BY_EMAIL: 'user.findByEmail',
  CREATE: 'user.create',
  UPDATE: 'user.update',
  REMOVE: 'user.remove',
  UPDATE_ROLE: 'user.updateRole',
  UPDATE_STATUS: 'user.updateStatus',
  
  // Thêm patterns từ USER_SERVICE_PATTERNS
  GET_USER_ACTIVITY: 'user.getUserActivity',
  GET_USER_ROOM_USAGE: 'user.getUserRoomUsage',
  LOG_ACTIVITY: 'user.logActivity',
  GET_STUDENTS_BY_TEACHER: 'user.getStudentsByTeacher',
  ASSIGN_STUDENTS: 'user.assignStudents',
};

export const USERS_EVENTS = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DELETED: 'user.deleted',
  ROLE_CHANGED: 'user.roleChanged',
  STATUS_CHANGED: 'user.statusChanged',
};

// Để tương thích ngược - sẽ deprecated trong tương lai
export const USER_PATTERNS = USERS_PATTERNS;
export const USER_EVENTS = USERS_EVENTS;