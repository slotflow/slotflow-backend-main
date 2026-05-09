import { OnboardingStatus, Role } from "../enums/common.enum";
import { UserProps } from "../contracts/user.contract";
import { ChangePasswordProps, ChangeProfileImageProps, ChangeProfileInfoProps, CreateGoogleUserProps, CreateLocalUserProps, LinkGoogleAccountProps, UpdatePushNotificationProps, CompletePreBoardingProps } from "../commands/user.commands";

export class User {

    private props: UserProps;

    constructor(props: UserProps) {
        this.props = props
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    private ensureNotBlocked(action: string) {
        if (this.props.isBlocked) {
            throw new Error(`Blocked users cannot ${action}`);
        }
    }

    static createLocal(props: CreateLocalUserProps): User {
        return new User({
            _id: "",
            username: props.username,
            email: props.email,
            password: props.password,
            role: Role.USER,
            onboardingType: null,
            onboardingStatus: OnboardingStatus.NOT_STARTED,
            isBlocked: false,
            googleConnected: false,
            stripeConnected: false,
            allowPushNotification: false,
            whereDidHearAboutUs: null,
            referralCode: props.referralCode,
            addressId: null,
            googleId: null,
            phone: null,
            profileImage: null,
            stripeAccountId: null,
            stripeCustomerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    static createGoogle(props: CreateGoogleUserProps): User {
        return new User({
            _id: "",
            username: props.username,
            email: props.email,
            password: null,
            role: Role.USER,
            onboardingType: null,
            onboardingStatus: OnboardingStatus.NOT_STARTED,
            isBlocked: false,
            profileImage: props.profileImage,
            googleConnected: true,
            googleId: props.googleId,
            stripeConnected: false,
            allowPushNotification: false,
            whereDidHearAboutUs: null,
            referralCode: props.referralCode,
            addressId: null,
            phone: null,
            stripeAccountId: null,
            stripeCustomerId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    }

    get username(): string {
        return this.props.username;
    }

    get email(): string {
        return this.props.email;
    }

    get role(): Role {
        return this.props.role;
    }

    get onboardingType(): Role | null {
        return this.props.onboardingType;
    }

    get onboardingStatus(): OnboardingStatus {
        return this.props.onboardingStatus;
    }

    get phone(): string | null {
        return this.props.phone;
    }

    get profileImage(): string | null {
        return this.props.profileImage;
    }

    get password(): string | null {
        return this.props.password;
    }

    get isBlocked(): boolean {
        return this.props.isBlocked;
    }

    get googleConnected(): boolean {
        return this.props.googleConnected;
    }

    get googleId(): string | null {
        return this.props.googleId;
    }

    get stripeConnected(): boolean {
        return this.props.stripeConnected;
    }

    get stripeAccountId(): string | null {
        return this.props.stripeAccountId;
    }

    get stripeCustomerId(): string | null {
        return this.props.stripeCustomerId;
    }

    get addressId(): string | null {
        return this.props.addressId;
    }

    get allowPushNotification(): boolean {
        return this.props.allowPushNotification;
    };

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    // Business Methods

    getProps(): Readonly<UserProps> {
        return { ...this.props };
    }

    block() {
        this.props.isBlocked = true;
        this.touch();
    }

    unblock() {
        this.props.isBlocked = false;
        this.touch();
    }

    updateProfileInfo(props: ChangeProfileInfoProps) {
        this.ensureNotBlocked("update info");

        if (props.phone !== undefined) {
            this.props.phone = props.phone;
        }

        if (props.username !== undefined) {
            this.props.username = props.username;
        }
        this.touch();
    }

    changePassword(props: ChangePasswordProps) {
        this.ensureNotBlocked("update password");

        if (props.password) {
            this.props.password = props.password;
        }
        this.touch();
    }

    updatePushNotification(props: UpdatePushNotificationProps) {
        this.props.allowPushNotification = props.allowPushNotification;
        this.touch();
    }

    linkGoogleAccount(props: LinkGoogleAccountProps) {
        this.ensureNotBlocked("update google data");

        this.props.googleId = props.googleId;
        this.props.googleConnected = props.googleConnected;
        this.touch();
    }

    updateProfileImage(props: ChangeProfileImageProps) {
        this.ensureNotBlocked("update profile image");
        if(props.profileImage === undefined) {
            throw new Error("Profile image is required");
        }
        this.props.profileImage = props.profileImage;
        this.touch();
    }

    attachAddress(addressId: string) {
        this.props.addressId = addressId;
        this.touch();
    }

    linkStripeAccount(stripeAccountId: string) {
        this.ensureNotBlocked("update stripe account");

        this.props.stripeAccountId = stripeAccountId;
        this.props.stripeConnected = true;
        this.touch();
    }

    linkStripeCustomer(stripeCustomerId: string) {
        this.ensureNotBlocked("update stripe customer");

        this.props.stripeCustomerId = stripeCustomerId;
        this.touch();
    }

    completePreBoarding(props: CompletePreBoardingProps) {
        const { role } = props;
        if (role === Role.USER) {
            this.props.onboardingType = Role.USER;
            this.props.onboardingStatus = OnboardingStatus.APPROVED;
        } else if (role === Role.PROVIDER) {
            this.props.onboardingType = Role.PROVIDER;
            this.props.onboardingStatus = OnboardingStatus.IN_PROGRESS;
        }
        if(props.whereDidHearAboutUs) {
            this.props.whereDidHearAboutUs = props.whereDidHearAboutUs;
        }
        if(props.referralCode) {
            this.props.referralCode = props.referralCode;
        }
        this.touch();
    }
    
    approvedByAdmin() {
        this.props.role = Role.PROVIDER;
        this.props.onboardingStatus = OnboardingStatus.APPROVED;
        this.touch();
    }

}
