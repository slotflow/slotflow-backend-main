import { CalendarStatus, Role } from "../enums/common.enum";
import { BookingProps } from "../contracts/booking.contract";
import { AppointmentStatus } from "../enums/appointmentStatus.enum";
import { CreateBookingProps, statusTrack, UpdateAppointmentProps, CalendarData, OnlineTrack, CreateCalendarProps, FailedCalendarProps, UpdateBookingAfterPaymentProps } from "../commands/booking.commands";

export class Booking {

    private props: BookingProps;

    constructor(props: BookingProps) {
        this.props = props;
    }

    private touch() {
        this.props.updatedAt = new Date();
    };

    static create(props: CreateBookingProps): Booking {
        return new Booking({
            _id: "",
            appointmentDate: props.appointmentDate,
            appointmentMode: props.appointmentMode,
            appointmentStatus: props.appointmentStatus,
            appointmentTime: props.appointmentTime,
            serviceProviderId: props.serviceProviderId,
            slotId: props.slotId,
            statusTrack: props.statusTrack,
            userId: props.userId,
            videoCallRoomId: props.videoCallRoomId,
            calendarData: null,
            googleEventId: null,
            paymentId: null,
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
        if (!this.props.onlineTrack) {
            this.props.onlineTrack = {
                user: { joined: false, joinedTime: null, leftCallTime: null },
                provider: { joined: false, joinedTime: null, leftCallTime: null }
            };
        } else {
            if (!this.props.onlineTrack.user) {
                this.props.onlineTrack.user = { joined: false, joinedTime: null, leftCallTime: null };
            }
            if (!this.props.onlineTrack.provider) {
                this.props.onlineTrack.provider = { joined: false, joinedTime: null, leftCallTime: null };
            }
        }
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
        if (!this.props.videoCallRoomId) {
            throw new Error("Room id not found");
        };
        return this.props.videoCallRoomId;
    };

    get paymentId(): string {
        if (!this.props.paymentId) {
            throw new Error("No paymentId found");
        };
        return this.props.paymentId;
    };

    get calendarData(): CalendarData {
        if (!this.props.calendarData) {
            throw new Error("Calendar data not found");
        };
        return this.props.calendarData
    };

    get createdAt(): Date {
        return this.props.createdAt;
    };

    // Business methods

    getProps(): Readonly<BookingProps> {
        return { ...this.props };
    };

    updateBookingAfterPayment(props: UpdateBookingAfterPaymentProps) {
        this.props.paymentId = props.paymentId;
        this.props.appointmentStatus = props.appointmentStatus;
        this.props.statusTrack.push({
            appointmentStatus: props.appointmentStatus,
            time: new Date(),
        });
        this.touch();
    };

    completeAppointment() {
        if (this.props.appointmentStatus === AppointmentStatus.COMPLETED) {
            return;
        };

        this.props.appointmentStatus = AppointmentStatus.COMPLETED;
        this.props.statusTrack.push({
            appointmentStatus: AppointmentStatus.COMPLETED,
            time: new Date(),
        });

        this.touch();
    };

    updateAppointmentStatus(props: UpdateAppointmentProps) {
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
        };
        if (this.props.appointmentStatus === AppointmentStatus.COMPLETED) {
            return;
        };

        this.props.appointmentStatus = AppointmentStatus.CANCELLED;
        this.props.statusTrack.push({
            appointmentStatus: AppointmentStatus.CANCELLED,
            time: new Date(),
        });

        this.touch();
    };

    createCalendarDataSuccess(props: CreateCalendarProps) {
        const { role, eventId } = props;
        if (role === Role.PROVIDER) {
            this.props.calendarData = {
                provider: {
                    calendarStatus: CalendarStatus.CREATED,
                    googleEventId: eventId,
                },
                user: this.props.calendarData?.user || null
            };
        }
        if (role === Role.USER) {
            this.props.calendarData = {
                user: {
                    calendarStatus: CalendarStatus.CREATED,
                    googleEventId: eventId,
                },
                provider: this.props.calendarData?.provider || null
            };
        }
        this.touch();
    };

    createCalendarDataFailed(props: FailedCalendarProps) {
        const { role } = props;
        if (!this.props.calendarData) {
            this.props.calendarData = {
                user: null,
                provider: null
            };
        }

        const existing = this.props.calendarData;

        if (role === Role.USER) {
            this.props.calendarData = {
                ...existing,
                user: {
                    googleEventId: existing.user?.googleEventId ?? null,
                    calendarStatus: CalendarStatus.FAILED
                }
            };
        }

        if (role === Role.PROVIDER) {
            this.props.calendarData = {
                ...existing,
                provider: {
                    googleEventId: existing.provider?.googleEventId ?? null,
                    calendarStatus: CalendarStatus.FAILED
                }
            };
        }
        this.touch();
    };

};