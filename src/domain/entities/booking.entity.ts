import { BookingProps } from "../contracts/booking.contract";
import { CreateBookingProps, UpdateBookingProps } from "../commands/booking.commands";

export class Booking {

    private props: BookingProps;

    constructor(props: BookingProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    }

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
    }

    // Getters

    get _id(): string {
        return this.props._id;
    }

    // Business methods

    getProps(): Readonly<BookingProps> {
        return { ...this.props }
    }

    updateBooking(props: UpdateBookingProps) {
        this.props = {
            ...this.props,
            ...props,
        };

        this.touch();
    }
}