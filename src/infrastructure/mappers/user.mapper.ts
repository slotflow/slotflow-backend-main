import { Types } from "mongoose";
import { IUser } from "../models/user.model";
import { User } from "../../domain/entities/user.entity";

export class UserMapper {

    static toDomain(doc: IUser): User {
        return new User({
            _id: doc._id.toString(),
            username: doc.username,
            email: doc.email,
            password: doc.password ?? null,
            isBlocked: doc.isBlocked,
            isEmailVerified: doc.isEmailVerified,
            phone: doc.phone ?? null,
            profileImage: doc.profileImage ?? null,
            addressId: doc.addressId ? doc.addressId.toString() : null,
            verificationToken: doc.verificationToken ?? null,
            googleConnected: doc.googleConnected,
            googleId: doc.googleId ?? null,
            stripeConnected: doc.stripeConnected,
            stripeAccountId: doc.stripeAccountId ?? null,
            stripeCustomerId: doc.stripeCustomerId ?? null,
            allowPushNotification: doc.allowPushNotification,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
    }

    static toPersistence(entity: User) {
        const props = entity.getProps();

        return {
            username: props.username,
            email: props.email,
            password: props.password,
            isBlocked: props.isBlocked,
            isEmailVerified: props.isEmailVerified,
            phone: props.phone,
            profileImage: props.profileImage,
            addressId: props.addressId ? new Types.ObjectId(props.addressId) : null,
            verificationToken: props.verificationToken,
            googleConnected: props.googleConnected,
            googleId: props.googleId,
            stripeConnected: props.stripeConnected,
            stripeAccountId: props.stripeAccountId,
            stripeCustomerId: props.stripeCustomerId,
            allowPushNotification: props.allowPushNotification,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
