import { UserProps } from "../contracts/user.contract";
import { ChangePassword, ChangeProfileImage, ChangeProfileInfo, CreateGoogleUserProps, CreateLocalUserProps, LinkGoogleAccount } from "../commands/user.commands";

export class User {

    private props: UserProps;

    constructor(props: UserProps) {
        this.props = props
    }

    private ensureNotBlocked(action: string) {
        if (this.props.isBlocked) {
            throw new Error(`Blocked users cannot ${action}`);
        }
    }

    static createLocal(props: CreateLocalUserProps): User {
        return new User({
            _id: props._id,
            username: props.username,
            email: props.email,
            password: props.password,
            isBlocked: false,
            isEmailVerified: false,
            phone: null,
            profileImage: null,
            addressId: null,
            bookingsId: null,
            verificationToken: null,
            googleConnected: false,
            googleId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    static createGoogle(props: CreateGoogleUserProps): User {
        return new User({
            _id: props._id,
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
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    }

    get id(): string {
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

    get addressId(): string | null {
        return this.props.addressId;
    }

    get bookingsId(): string | null {
        return this.props.bookingsId;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    getProps(): Readonly<UserProps> {
        return { ...this.props };
    }

    block() {
        this.props.isBlocked = true;
        this.props.updatedAt = new Date();
    }

    unblock() {
        this.props.isBlocked = false;
        this.props.updatedAt = new Date();
    }

    markEmailVerified() {
        this.props.isEmailVerified = true;
        this.props.updatedAt = new Date();
    }

    updateProfileInfo(props: ChangeProfileInfo) {
        this.ensureNotBlocked("update info");

        if (props.phone !== undefined) {
            this.props.phone = props.phone;
        }

        if (props.username !== undefined) {
            this.props.username = props.username;
        }
        this.props.updatedAt = new Date();
    }

    changePassword(props: ChangePassword) {
        this.ensureNotBlocked("update password");

        if (props.verificationToken) {
            this.props.verificationToken = props.verificationToken;
        }
        this.props.password = props.password;
        this.props.updatedAt = new Date();
    }

    linkGoogleAccount(props: LinkGoogleAccount) {
        this.ensureNotBlocked("update google data");

        this.props.googleId = props.googleId;
        this.props.googleConnected = props.googleConnected;
        this.props.updatedAt = new Date();
    }

    updateProfileImage(props: ChangeProfileImage) {
        this.ensureNotBlocked("update profile image");

        this.props.profileImage = props.profileImage;
        this.props.updatedAt = new Date();
    }

    updateAddressId(addressId: string | null) {
        this.props.addressId = addressId;
    }

    updateBookingsId(bookingsId: string | null) {
        this.props.bookingsId = bookingsId;
    }

}
