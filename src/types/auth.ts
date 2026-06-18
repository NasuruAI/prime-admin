export type Role = "customer" | "admin" | "supplier";

export type Profile = {
  phone: string;
  marketing_opt_in: boolean;
  preferred_currency: string;
  email_verified: boolean;
  notify_email: boolean;
  notify_telegram: boolean;
  telegram_chat_id: string;
  telegram_connected: boolean;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  date_joined: string;
  profile: Profile;
};

export type TokenPair = {
  access: string;
  refresh: string;
  user: User;
};
