// import { Types } from "mongoose";
import { User } from "../../entities/user.entity";
// import { ApiPaginationRequest, ApiResponse } from "../../infrastructure/dtos/common.dto";
// import { AdminFetchAllUsers, AdminFetchDashboardUserStatsDataResponse } from "../../infrastructure/dtos/admin.dto";

// export type CreateLocalUser = {
//   username: User["username"];
//   email: User["email"];
//   password: User["password"];
//   verificationToken: User["verificationToken"];
// };

// export type CreateGoogleUser = {
//   username: User["username"];
//   email: User["email"];
//   googleId: User["googleId"];
//   profileImage: User["profileImage"];
//   isEmailVerified: User["isEmailVerified"];
//   googleConnected: User["googleConnected"];
// };

// export type CreateUserProps = CreateLocalUser | CreateGoogleUser;

// export type UpdateUserFileds = Pick<User, "_id"> & Partial<Pick<User, "profileImage">>

export interface IUserRepository {

  // new methods

  // createUser(user: CreateUserProps): Promise<User>;

  // findUserByVerificationToken(verificationToken: string): Promise<User | null>;

  // updateUser(user: User): Promise<User | null>;

  // findUserByEmail(email: string): Promise<User | null>;

  // findAllUsers({ page, limit }: ApiPaginationRequest): Promise<ApiResponse<AdminFetchAllUsers>>;

  // findUserById(userId: Types.ObjectId): Promise<User | null>;
  
  // findUsersStatsData(): Promise<AdminFetchDashboardUserStatsDataResponse>;

  // findUsersCount(today?: { today : boolean }): Promise<number>;

  // findUserByGoogleId(googleId: string): Promise<User | null>;

  // updateUserFields(data: UpdateUserFileds): Promise<User | null>;

  // new methods

  create(user: User): Promise<User>;

  findByVerificationToken(token: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByGoogleId(googleId: string): Promise<User | null>;

  update(user: User): Promise<User | null>;

  findById(userId: string): Promise<User | null>;

  count(today?: boolean): Promise<number>;
}
