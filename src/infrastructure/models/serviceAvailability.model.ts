import mongoose, { Document, Schema, Types } from "mongoose";
import { ServiceMode } from "../../domain/enums/service.enum";
import { defaultTimezone } from "../../shared/utils/constants/constant";
import { Availability } from "../../domain/commands/serviceAvailability.commands";

export interface IServiceAvailability extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  timeZone: string;
  availabilities: Availability[];
  createdAt: Date;
  updatedAt: Date;
};

const slotSchema = new Schema({
  time: { type: String, required: true }
}, { _id: true });

const availabilitySchema = new Schema({
  day: { type: String, required: true },
  isAvailable: { type: Boolean, required: true },
  duration: {
    type: Number,
    required: function () {
      return this.isAvailable;
    }
  },
  startTime: {
    type: String,
    required: function () {
      return this.isAvailable;
    }
  },
  endTime: {
    type: String,
    required: function () {
      return this.isAvailable;
    }
  },
  modes: {
    type: [String],
    enum: Object.values(ServiceMode),
    required: function () {
      return this.isAvailable;
    }
  },
  slots: {
    type: [slotSchema],
    required: function () {
      return this.isAvailable;
    }
  }
}, { _id: true });


const serviceAvailabilitySchema = new Schema<IServiceAvailability>({
  providerId: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
  timeZone: { type: String, required: true, default: defaultTimezone },
  availabilities: [availabilitySchema]
},
  {
    timestamps: true,
  }
);

export const ServiceAvailabilityModel = mongoose.model<IServiceAvailability>('ServiceAvailability', serviceAvailabilitySchema)