import { ClientSession } from "mongoose";
import { User } from "../../entities/user.entity";

export interface IUserRepository {

  create(user: User, session?: ClientSession): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByGoogleId(googleId: string): Promise<User | null>;

  update(user: User, session?: ClientSession): Promise<User | null>;

  findById(userId: string, session?: ClientSession): Promise<User | null>;

  count(today?: boolean): Promise<number>;

  findByReferralCode(referralCode: string): Promise<User | null>;

}
