import { User } from "../../entities/user.entity";

export interface IUserRepository {

  create(user: User): Promise<User>;

  findByEmail(email: string): Promise<User | null>;

  findByGoogleId(googleId: string): Promise<User | null>;

  update(user: User): Promise<User>;

  findById(userId: string): Promise<User | null>;

  count(today?: boolean): Promise<number>;

}
