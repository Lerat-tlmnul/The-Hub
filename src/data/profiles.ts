import { DatingProfile } from '../types';

// Aucun faux profil - les profils proviennent uniquement des vrais utilisateurs inscrits
export const INITIAL_PROFILES: DatingProfile[] = [];

export const AVATAR_PRESETS = [
  {
    id: 'av-1',
    label: 'Aesthetic Rose',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'av-2',
    label: 'Cyber Chill',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'av-3',
    label: 'Pastel Dream',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'av-4',
    label: 'Urban Minimal',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'av-5',
    label: 'Warm Sunset',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'av-6',
    label: 'Dark Gamer',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  }
];

export const INTEREST_TAGS = [
  'Discord', 'Gaming', 'Valorant', 'Genshin Impact', 'League of Legends', 'Minecraft',
  'Anime', 'Manga', 'K-pop', 'Rap FR', 'Électro', 'Lofi', 'Dessin & Art',
  'Photographie', 'Cinéma', 'Lecture', 'Mode', 'Sport', 'Cosplay', 'Tech'
];
