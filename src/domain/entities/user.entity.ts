import { UserProps } from "../contracts/user.contract";
import { OnboardingStatus, Role } from "../enums/common.enum";
import { ChangePasswordProps, ChangeProfileImageProps, ChangeProfileInfoProps, CreateGoogleUserProps, CreateLocalUserProps, LinkGoogleAccountProps, CompleteProfileSetupProps, TimeZone } from "../commands/user.commands";

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
        const now = new Date();
        return new User({
            _id: "",
            username: null,
            email: props.email,
            password: props.password,
            role: Role.USER,
            onboardingType: null,
            onboardingStatus: OnboardingStatus.NOT_STARTED,
            isBlocked: false,
            whereDidHearAboutUs: null,
            referralCode: null,
            referredBy: null,
            addressId: null,
            profileImage: null,
            phone: null,
            googleConnected: false,
            googleId: null,
            timeZone: props.timeZone,
            createdAt: now,
            updatedAt: now,
        })
    }

    static createGoogle(props: CreateGoogleUserProps): User {
        const now = new Date();
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
            googleId: props.googleId,
            googleConnected: true,
            whereDidHearAboutUs: null,
            referralCode: props.referralCode,
            referredBy: null,
            addressId: null,
            phone: null,
            timeZone: props.timeZone,
            createdAt: now,
            updatedAt: now,
        })
    }

    // Getters

    get _id(): string {
        return this.props._id;
    }

    get username(): string | null {
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

    get addressId(): string | null {
        return this.props.addressId;
    }

    get referralCode(): string | null {
        return this.props.referralCode;
    }

    get referredBy(): string | null {
        return this.props.referredBy;
    }

    get timeZone(): TimeZone | null {
        return this.props.timeZone;
    }

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

    completeProfileSetup(props: CompleteProfileSetupProps) {
        const { role, whereDidHearAboutUs, referredBy } = props;
        if (role === Role.USER) {
            this.props.onboardingType = Role.USER;
            this.props.onboardingStatus = OnboardingStatus.APPROVED;
        } else if (role === Role.PROVIDER) {
            this.props.onboardingType = Role.PROVIDER;
            this.props.onboardingStatus = OnboardingStatus.IN_PROGRESS;
        }
        if(whereDidHearAboutUs) {
            this.props.whereDidHearAboutUs = whereDidHearAboutUs;
        }
        if(referredBy) {
            this.props.referredBy = referredBy;
        }
        this.touch();
    }
    
    approvedByAdmin() {
        this.props.role = Role.PROVIDER;
        this.props.onboardingStatus = OnboardingStatus.APPROVED;
        this.touch();
    }

}
