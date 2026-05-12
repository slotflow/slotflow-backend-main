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
            role: doc.role,
            onboardingType: doc.onboardingType,
            onboardingStatus: doc.onboardingStatus,
            isBlocked: doc.isBlocked,
            phone: doc.phone ?? null,
            profileImage: doc.profileImage ?? null,
            addressId: doc.addressId ? doc.addressId.toString() : null,
            googleConnected: doc.googleConnected,
            googleId: doc.googleId ?? null,
            stripeConnected: doc.stripeConnected,
            stripeAccountId: doc.stripeAccountId ?? null,
            stripeCustomerId: doc.stripeCustomerId ?? null,
            allowPushNotification: doc.allowPushNotification,
            whereDidHearAboutUs: doc.whereDidHearAboutUs,
            referralCode: doc.referralCode ?? null,
            referredBy: doc.referredBy ?? null,
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
            role: props.role,
            onboardingType: props.onboardingType,
            onboardingStatus: props.onboardingStatus,
            phone: props.phone,
            profileImage: props.profileImage,
            addressId: props.addressId ? new Types.ObjectId(props.addressId) : null,
            googleConnected: props.googleConnected,
            googleId: props.googleId,
            stripeConnected: props.stripeConnected,
            stripeAccountId: props.stripeAccountId,
            stripeCustomerId: props.stripeCustomerId,
            allowPushNotification: props.allowPushNotification,
            whereDidHearAboutUs: props.whereDidHearAboutUs,
            referralCode: props.referralCode,
            referredBy: props.referredBy,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
        };
    }
}
