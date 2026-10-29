export type Gender = 'Femme' | 'Homme' | 'Non-binaire' | 'Autre';

export type AgeCategory = '13-15' | '16+';

export interface UserProfile {
  id: string;
  pseudo: string;
  age: number;
  birthDate: string;
  gender: Gender;
  bio: string;
  photoUrl: string;
  discordTag: string;
  interests: string[];
  ageCategory: AgeCategory;
  verifiedAge: boolean;
  verifiedPhoto: boolean;
  searchOlderAllowed: boolean;
  createdAt: string;
}

export interface DatingProfile {
  id: string;
  pseudo: string;
  age: number;
  gender: Gender;
  bio: string;
  photoUrl: string;
  discordTag: string;
  location: string;
  interests: string[];
  music?: string;
  favoriteGame?: string;
  ageCategory: AgeCategory;
  verified: boolean;
  distanceKm: number;
  onlineStatus?: 'online' | 'idle' | 'offline';
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  cipherText: string;
  timestamp: string;
  encryptedWith: 'FireBall-AES256-GCM';
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participant: DatingProfile;
  lastMessage?: Message;
  unreadCount: number;
  encryptionKeyId: string;
  moderationActive: boolean;
}
