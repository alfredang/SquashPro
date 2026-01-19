export interface Player {
  id: string;
  name: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';
  rating: number; // 0 to 5
  avatar: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Court {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
}

export interface Booking {
  id: string;
  courtId: string;
  playerId: string; // Host ID
  joinedPlayerId?: string; // Guest ID (if someone joins)
  date: string;
  time: string;
  registeredAt: string; // ISO string
  userLocationAtRegistration?: GeoLocation;
  opponentName?: string; // Display name for opponent
  notes?: string;
  status: 'OPEN' | 'CONFIRMED' | 'CANCELLED';
  targetSkillLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro' | 'Any';
}

export interface Review {
  id: string;
  playerId: string; // Who is being reviewed
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}