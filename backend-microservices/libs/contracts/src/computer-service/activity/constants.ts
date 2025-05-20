export const COMPUTER_ACTIVITY_PATTERNS = {
  GET_COMPUTER_ACTIVITY: 'activity.computer.history',
  GET_FILE_TRANSFER_ACTIVITY: 'activity.fileTransfer.history',
  GET_USER_COMPUTER_ACTIVITIES: 'activity.user.computer.history', // Add this line
  GET_COMPUTER_USAGE_STATS: 'activity.user.computerStats' // Also add this for completeness
};

export const COMPUTER_ACTIVITY_EVENTS = {
  // Computer status events
  STATUS_CHANGED: 'computer.status.changed',
  
  // Computer usage events
  ASSIGNED_TO_USER: 'computer.user.assigned',
  RELEASED_FROM_USER: 'computer.user.released',
  USAGE_STARTED: 'computerUsage.started',
  USAGE_ENDED: 'computerUsage.ended',
  
  // Room events
  ADDED_TO_ROOM: 'computer.room.added',
  REMOVED_FROM_ROOM: 'computer.room.removed',
  
  // Maintenance events
  MAINTENANCE_SCHEDULED: 'computer.maintenance.scheduled',
  MAINTENANCE_COMPLETED: 'computer.maintenance.completed',
  
  // File transfer events
  FILE_TRANSFER_COMPLETED: 'fileTransfer.completed',
  FILE_TRANSFER_FAILED: 'fileTransfer.failed'
};