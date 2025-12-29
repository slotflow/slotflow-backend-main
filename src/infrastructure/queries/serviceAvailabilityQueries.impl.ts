import { Types } from "mongoose";
import { IServiceAvailabilityQueries } from "../../application/queries/IServiceAvailability.queries";
import { ServiceAvailabilityModel } from "../database/serviceAvailability/serviceAvailability.model";
import { FontendAvailabilityForResponse, TimeSlotForFrontendResponse } from "../../application/dtos/common.dto";

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export class ServiceAvailabilityQueriesImpl implements IServiceAvailabilityQueries {

    async findByProviderId(date: Date, availabilityId: string): Promise<FontendAvailabilityForResponse | null> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const targetDay = daysOfWeek[date.getDay()];
        console.log("targetDay : ", targetDay);

        const availability = await ServiceAvailabilityModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(availabilityId)
                }
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
                            { day: targetDay, slots: [] }
                        ]
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
            duration: data.duration,
            endTime: data.endTime,
            modes: data.modes,
            startTime: data.startTime,
            slots: data.slots.map((slot: TimeSlotForFrontendResponse) => ({
                _id: slot._id.toString(),
                time: slot.time,
                available: slot.available,
            }))
        }
    };

};