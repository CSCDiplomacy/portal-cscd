// Auth & User
export interface Delegate {
  id: string;
  name: string;
  email: string;
  applicant_id: string | null;
  status: 'unenrolled' | 'enrolled';
  interview_status: 'not_started' | 'submitted';
  interview_submitted_at?: string;
  interview_token: string;
  hotel_id?: string;
  room?: string;
  booking_ref?: string;
  check_in?: string;
  check_out?: string;
  meals?: string;
}

export interface Session {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

// Event data
export interface RundownEvent {
  id: string;
  date: string;
  time: string;
  type: 'meal' | 'keynote' | 'visit' | 'social' | 'workshop' | 'panel' | 'ceremony';
  title: string;
  description?: string;
  venue?: string;
  speaker?: string;
  duration?: string;
}

export interface Rundown {
  dates: string[];
  events: Record<string, RundownEvent[]>;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  bio?: string;
  photo?: string;
  topic?: string;
}

export interface Visit {
  id: string;
  name: string;
  location?: string;
  time?: string;
  description?: string;
  image?: string;
}

export interface Hotel {
  id: string;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  checkin?: string;
  checkout?: string;
  wifi?: string;
  meals?: string;
  image?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read?: boolean;
}

export interface Favorite {
  delegate_id: string;
  event_id: string;
}

// UI
export type Theme = 'light' | 'dark';
export type Screen = 'dashboard' | 'interview' | 'rundown' | 'visits' | 'speakers' | 'hotel' | 'schedule' | 'contact';

export interface Config {
  supabaseUrl: string;
  supabaseAnonKey: string;
  eventName: string;
}
