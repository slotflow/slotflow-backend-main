import { ClientSession } from "mongoose";
import { UserModel } from "../models/user.model";
import { UserMapper } from "../mappers/user.mapper";
import { User } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/interfaces/repositories/IUser.repository";

export class UserRepositoryImpl implements IUserRepository {

    async create(user: User, session?: ClientSession): Promise<User | null> {
        const persistence = UserMapper.toPersistence(user);
        const doc = await UserModel.create([persistence], { session });
        return doc && doc.length > 0 ? UserMapper.toDomain(doc[0]) : null;
    };

    async update(user: User, session?: ClientSession): Promise<User | null> {
        const persistence = UserMapper.toPersistence(user);

        const doc = await UserModel.findByIdAndUpdate(
            user._id,
            persistence,
            { new: true, session }
        );

        return doc ? UserMapper.toDomain(doc) : null;
    };

    async findById(userId: string, session?: ClientSession): Promise<User | null> {
        const query = UserModel.findById(userId);
        if (session) {
            query.session(session);
        }
        const doc = await query;
        return doc ? UserMapper.toDomain(doc) : null;
    };

    async findByEmail(email: string): Promise<User | null> {
        const doc = await UserModel.findOne({ email });
        return doc ? UserMapper.toDomain(doc) : null;
    };

    async findByGoogleId(googleId: string): Promise<User | null> {
        const doc = await UserModel.findOne({ googleId });
        return doc ? UserMapper.toDomain(doc) : null;
    };

    async count(today?: boolean): Promise<number> {
        if (!today) {
            return UserModel.countDocuments();
        }

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        return UserModel.countDocuments({
            createdAt: { $gte: start, $lte: end },
        });
    };

    async findByReferralCode(referralCode: string): Promise<User | null> {
        const doc = await UserModel.findOne({ referralCode });
        return doc ? UserMapper.toDomain(doc) : null;
    }

};
