
export enum EResourceType {
  Pdf = "pdf",
  Video = "video_link",
  Link = "link",
  Document = "document",
}

export enum EResourceCategory {
  "Problem Set" = "problem_set",
  "Video Lecture" = "video_lecture",
  "Reference Material" = "reference_material",
  "Past Paper" = "past_paper",
}

export enum EResourceLevel {
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

export enum EEventType {
  Workshop = "Workshop",
  Seminar = "Seminar",
  Session = "Session",
  Fest = "Fest",
  InterCanttOlympiad = "Inter Cantonment Olympiad",
  Meet = "Meet",
  Other = "Other",
}

export enum EEventMode {
  Online = "Online",
  InPerson = "In Person",
  Hybrid = "Hybrid",
}

export enum ETeamRole {
  Captain = "captain",
  Member = "member",
}

export enum EPaymentStatus {
  Pending = "pending",
  Verified = "verified",
  Rejected = "rejected",
}

export enum EPaymentProvider {
  BKash = "BKash",
}

export enum EAnnouncementPriority {
  Low = "low",
  Normal = "normal",
  Urgent = "urgent",
}

export enum EContactStatus {
  New = "new",
  Read = "read",
  Replied = "replied",
  Archived = "archived",
}

export enum ERegistrationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}
