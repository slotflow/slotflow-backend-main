import { Types } from "mongoose";
import { User } from "../entities/user.entity";
import { AdminFetchAllUsers } from "../../infrastructure/dtos/admin.dto";
import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";

export type CreateLocalUser = {
  username: User["username"];
  email: User["email"];
  password: User["password"];
  verificationToken: User["verificationToken"];
};

export type CreateGoogleUser = {
  username: User["username"];
  email: User["email"];
  googleId: User["googleId"];
  profileImage: User["profileImage"];
  isEmailVerified: User["isEmailVerified"];
};

export type CreateUserProps = CreateLocalUser | CreateGoogleUser;

export interface IUserRepository {

  createUser(user: CreateUserProps): Promise<User>;

  verifyUser(verificationToken: string): Promise<User | null>;

  updateUser(user: User): Promise<User | null>;

  findUserByEmail(email: string): Promise<User | null>;

  findAllUsers({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>>;

  findUserById(userId: Types.ObjectId): Promise<User | null>;

  findUserByGoogleId(googleId: string): Promise<User | null>;
}
