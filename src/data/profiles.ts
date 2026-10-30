import { DatingProfile } from '../types';

export const INITIAL_PROFILES: DatingProfile[] = [];

// Profils de contact Discord officiels pour tester et échanger des MP chiffrés
export const DISCORD_HUB_MEMBERS: DatingProfile[] = [
  {
    id: 'hub-staff',
    pseudo: 'Staff_TheHub',
    age: 19,
    gender: 'Autre',
    bio: 'Compte officiel de modération et d’accueil The Hub Discord. Tu peux nous envoyer un MP chiffré si tu as une question !',
    photoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    discordTag: 'TheHub#0001',
    location: 'Discord Officiel',
    interests: ['Discord', 'Modération', 'Gaming', 'Tech'],
    ageCategory: '16+',
    verified: true,
    distanceKm: 0,
    onlineStatus: 'online'
  },
  {
    id: 'hub-lina',
    pseudo: 'Lina_K',
    age: 15,
    gender: 'Femme',
    bio: 'Animatrice Discord The Hub 🌸 Fan de Genshin, dessin manga et playlists lofi. Dispo en vocal et MP !',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    discordTag: 'LinaK#4821',
    location: 'Paris (75)',
    interests: ['Genshin Impact', 'Dessin', 'Manga', 'Lofi'],
    ageCategory: '13-15',
    verified: true,
    distanceKm: 8,
    onlineStatus: 'online'
  },
  {
    id: 'hub-thomas',
    pseudo: 'Thomas_Tech',
    age: 20,
    gender: 'Homme',
    bio: 'Membre actif du Discord The Hub 🎧 Passionné de dev, techno et gaming de nuit.',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    discordTag: 'ThomasDev#2048',
    location: 'Lille (59)',
    interests: ['Dev Web', 'Électro', 'League of Legends'],
    ageCategory: '16+',
    verified: true,
    distanceKm: 12,
    onlineStatus: 'online'
  }
];

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
