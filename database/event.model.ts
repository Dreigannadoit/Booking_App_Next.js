import { Schema, model, models, Document } from 'mongoose';

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      trim: true,
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Tags are required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create unique index on slug for faster lookups and enforce uniqueness
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook to generate slug and normalize date/time
 * Runs before each save operation
 */
EventSchema.pre('save', function (next) {
  // Generate slug only if title is modified or document is new
  if (this.isModified('title')) {
    this.slug = generateSlug(this.title);
  }

  // Normalize and validate date to ISO format if modified
  if (this.isModified('date')) {
    try {
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format');
      }
      // Store date in ISO format (YYYY-MM-DD)
      this.date = parsedDate.toISOString().split('T')[0];
    } catch (error) {
      return next(new Error('Date must be a valid date string'));
    }
  }

  // Normalize time to consistent 24-hour format (HH:MM) if modified
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
    if (!this.time) {
      return next(new Error('Time must be in valid format (e.g., HH:MM or h:mm AM/PM)'));
    }
  }

  next();
});

/**
 * Generate URL-friendly slug from title
 * Converts to lowercase, replaces spaces with hyphens, removes special characters
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalize time to 24-hour format (HH:MM)
 * Accepts formats like "14:30", "2:30 PM", "02:30"
 */
function normalizeTime(time: string): string {
  const trimmedTime = time.trim();

  // Check for AM/PM format
  const ampmRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const ampmMatch = trimmedTime.match(ampmRegex);

  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Check for 24-hour format
  const time24Regex = /^(\d{1,2}):(\d{2})$/;
  const time24Match = trimmedTime.match(time24Regex);

  if (time24Match) {
    const hours = parseInt(time24Match[1], 10);
    const minutes = parseInt(time24Match[2], 10);

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return `${hours.toString().padStart(2, '0')}:${time24Match[2]}`;
    }
  }

  // Return empty string if format is invalid
  return '';
}

// Use existing model if available (prevents OverwriteModelError in development)
const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
