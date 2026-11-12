export const SESSION_IDENTITY_FIELDS = [
  "first_name",
  "last_name",
  "email",
  "title",
  "location",
  "description",
  {
    avatar: ["id", "type", "width", "height"],
  },
  "last_access",
] as const
