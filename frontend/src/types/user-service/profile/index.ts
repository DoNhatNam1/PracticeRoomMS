export interface UserProfile {
  id: number;
  userId: number;
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  preferences?: Record<string, any>;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileWithUser extends UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface UpdateProfileDto {
  bio?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  department?: string;
  preferences?: Record<string, any>;
}

export interface ProfileStats {
  totalLogins: number;
  averageSessionTime: number;
  lastLoginTime?: string;
  scheduledClasses: number;
  completedClasses: number;
}

export interface ProfileSettings {
  notifications: {
    email: boolean;
    browser: boolean;
    schedule: boolean;
    updates: boolean;
  };
  display: {
    theme: 'light' | 'dark' | 'system';
    compactView: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}