import { Schema, model, models, Document, Types } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          // Email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on eventId for faster queries when fetching bookings by event
BookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook to validate that the referenced event exists
 * Prevents orphaned bookings by checking Event existence before saving
 */
BookingSchema.pre('save', async function (next) {
  // Only validate eventId if it's new or modified
  if (this.isNew || this.isModified('eventId')) {
    try {
      // Dynamically import Event model to avoid circular dependency
      const Event = models.Event || (await import('./event.model')).default;

      // Check if event exists
      const eventExists = await Event.exists({ _id: this.eventId });

      if (!eventExists) {
        return next(new Error('Referenced event does not exist'));
      }
    } catch (error) {
      if (error instanceof Error) {
        return next(error);
      }
      return next(new Error('Failed to validate event reference'));
    }
  }

  next();
});

// Use existing model if available (prevents OverwriteModelError in development)
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
