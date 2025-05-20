export const ROOMS_PATTERNS = {
  FIND_ALL_DASHBOARD: 'room.find-all-rooms-dashboard',
  FIND_ALL_CLIENT: 'room.find-all-rooms-client',
  FIND_ONE: 'room.findOne',
  CREATE: 'room.create',
  UPDATE: 'room.update', 
  REMOVE: 'room.remove',
  UPDATE_STATUS: 'room.updateStatus',  // Thêm dòng này
  GET_ROOM_ACTIVITY_HISTORY: 'room.activity.history',
  GET_USER_ROOM_ACTIVITIES: 'user.room.activities',
  GET_ROOM_USAGE_STATS: 'room.usage.stats',
  FIND_ONE_PUBLIC: 'room.findOnePublic',
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