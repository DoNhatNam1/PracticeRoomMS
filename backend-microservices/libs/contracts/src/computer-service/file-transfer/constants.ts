/**
 * Message patterns cho file transfer - request/response
 */
export const FILE_TRANSFER_PATTERNS = {
  FIND_ALL: 'fileTransfer.findAll',
  FIND_ONE: 'fileTransfer.findOne',
  CREATE: 'fileTransfer.create',
  UPDATE_STATUS: 'fileTransfer.updateStatus',
  GET_BY_USER: 'fileTransfer.getByUser',
  GET_BY_COMPUTER: 'fileTransfer.getByComputer'
};

/**
 * Event patterns cho file transfer - async events
 */
export const FILE_TRANSFER_EVENTS = {
  CREATED: 'fileTransfer.created',
  STATUS_UPDATED: 'fileTransfer.statusUpdated',
  COMPLETED: 'fileTransfer.completed',
  FAILED: 'fileTransfer.failed'
};