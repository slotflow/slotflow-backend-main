import { UserProps } from "../contracts/user.contract";
import { ChangePassword, ChangeProfileImage, ChangeProfileInfo, CreateGoogleUserProps, CreateLocalUserProps, LinkGoogleAccount, UpdatePushNotification, UpdateVerificationToken } from "../commands/user.commands";

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
            isBlocked: false,
            isEmailVerified: false,
            phone: null,
            profileImage: null,
            addressId: null,
            bookingsId: null,
            verificationToken: props.verificationToken,
            googleConnected: false,
            googleId: null,
            stripeConnected: false,
            stripeAccountId: null,
            stripeCustomerId: null,
            allowPushNotification: null,
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
            isBlocked: false,
            isEmailVerified: props.isEmailVerified,
            phone: null,
            profileImage: props.profileImage,
            addressId: null,
            bookingsId: null,
            verificationToken: null,
            googleConnected: true,
            googleId: props.googleId,
            stripeConnected: false,
            stripeAccountId: null,
            stripeCustomerId: null,
            allowPushNotification: null,
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

    get phone(): string | null {
        return this.props.phone;
    }

    get profileImage(): string | null {
        return this.props.profileImage;
    }

    get password(): string | null {
        return this.props.password;
    }

    get verificationToken(): string | null {
        return this.props.verificationToken;
    }

    get isEmailVerified(): boolean {
        return this.props.isEmailVerified;
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

    get addressId(): string | null {
        return this.props.addressId;
    }

    get bookingsId(): string | null {
        return this.props.bookingsId;
    }

    get allowPushNotification(): boolean | null {
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

    markEmailVerified() {
        this.props.isEmailVerified = true;
        this.touch();
    }

    updateProfileInfo(props: ChangeProfileInfo) {
        this.ensureNotBlocked("update info");

        if (props.phone !== undefined) {
            this.props.phone = props.phone;
        }

        if (props.username !== undefined) {
            this.props.username = props.username;
        }
        this.touch();
    }

    changePassword(props: ChangePassword) {
        this.ensureNotBlocked("update password");

        if (props.password) {
            this.props.password = props.password;
        }
        this.touch();
    }

    upcateVerificationToken(props: UpdateVerificationToken) {
        this.props.verificationToken = props.verificationToken;
        this.touch();
    }

    updatePushNotification(props: UpdatePushNotification) {
        this.props.allowPushNotification = props.allowPushNotification;
        this.touch();
    }

    linkGoogleAccount(props: LinkGoogleAccount) {
        this.ensureNotBlocked("update google data");

        this.props.googleId = props.googleId;
        this.props.googleConnected = props.googleConnected;
        this.touch();
    }

    updateProfileImage(props: ChangeProfileImage) {
        this.ensureNotBlocked("update profile image");

        this.props.profileImage = props.profileImage;
        this.touch();
    }

    updateAddressId(addressId: string | null) {
        this.props.addressId = addressId;
        this.touch();
    }

    updateBookingsId(bookingsId: string | null) {
        this.props.bookingsId = bookingsId;
        this.touch();
    }

    linkStripeCustomer(stripeCustomerId: string) {
        this.ensureNotBlocked("update stripe customer");

        this.props.stripeCustomerId = stripeCustomerId;
        this.touch();
    }

}
