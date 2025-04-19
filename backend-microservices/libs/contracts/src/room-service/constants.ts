// Main constants file - exports all constants from sub-modules
export * from './rooms/constants';
export * from './room-usage/constants';  // Thay đổi từ usage thành room-usage
export * from './schedules/constants';
export * from './activity/constants';

// Common constants for the service
export const ROOM_SERVICE = 'room-service';