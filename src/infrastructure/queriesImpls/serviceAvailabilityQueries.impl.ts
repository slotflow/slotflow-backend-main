import { FilterQuery, Types } from "mongoose";
import { daysOfWeek } from "../../shared/utils/constants";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { ServiceAvailabilityModel } from "../models/serviceAvailability.model";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { ServiceAvailabilityDTO, TimeSlotForClientOutput } from "../../application/dtos/common.dto";
import { ServiceAvailabilityQuery, ServiceAvailabilityView } from "../../application/dtos/serviceAvailability.dto";

export class ServiceAvailabilityQueriesImpl implements IServiceAvailabilityQueries {

    async findByProviderId(query: ServiceAvailabilityQuery): Promise<ServiceAvailabilityView> {
        const { date, availabilityId, providerId } = query;
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const targetDay = daysOfWeek[date.getDay()];
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const matchFilter: FilterQuery<ServiceAvailabilityDTO> = {};
        if (availabilityId) matchFilter._id = new Types.ObjectId(availabilityId);
        if (providerId) matchFilter.providerId = new Types.ObjectId(providerId);

        const availability = await ServiceAvailabilityModel.aggregate([
            {
                $match: matchFilter
            },
            {
                $addFields: {
                    availabilityForDay: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: "$availabilities",
                                    as: "availability",
                                    cond: { $eq: ["$$availability.day", targetDay] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    availabilityForDay: {
                        $ifNull: [
                            "$availabilityForDay",
                            {
                                day: targetDay,
                                isAvailable: false,
                                startTime: null,
                                endTime: null,
                                duration: null,
                                modes: [],
                                slots: []
                            }
                        ]
                    }
                }
            },
            {
                $addFields: {
                    "availabilityForDay.isAvailable": {
                        $ifNull: ["$availabilityForDay.isAvailable", false]
                    }
                }
            },
            {
                $lookup: {
                    from: "bookings",
                    let: { providerId: "$providerId", startOfDay: startOfDay, endOfDay: endOfDay },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$serviceProviderId", "$$providerId"] },
                                        { $gte: ["$appointmentDate", "$$startOfDay"] },
                                        { $lte: ["$appointmentDate", "$$endOfDay"] },
                                        {
                                            $or: [
                                                { $in: ["$appointmentStatus", [AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED]] },
                                                {
                                                    $and: [
                                                        { $eq: ["$appointmentStatus", AppointmentStatus.PENDING] },
                                                        { $gte: ["$createdAt", fifteenMinutesAgo] }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                appointmentDate: 1,
                                slotId: 1
                            }
                        }
                    ],
                    as: "providerBookings"
                }
            },
            {
                $addFields: {
                    bookedSlots: {
                        $map: {
                            input: "$providerBookings",
                            as: "booking",
                            in: "$$booking.slotId"
                        }
                    }
                }
            },
            {
                $addFields: {
                    "availabilityForDay.slots": {
                        $map: {
                            input: "$availabilityForDay.slots",
                            as: "slot",
                            in: {
                                $mergeObjects: [
                                    "$$slot",
                                    {
                                        available: {
                                            $not: { $in: ["$$slot._id", "$bookedSlots"] },
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            {
                $replaceWith: "$availabilityForDay"
            },
        ]);
        const data = availability[0];
        if (!data) return null;

        return {
            day: data.day,
            isAvailable: data.isAvailable,
            duration: data.duration,
            endTime: data.endTime,
            modes: data.modes,
            startTime: data.startTime,
            slots: (data.slots || []).map((slot: TimeSlotForClientOutput) => ({
                _id: slot._id.toString(),
                time: slot.time,
                available: slot.available
            }))
        }
    };

};