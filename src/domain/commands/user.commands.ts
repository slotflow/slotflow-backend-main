import { HearAboutUsOptionValue, Role } from "../enums/common.enum";

export type CreateLocalUserProps = {
  username: string;
  email: string;
  password: string;
  referralCode: string;
};

export type CreateGoogleUserProps = {
  username: string;
  email: string;
  googleId: string;
  profileImage: string;
  referralCode: string;
};

export type ChangeProfileInfoProps = {
  username?: string;
  phone?: string;
};

export type ChangePasswordProps = {
  password: string;
};

export type LinkGoogleAccountProps = {
  googleId: string;
  googleConnected: boolean;
};

export type ChangeProfileImageProps = {
  profileImage?: string;
};

export type UpdatePushNotificationProps = {
  allowPushNotification: boolean;
};

export type CompletePreBoardingProps = {
  role: Role;
  whereDidHearAboutUs: HearAboutUsOptionValue;
  referralCode?: string;
};