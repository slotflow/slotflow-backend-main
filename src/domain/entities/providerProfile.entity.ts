import { ProviderProfileProps } from "../contracts/providerProfile.contract";
import { AdminVerificationStatus } from "../enums/adminVerificationStatus.enum";
import { CreateProviderProfile, RejectVerification, SubmitIdentityProof, SubmitServiceProof } from "../commands/providerProfile.commands";

export class ProviderProfile {
    private props: ProviderProfileProps;

    constructor(props: ProviderProfileProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

    static createLocal(props: CreateProviderProfile): ProviderProfile {
        return new ProviderProfile({
            _id: "",
            userId: props.userId,
            isAdminVerified: false,
            verificationRejectionReason: null,
            adminVerificationStatus: AdminVerificationStatus.NOT_REQUESTED,
            isAddressVerified: false,
            isServiceDetailsVerified: false,
            isAvailabilityVerified: false,
            isProofsVerified: false,
            serviceId: null,
            serviceAvailabilityId: null,
            subscription: [],
            trustedBySlotflow: false,
            identityProof: null,
            serviceProof: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    get _id(): string {
        return this.props._id;
    }

    get isAdminVerified(): boolean {
        return this.props.isAdminVerified;
    }

    get subscription(): string[] {
        return this.props.subscription;
    }

    get trustedBySlotflow(): boolean {
        return this.props.trustedBySlotflow;
    }

    get adminVerificationStatus(): AdminVerificationStatus {
        return this.props.adminVerificationStatus;
    }

    get verificationRejectionReason(): string | null {
        return this.props.verificationRejectionReason;
    }

    get isAddressVerified(): boolean {
        return this.props.isAddressVerified;
    }

    get isServiceDetailsVerified(): boolean {
        return this.props.isServiceDetailsVerified;
    }

    get isAvailabilityVerified(): boolean {
        return this.props.isAvailabilityVerified;
    }

    get isProofsVerified(): boolean {
        return this.props.isProofsVerified;
    }

    get serviceId(): string | null {
        return this.props.serviceId;
    }

    get serviceAvailabilityId(): string | null {
        return this.props.serviceAvailabilityId;
    }

    get identityProof(): string | null {
        return this.props.identityProof;
    }

    get serviceProof(): string | null {
        return this.props.serviceProof;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    };

    get updatedAt(): Date {
        return this.props.updatedAt;
    };

    // Business Methods

    getProps(): Readonly<ProviderProfileProps> {
        return { ...this.props }
    };

    submitForAdminVerification() {
        this.props.adminVerificationStatus = AdminVerificationStatus.REQUESTED;
        this.props.verificationRejectionReason = null;
        this.touch();
    };

    resubmitForAdminVerification() {
        this.props.adminVerificationStatus = AdminVerificationStatus.RESUBMITTED;
        this.props.verificationRejectionReason = null;
        this.touch();
    };

    approveVerification() {
        if (
            this.props.adminVerificationStatus !== AdminVerificationStatus.REQUESTED &&
            this.props.adminVerificationStatus !== AdminVerificationStatus.RESUBMITTED
        ) {
            throw new Error("Provider has not requested verification");
        };

        this.props.isAdminVerified = true;
        this.props.verificationRejectionReason = null;
        this.props.adminVerificationStatus = AdminVerificationStatus.APPROVED;

        this.props.isAddressVerified = true;
        this.props.isServiceDetailsVerified = true;
        this.props.isAvailabilityVerified = true;
        this.props.isProofsVerified = true;

        this.touch();
    };

    rejectVerification(props: RejectVerification) {
        this.props.isAdminVerified = false;
        this.props.adminVerificationStatus = AdminVerificationStatus.REJECTED;
        this.props.verificationRejectionReason = props.verificationRejectionReason;

        this.props.isAddressVerified = props.isAddressVerified;
        this.props.isServiceDetailsVerified = props.isServiceDetailsVerified;
        this.props.isAvailabilityVerified = props.isAvailabilityVerified;
        this.props.isProofsVerified = props.isProofsVerified;

        this.touch();
    };


    grantTrustBadge() {
        this.props.trustedBySlotflow = true;
        this.touch();
    }

    revokeTrustBadge() {
        this.props.trustedBySlotflow = false;
        this.touch();
    }

    attachService(serviceId: string) {
        this.props.serviceId = serviceId;
        this.touch();
    }

    attachServiceAvailability(serviceAvailabilityId: string) {
        this.props.serviceAvailabilityId = serviceAvailabilityId;
        this.touch();
    }

    submitIdentityProof(props: SubmitIdentityProof) {
        this.props.identityProof = props.identityProof;
        this.touch();
    }

    submitServiceProof(props: SubmitServiceProof) {
        this.props.serviceProof = props.serviceProof;
        this.touch();
    }
}