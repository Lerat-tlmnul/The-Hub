import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Edit3, 
  Save, 
  LogOut, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { UserProfile } from '../types';
import { INTEREST_TAGS } from '../data/profiles';
import { DISCORD_INVITE_URL } from './DiscordHeader';

interface UserProfileViewProps {
  user: UserProfile;
  onUpdate: (updated: Partial<UserProfile>) => void;
  onReset: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdate,
  onReset
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [discordTag, setDiscordTag] = useState(user.discordTag);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(user.interests);
  const [searchOlder, setSearchOlder] = useState(user.searchOlderAllowed);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      if (selectedInterests.length < 8) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const handleSave = () => {
    onUpdate({
      bio: bio.trim(),
      discordTag: discordTag.trim(),
      interests: selectedInterests,
      searchOlderAllowed: searchOlder
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto no-scrollbar p-3">
      <div className="ios-card rounded-2xl p-4 sm:p-5 space-y-4">
        
        {/* User Card Header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left pb-4 border-b border-rose-900/60">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-rose-400 shadow-xl shrink-0">
            <img src={user.photoUrl} alt={user.pseudo} className="w-full h-full object-cover" />
            <div className="absolute top-1 right-1 bg-emerald-500 text-white p-0.5 rounded-full shadow">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <h2 className="text-2xl font-black text-white">{user.pseudo}</h2>
              <span className="text-lg font-bold text-rose-300">{user.age} ans</span>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span className="text-xs bg-rose-900/70 text-rose-300 font-bold px-2.5 py-0.5 rounded-full border border-rose-600/40">
                {user.ageCategory === '13-15' ? 'Hub Juniors (13-15 ans)' : 'Hub Général (16+ ans)'}
              </span>
              <span className="text-xs text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-700/50 font-medium">
                {user.discordTag}
              </span>
            </div>

            <p className="text-[11px] text-emerald-400 flex items-center justify-center sm:justify-start gap-1 font-semibold pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Âge certifié ({user.birthDate}) & Photo sécurisée</span>
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs text-center font-bold">
            Modifications enregistrées avec succès !
          </div>
        )}

        {/* Bio Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
              Description de profil
            </h3>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Modifier</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={280}
              className="w-full p-3 rounded-xl bg-rose-950/70 border border-rose-500/50 text-white text-xs outline-none focus:ring-1 focus:ring-rose-400"
            />
          ) : (
            <p className="text-xs text-rose-100/90 leading-relaxed bg-rose-900/30 p-3 rounded-xl border border-rose-800/40">
              {user.bio}
            </p>
          )}
        </div>

        {/* Discord Tag Section */}
        {isEditing && (
          <div>
            <label className="block text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
              Identifiant Discord
            </label>
            <input
              type="text"
              value={discordTag}
              onChange={(e) => setDiscordTag(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-rose-950/70 border border-rose-500/50 text-white text-xs"
            />
          </div>
        )}

        {/* Interests */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-rose-200 uppercase tracking-wider">
            Centres d'intérêt
          </h3>
          {isEditing ? (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {INTEREST_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    selectedInterests.includes(tag)
                      ? 'bg-rose-500 text-white border-rose-300 font-semibold'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {user.interests.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-400/30 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cross-Age Search Option */}
        {user.ageCategory === '13-15' && (
          <div className="p-3 bg-rose-950/70 border border-rose-700/60 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Rechercher une tranche d'âge plus âgée</span>
              </span>
              <input
                type="checkbox"
                checked={searchOlder}
                onChange={(e) => {
                  setSearchOlder(e.target.checked);
                  if (!isEditing) {
                    onUpdate({ searchOlderAllowed: e.target.checked });
                  }
                }}
                className="rounded text-rose-600 focus:ring-rose-500 border-rose-700 bg-rose-950 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-rose-300/80">
              Permet de voir les profils 16+ avec un filtre de modération automatique strict et surveillance FireBall Guardian.
            </p>
          </div>
        )}

        {/* Edit Action buttons */}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="w-1/2 py-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer</span>
            </button>
          </div>
        )}

        {/* FireBall Secure Protocol Details */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-950 to-rose-900/60 border border-rose-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-extrabold text-white">Sécurité FireBall Secure v2.4</span>
          </div>
          <p className="text-[11px] text-rose-300/80 leading-relaxed">
            Plateforme protégée sans adresse email requise. Tes conversations privées sont chiffrées sur ton appareil avec une clé éphémère.
          </p>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-white font-bold bg-[#5865F2]/40 hover:bg-[#5865F2] px-3 py-1.5 rounded-lg border border-indigo-400/40 transition-colors"
          >
            <span>Rejoindre la communauté sur Discord</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Reset / Logout */}
        <div className="pt-2 text-center">
          <button
            onClick={onReset}
            className="text-xs text-rose-400 hover:text-rose-200 font-semibold flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Réinitialiser mon profil / Changer de compte</span>
          </button>
        </div>

      </div>
    </div>
  );
};
