export const SCHEDULES_PATTERNS = {
  FIND_ALL: 'schedules.findAll',
  FIND_ONE: 'schedules.findOne',
  CREATE: 'schedules.create',
  UPDATE: 'schedules.update',
  UPDATE_STATUS: 'schedules.updateStatus',
  APPROVE: 'schedules.approve',
  REJECT: 'schedules.reject',
  CANCEL: 'schedules.cancel',
  CHECK_CONFLICTS: 'schedules.checkConflicts',
  GET_ROOM_SCHEDULES: 'schedules.getRoomSchedules',
  GET_ACTIVITY_HISTORY: 'schedule.activity.history'
};

export const SCHEDULES_EVENTS = {
  SCHEDULED: 'room.scheduled',
  UPDATED: 'room.schedule.updated',
  STATUS_UPDATED: 'room.schedule.status.updated',
  ROOM_RESERVED: 'room.reserved',
  ROOM_RELEASED: 'room.released'
};