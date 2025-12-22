import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    providerId: Types.ObjectId;
    bookingId: Types.ObjectId;
    reviewText: string;
    rating: number;
    reported: boolean;
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
};

const ReviewSchema: Schema<IReview> = new Schema<IReview>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "UserId is required"],
        },
        providerId: {
            type: Schema.Types.ObjectId,
            ref: "Provider",
            required: [true, "ProviderId is required"],
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: [true, "BookingId is required"],
        },
        reviewText: {
            type: String,
            required: [true, "Review text is required"],
            trim: true,
            minlength: [5, "Review text must be at least 5 characters long"],
            maxlength: [1000, "Review text must not exceed 1000 characters"],
            validate: {
                validator: function (value: string) {
                    return /^[a-zA-Z0-9 .,!?'"()-]{5,1000}$/.test(value.trim());
                },
                message: "Review text contains invalid characters.",
            },
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
            validate: {
                validator: function (value: number) {
                    return Number.isInteger(value);
                },
                message: "Rating must be an integer.",
            },
        },
        reported: {
            type: Boolean,
            default: false,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
    });

export const ReviewModel: Model<IReview> = mongoose.model<IReview>("Review", ReviewSchema);
