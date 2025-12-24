import { AppointmentStatus } from "../enums/appointmentStatus.enum";
import { BookingProps, OnlineTrack } from "../contracts/booking.contract";
import { CreateBookingProps, statusTrack, UpdateBookingProps } from "../commands/booking.commands";

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
            onlineTrack: props.onlineTrack,
            paymentId: props.paymentId,
            serviceProviderId: props.serviceProviderId,
            slotId: props.slotId,
            statusTrack: props.statusTrack,
            userId: props.userId,
            videoCallRoomId: props.videoCallRoomId,
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

    get userId(): string {
        return this.props.userId;
    };

    get providerId(): string {
        return this.props.serviceProviderId;
    };

    get videoCallRoomId(): string {
        if(!this.props.videoCallRoomId) {
            throw new Error("Room id not found");
        }
        return this.props.videoCallRoomId;
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
        if (this.props.appointmentStatus === AppointmentStatus.Completed) {
            return;
        }

        this.props.appointmentStatus = AppointmentStatus.Completed;
        this.props.statusTrack.push({
            appointmentStatus: AppointmentStatus.Completed,
            time: new Date(),
        });

        this.touch();
    }
}