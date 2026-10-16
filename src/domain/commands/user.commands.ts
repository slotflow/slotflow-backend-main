import { UserProps } from "../contracts/user.contract";

export type CreateLocalUserProps = Pick<UserProps, "username" | "email" | "timeZone"> &
  Required<Pick<UserProps, "password">> &
  Partial<Pick<UserProps, "referredBy">>;

export type CreateGoogleUserProps = Pick<UserProps, "username" | "email" | "timeZone"> &
  Required<Pick<UserProps, "googleId" | "profileImage" | "referralCode">>;

export type ChangeProfileInfoProps = Partial<Pick<UserProps, "username" | "phone">>;

export type ChangePasswordProps = Required<Pick<UserProps, "password">>;

export type LinkGoogleAccountProps = Pick<UserProps, "googleConnected"> &
  Required<Pick<UserProps, "googleId">>;

export type ChangeProfileImageProps = Pick<UserProps, "profileImage">;

export type ChangeUsernameProps = Pick<UserProps, "username">;

export type ChangeTimeZoneProps = Pick<UserProps, "timeZone">;

export type CompleteProfileSetupProps = Pick<UserProps, "role" | "username" | "referralCode"> &
  Required<Pick<UserProps, "whereDidHearAboutUs">> &
  Partial<Pick<UserProps, "referredBy">>;

export interface TimeZone {
  value: string;
  label: string;
  offset: number;
  abbrev: string;
  altName: string;
}
