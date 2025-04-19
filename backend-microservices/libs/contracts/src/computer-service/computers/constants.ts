export const COMPUTER_PATTERNS = {
  // Computer activities
  ACTIVITY_LOG: 'computer.activity.log',
  GET_COMPUTER_ACTIVITY: 'computer.activity.history',
  GET_FILE_TRANSFER_ACTIVITY: 'computer.file.transfer.activity',
  GET_USER_COMPUTER_ACTIVITIES: 'computer.user.activities',
  GET_COMPUTER_USAGE_STATS: 'computer.usage.stats',
  UPDATE_STATUS: 'computers.updateStatus',
  FIND_BY_ROOM: 'computers.findByRoom',

  // Computer management
  FIND_ALL_COMPUTERS: 'computer.findAll',
  FIND_ONE_COMPUTER: 'computer.findOne',
  CREATE_COMPUTER: 'computer.create',
  UPDATE_COMPUTER: 'computer.update',
  REMOVE_COMPUTER: 'computer.remove',
  
  // Software related
  INSTALL_SOFTWARE: 'computer.software.install',
  UNINSTALL_SOFTWARE: 'computer.software.uninstall',
  GET_INSTALLED_SOFTWARE: 'computer.software.getInstalled',
};

export const COMPUTER_EVENTS = {
  COMPUTER_USED: 'computer.used',
  SOFTWARE_INSTALLED: 'computer.software.installed',
  SOFTWARE_UNINSTALLED: 'computer.software.uninstalled',
  FILE_TRANSFERRED: 'computer.file.transferred',
  LOGIN: 'computer.login',
  LOGOUT: 'computer.logout',
  ERROR: 'computer.error',
  MAINTENANCE_NEEDED: 'computer.maintenance.needed',
  USAGE_STARTED: 'computer.usage.started',
  USAGE_ENDED: 'computer.usage.ended'
};