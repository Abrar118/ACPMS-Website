import { z } from "zod";

// Auth validations
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(20, "Username must be less than 20 characters")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores"
            ),
        email: z.string().email("Please enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                "Password must contain at least one uppercase letter, one lowercase letter, and one number"
            ),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

export const resetPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

// Event registration validations
export const eventRegistrationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    institution: z.string().min(2, "Institution name must be at least 2 characters"),
    level: z.enum(["School", "College", "University"], {
        message: "Please select an education level",
    }),
    class: z.number().min(1).max(24, "Invalid class value"),
    id_at_institution: z.string().min(1, "Student ID is required"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().regex(/^[+]?[\d\s-()]+$/, "Please enter a valid phone number"),
    note: z.string().optional(),
    competitions: z.array(z.string()).min(1, "Please select at least one competition"),
    transaction_id: z.string().optional(),
    payment_provider: z.enum(["BKash"]).optional(),
}).refine((data) => {
    // If any selected competitions have fees, payment info is required
    return true; // We'll validate this dynamically in the component
}, {
    message: "Payment information is required for paid competitions",
});

// Team validations
export const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  institution: z.string().min(2, "Institution name must be at least 2 characters"),
});

export const addTeamMemberSchema = z.object({
  team_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  role: z.enum(["captain", "member"]).default("member"),
});

// Competition result validations
export const createCompetitionResultSchema = z.object({
  competition_id: z.string().uuid(),
  participant_id: z.string().uuid().optional(),
  team_id: z.string().uuid().optional(),
  score: z.number().optional(),
  rank: z.number().int().positive().optional(),
  certificate_url: z.string().url().optional(),
  remarks: z.string().max(200).optional(),
}).refine(
  (data) =>
    (data.participant_id && !data.team_id) ||
    (!data.participant_id && data.team_id),
  { message: "Exactly one of participant_id or team_id must be provided" }
);

// Payment validations
export const createPaymentSchema = z.object({
  participant_id: z.string().uuid(),
  competition_id: z.string().uuid().optional(),
  amount: z.number().positive("Amount must be positive"),
  payment_provider: z.string().optional(),
  transaction_id: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  status: z.enum(["verified", "rejected"]),
});

// Blog post validations
export const createBlogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only"),
  content: z.any().optional(),
  excerpt: z.string().max(300, "Excerpt must be under 300 characters").optional(),
  cover_image: z.string().optional(),
  tags: z.array(z.string()).default([]),
  is_published: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

// Announcement validations
export const createAnnouncementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().min(10, "Body must be at least 10 characters"),
  priority: z.enum(["low", "normal", "urgent"]).default("normal"),
  is_pinned: z.boolean().default(false),
  expires_at: z.string().datetime().optional(),
});

// Gallery validations
export const createGalleryAlbumSchema = z.object({
  title: z.string().min(2, "Album title must be at least 2 characters"),
  description: z.string().optional(),
  event_id: z.string().uuid().optional(),
  cover_image: z.string().optional(),
  is_published: z.boolean().default(false),
  display_order: z.number().int().default(0),
});

export const addGalleryImageSchema = z.object({
  album_id: z.string().uuid(),
  image_url: z.string().url("Must be a valid image URL"),
  caption: z.string().max(200).optional(),
  display_order: z.number().int().default(0),
});

// Contact form validations
export const contactSubmissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Member validations (previously missing)
export const createMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  designation: z.string().min(2, "Designation is required"),
  position: z.string().optional(),
  session: z.string().optional(),
  bio: z.string().optional(),
  image_url: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  facebook_id_link: z.string().url().optional().or(z.literal("")),
  instagram_id_link: z.string().url().optional().or(z.literal("")),
  linkedin_id_link: z.string().url().optional().or(z.literal("")),
  user_id: z.string().uuid().optional(),
});

// Magazine validations (previously missing)
export const createMagazineSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  summary: z.string().optional(),
  volume: z.number().int().positive().optional(),
  issue: z.number().int().positive().optional(),
  pdf_url: z.string().url().optional(),
  cover_image: z.string().optional(),
  published_date: z.string().optional(),
  language: z.string().default("English"),
  doi: z.string().optional(),
  access_level: z.enum(["public", "restricted", "members_only"]).default("public"),
  chief_patron: z.string().optional(),
  tags: z.array(z.string()).default([]),
});
