export type CreateLocalUserProps = {
  username: string;
  email: string;
  password: string;
};

export type CreateGoogleUserProps = {
  username: string;
  email: string;
  googleId: string;
  profileImage: string;
  isEmailVerified: boolean;
};

export type ChangeProfileInfo = {
  username?: string;
  phone?: string;
};

export type ChangePassword = {
  password: string;
};

export type UpdateVerificationToken = {
  verificationToken: string;
};

export type LinkGoogleAccount = {
  googleId: string;
  googleConnected: boolean;
};

export type ChangeProfileImage = {
  profileImage: string | null;
};

export type UpdatePushNotification = {
    allowPushNotification: boolean;
};