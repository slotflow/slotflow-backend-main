import { AppointmentStatus } from "../enums/appointmentStatus.enum";
import { BookingProps, OnlineTrack } from "../contracts/booking.contract";
import { CreateBookingProps, statusTrack, UpdateAppointmentProps, UpdateBookingProps } from "../commands/booking.commands";

export class Booking {

    private props: BookingProps;

    constructor(props: BookingProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateBookingProps) {
        return new Booking({
            _id: "",
            appointmentDate: props.appointmentDate,
            appointmentMode: props.appointmentMode,
            appointmentStatus: props.appointmentStatus,
            appointmentTime: props.appointmentTime,
            googleEventId: props.googleEventId,
            paymentId: props.paymentId,
            serviceProviderId: props.serviceProviderId,
            slotId: props.slotId,
            statusTrack: props.statusTrack,
            userId: props.userId,
            videoCallRoomId: props.videoCallRoomId,
            onlineTrack: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    };

    // Getters

    get _id(): string {
        return this.props._id;
    };

    get serviceProviderId(): string {
        return this.props.serviceProviderId;
    };

    get onlineTrack(): OnlineTrack {
        if(!this.props.onlineTrack) {
            throw new Error("Onlinetrack not found");
        };
        return this.props.onlineTrack;
    };

    get appointmentStatus(): AppointmentStatus {
        return this.props.appointmentStatus;
    };

    get statusTrack(): statusTrack[] {
        return this.props.statusTrack;
    };

    get appointmentDate(): Date {
        return this.props.appointmentDate;
    };

    get appointmentMode(): string {
        return this.props.appointmentMode;
    }

    get userId(): string {
        return this.props.userId;
    };

    get providerId(): string {
        return this.props.serviceProviderId;
    };

    get videoCallRoomId(): string {
        if(!this.props.videoCallRoomId) {
            throw new Error("Room id not found");
        };
        return this.props.videoCallRoomId;
    };

    get googleEventId(): string {
        if(!this.props.googleEventId) {
            throw new Error("googleEventId is not found");
        };
        return this.props.googleEventId;
    };

    get paymentId(): string {
        if(!this.props.paymentId) {
            throw new Error("No paymentId found");
        };
        return this.props.paymentId;
    };

    // Business methods

    getProps(): Readonly<BookingProps> {
        return { ...this.props }
    };

    updateBooking(props: UpdateBookingProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    };

    completeAppointment() {
        if (this.props.appointmentStatus === AppointmentStatus.COMPLETED) {
            return;
        }

        this.props.appointmentStatus = AppointmentStatus.COMPLETED;
        this.props.statusTrack.push({
            appointmentStatus: AppointmentStatus.COMPLETED,
            time: new Date(),
        });

        this.touch();
    };

    updateAppointment(props: UpdateAppointmentProps) {
         if (this.props.appointmentStatus === props.appointmentStatus) {
            return;
        }

        this.props.appointmentStatus = props.appointmentStatus;
        this.props.statusTrack.push({
            appointmentStatus: props.appointmentStatus,
            time: new Date(),
        });

        this.touch();
    };

    cancelAppointment() {
        if (this.props.appointmentStatus === AppointmentStatus.CANCELLED) {
            return;
        }

        this.props.appointmentStatus = AppointmentStatus.CANCELLED;
        this.props.statusTrack.push({
            appointmentStatus: AppointmentStatus.CANCELLED,
            time: new Date(),
        });

        this.touch();
    };

};