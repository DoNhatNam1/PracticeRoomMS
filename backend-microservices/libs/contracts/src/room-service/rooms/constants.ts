export const ROOMS_PATTERNS = {
  FIND_ALL: 'room.findAll',
  FIND_ONE: 'room.findOne',
  CREATE: 'room.create',
  UPDATE: 'room.update', 
  REMOVE: 'room.remove',
  UPDATE_STATUS: 'room.updateStatus',  // Thêm dòng này
  GET_ROOM_ACTIVITY_HISTORY: 'room.activity.history',
  GET_USER_ROOM_ACTIVITIES: 'user.room.activities',
  GET_ROOM_USAGE_STATS: 'room.usage.stats',
  GET_ROOMS_REPORT: 'rooms.report'
};

export const ROOMS_EVENTS = {
  CREATED: 'room.created',
  UPDATED: 'room.updated',
  DELETED: 'room.deleted',
  STATUS_CHANGED: 'room.statusChanged',
  MAINTENANCE_STARTED: 'room.maintenanceStarted',
  MAINTENANCE_ENDED: 'room.maintenanceEnded',
  CAPACITY_CHANGED: 'room.capacityChanged',
  LOCATION_CHANGED: 'room.locationChanged',
  DEACTIVATED: 'room.deactivated',
  ACTIVATED: 'room.activated'
};