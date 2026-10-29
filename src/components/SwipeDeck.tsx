import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  X, 
  Star, 
  Lock, 
  MessageCircle, 
  ShieldCheck, 
  ShieldAlert, 
  MapPin, 
  Gamepad2, 
  Music, 
  Info, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink,
  Flame,
  Filter,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DatingProfile, UserProfile, AgeCategory } from '../types';
import { DISCORD_INVITE_URL } from './DiscordHeader';

interface SwipeDeckProps {
  user: UserProfile;
  profiles: DatingProfile[];
  onStartChat: (profile: DatingProfile) => void;
  onUpdateUserSettings: (updated: Partial<UserProfile>) => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
  user,
  profiles,
  onStartChat,
  onUpdateUserSettings
}) => {
  // Search older toggle state
  const [allowOlderSearch, setAllowOlderSearch] = useState(user.searchOlderAllowed);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);

  // Deck state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeProfileForModal, setActiveProfileForModal] = useState<DatingProfile | null>(null);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);

  // Drag state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // Filter profiles based on category & cross-age search rule
  const filteredProfiles = profiles.filter((p) => {
    // 13-15 users normally see 13-15 users
    if (user.ageCategory === '13-15') {
      if (allowOlderSearch) {
        return true; // allows viewing older profiles under strict moderation
      }
      return p.ageCategory === '13-15';
    } else {
      // 16+ users see 16+ profiles by default
      return p.ageCategory === '16+';
    }
  });

  const currentProfile = filteredProfiles[currentIndex];

  // Keyboard navigation for desktop PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ignore if input or modal is active
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (activeProfileForModal || matchedProfile) return;

      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'ArrowUp') {
        handleSwipe('up');
      } else if (e.key === ' ' && currentProfile) {
        e.preventDefault();
        setActiveProfileForModal(currentProfile);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentProfile, activeProfileForModal, matchedProfile]);

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!currentProfile) return;

    setSwipeDirection(direction);

    // If right or up, 60% chance of an exciting instant match!
    if (direction === 'right' || direction === 'up') {
      const isMatch = Math.random() > 0.35 || direction === 'up';
      if (isMatch) {
        setTimeout(() => {
          triggerMatchCelebration(currentProfile);
        }, 300);
      }
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDragOffset({ x: 0, y: 0 });
      setSwipeDirection(null);
    }, 280);
  };

  const triggerMatchCelebration = (matched: DatingProfile) => {
    setMatchedProfile(matched);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#ffffff']
    });
  };

  const handleDirectMessage = (profile: DatingProfile) => {
    onStartChat(profile);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  // Toggle searching older age category
  const handleToggleOlderSearch = () => {
    if (!allowOlderSearch) {
      setShowModerationModal(true);
    } else {
      setAllowOlderSearch(false);
      onUpdateUserSettings({ searchOlderAllowed: false });
    }
  };

  const confirmOlderSearch = () => {
    setAllowOlderSearch(true);
    setShowModerationModal(false);
    onUpdateUserSettings({ searchOlderAllowed: true });
    setCurrentIndex(0); // reset deck
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY
    }));
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset.x > 110) {
      handleSwipe('right');
    } else if (dragOffset.x < -110) {
      handleSwipe('left');
    } else if (dragOffset.y < -90) {
      handleSwipe('up');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  // Touch handlers for mobile
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handleTouchEnd = () => {
    if (!touchStart) return;
    if (dragOffset.x > 90) {
      handleSwipe('right');
    } else if (dragOffset.x < -90) {
      handleSwipe('left');
    } else if (dragOffset.y < -80) {
      handleSwipe('up');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
    setTouchStart(null);
  };

  const isCrossAgeMatch = currentProfile && user.ageCategory === '13-15' && currentProfile.ageCategory === '16+';

  return (
    <div className="flex-1 w-full flex flex-col justify-between p-3 select-none overflow-y-auto no-scrollbar">
      
      {/* Category Pill */}
      <div className="w-full flex items-center justify-between text-[11px] pb-1">
        <span className="font-semibold text-rose-300 bg-rose-950/70 border border-rose-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          {user.ageCategory === '13-15' ? '13-15 ans' : '16+ ans'}
        </span>
        {user.ageCategory === '13-15' && (
          <button
            onClick={handleToggleOlderSearch}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
              allowOlderSearch
                ? 'bg-amber-900/40 text-amber-300 border-amber-600/40'
                : 'bg-rose-950 text-rose-400 border-rose-900'
            }`}
          >
            {allowOlderSearch ? 'Filtre 16+ actif' : 'Voir 16+'}
          </button>
        )}
      </div>

      {/* SWIPE CARD CONTAINER */}
      <div className="relative w-full flex-1 min-h-[360px] flex items-center justify-center my-auto">
        {currentProfile ? (
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.075}deg)`,
              transition: isDragging ? 'none' : 'transform 0.25s ease-out',
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-rose-500/30 bg-rose-950/90 touch-none flex flex-col justify-end"
          >
            {/* Background Image */}
            <img
              src={currentProfile.photoUrl}
              alt={currentProfile.pseudo}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
            />

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 pointer-events-none"></div>

            {/* Live Swipe Stamp Badges */}
            {dragOffset.x > 40 && (
              <div className="absolute top-8 left-6 border-3 border-emerald-400 text-emerald-400 font-black text-2xl sm:text-3xl px-4 py-1.5 rounded-xl rotate-[-14deg] shadow-lg bg-emerald-950/40 backdrop-blur-xs z-20 pointer-events-none">
                LIKE ❤️
              </div>
            )}
            {dragOffset.x < -40 && (
              <div className="absolute top-8 right-6 border-3 border-rose-400 text-rose-400 font-black text-2xl sm:text-3xl px-4 py-1.5 rounded-xl rotate-[14deg] shadow-lg bg-rose-950/40 backdrop-blur-xs z-20 pointer-events-none">
                PASSER ❌
              </div>
            )}
            {dragOffset.y < -40 && Math.abs(dragOffset.x) < 40 && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 border-3 border-amber-400 text-amber-300 font-black text-2xl px-5 py-1.5 rounded-xl shadow-lg bg-amber-950/50 backdrop-blur-xs z-20 pointer-events-none">
                SUPER LIKE ⭐
              </div>
            )}

            {/* Top Badges (Verified & Distance) */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
              <span className="flex items-center gap-1 text-[11px] font-bold bg-black/60 backdrop-blur-md text-rose-200 border border-rose-500/40 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Âge vérifié : {currentProfile.age} ans</span>
              </span>

              <span className="flex items-center gap-1 text-[11px] font-medium bg-black/60 backdrop-blur-md text-stone-200 border border-white/20 px-2.5 py-1 rounded-full">
                <MapPin className="w-3 h-3 text-rose-400" />
                <span>~{currentProfile.distanceKm} km</span>
              </span>
            </div>

            {/* Profile Info Overlay at Card Bottom */}
            <div className="relative p-5 z-10 text-white space-y-2 pointer-events-auto">
              
              {/* Pseudo & Age */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <h2 className="text-2xl font-black tracking-tight text-white drop-shadow-md">
                    {currentProfile.pseudo}
                  </h2>
                  <span className="text-xl font-bold text-rose-300 drop-shadow">
                    {currentProfile.age}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProfileForModal(currentProfile);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors cursor-pointer"
                  title="Voir le profil complet"
                >
                  <Info className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Location & Discord Tag preview */}
              <div className="flex items-center gap-2 text-xs text-rose-200/90 font-medium">
                <span>{currentProfile.location}</span>
                <span>•</span>
                <span className="text-[#858df3] font-semibold">{currentProfile.discordTag}</span>
              </div>

              {/* Bio summary */}
              <p className="text-xs text-stone-200/90 line-clamp-2 leading-relaxed">
                {currentProfile.bio}
              </p>

              {/* Interest Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentProfile.interests.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/30 text-rose-200 backdrop-blur-xs"
                  >
                    {tag}
                  </span>
                ))}
                {currentProfile.interests.length > 3 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-stone-300">
                    +{currentProfile.interests.length - 3}
                  </span>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* Empty / First User Page as requested */
          <div className="w-full max-w-sm mx-auto ios-card rounded-3xl p-7 flex flex-col items-center justify-center text-center space-y-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-400/40 flex items-center justify-center text-rose-300 shadow-lg">
                <Flame className="w-9 h-9 text-rose-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                Oups... On dirait que t'es le premier !
              </h3>
              <p className="text-sm font-semibold text-rose-300">
                Reviens demain pour voir si y'a des profils !
              </p>
            </div>

            <p className="text-xs text-rose-300/80 max-w-xs leading-relaxed">
              Ton profil est bien configuré. Invite tes amis depuis le serveur Discord pour commencer à swiper !
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-1">
              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ios-button flex-1 py-3 px-4 rounded-2xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Discord The Hub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopiedDiscord(true);
                  setTimeout(() => setCopiedDiscord(false), 2000);
                }}
                className="ios-button py-3 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-800/80 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedDiscord ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedDiscord ? 'Copié !' : 'Partager'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SWIPE ACTION BUTTONS */}
      {currentProfile && (
        <div className="w-full flex items-center justify-center gap-3 sm:gap-4 mt-5">
          {/* PASS BUTTON (❌) */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-rose-900/60 hover:border-rose-500/50 flex items-center justify-center text-rose-400 hover:text-rose-300 shadow-lg shadow-black/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Passer (Flèche Gauche)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* SUPER LIKE BUTTON (⭐) */}
          <button
            onClick={() => handleSwipe('up')}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-950/40 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Super Like (Flèche Haut)"
          >
            <Star className="w-5 h-5 fill-amber-400" />
          </button>

          {/* DIRECT FIREBALL SECURE MP BUTTON (🔒💬) as requested! */}
          <button
            onClick={() => handleDirectMessage(currentProfile)}
            className="px-3.5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 border border-rose-400/40 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/80 hover:scale-105 active:scale-95 transition-all cursor-pointer fireball-secure-pulse"
            title="Envoyer un MP chiffré FireBall Secure"
          >
            <Lock className="w-3.5 h-3.5 text-rose-200" />
            <span>MP Chiffré</span>
          </button>

          {/* LIKE BUTTON (❤️) */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-600 hover:bg-rose-500 border border-rose-400/40 flex items-center justify-center text-white shadow-xl shadow-rose-900/60 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Liker (Flèche Droite)"
          >
            <Heart className="w-6 h-6 fill-white" />
          </button>
        </div>
      )}

      {/* PC Keyboard hint banner */}
      <div className="hidden sm:flex items-center gap-3 mt-3 text-[11px] text-rose-300/60">
        <span>Touches : ⬅️ Passer</span>
        <span>•</span>
        <span>⬆️ Super Like</span>
        <span>•</span>
        <span>➡️ Liker</span>
        <span>•</span>
        <span>Espace : Détails</span>
      </div>

      {/* FULL PROFILE MODAL / DRAWER */}
      {activeProfileForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-rose-950 border border-rose-500/40 rounded-3xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl relative">
            
            {/* Modal Image Header */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img
                src={activeProfileForModal.photoUrl}
                alt={activeProfileForModal.pseudo}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950 via-transparent to-transparent"></div>

              <button
                onClick={() => setActiveProfileForModal(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-5 right-5 flex items-baseline justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    {activeProfileForModal.pseudo}, {activeProfileForModal.age}
                  </h3>
                  <span className="text-xs text-rose-300 font-medium">
                    {activeProfileForModal.location} • {activeProfileForModal.gender}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              
              {/* Discord Tag with 1-click copy */}
              <div className="p-3 bg-rose-900/40 border border-rose-700/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-300 block">
                    Identifiant Discord
                  </span>
                  <span className="text-sm font-black text-white">
                    {activeProfileForModal.discordTag}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(activeProfileForModal.discordTag)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDiscord ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedDiscord ? 'Copié !' : 'Copier tag'}</span>
                </button>
              </div>

              {/* Bio */}
              <div>
                <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider mb-1">
                  À propos
                </h4>
                <p className="text-rose-100/90 leading-relaxed bg-rose-900/30 p-3 rounded-xl border border-rose-800/40">
                  {activeProfileForModal.bio}
                </p>
              </div>

              {/* Music & Gaming */}
              {(activeProfileForModal.music || activeProfileForModal.favoriteGame) && (
                <div className="grid grid-cols-2 gap-2">
                  {activeProfileForModal.favoriteGame && (
                    <div className="p-3 bg-rose-900/30 border border-rose-800/40 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                        <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Jeu favori</span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        {activeProfileForModal.favoriteGame}
                      </p>
                    </div>
                  )}

                  {activeProfileForModal.music && (
                    <div className="p-3 bg-rose-900/30 border border-rose-800/40 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5 text-rose-300 font-bold text-[11px]">
                        <Music className="w-3.5 h-3.5 text-rose-400" />
                        <span>Ce qu'il écoute</span>
                      </div>
                      <p className="text-white font-semibold text-xs">
                        {activeProfileForModal.music}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Interests */}
              <div>
                <h4 className="text-xs font-bold text-rose-200 uppercase tracking-wider mb-1.5">
                  Centres d'intérêt
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfileForModal.interests.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-200 border border-rose-400/30 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* FireBall Secure Guarantee */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-rose-900/60 to-rose-950 border border-rose-500/40 flex items-center gap-3">
                <Flame className="w-5 h-5 text-rose-400 shrink-0" />
                <div className="text-[11px] text-rose-200">
                  <span className="font-bold text-white block">Sécurité FireBall</span>
                  Échange avec {activeProfileForModal.pseudo} en MP chiffré de bout en bout sans exposer tes coordonnées privées.
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    handleDirectMessage(activeProfileForModal);
                    setActiveProfileForModal(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Envoyer un MP chiffré</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MATCH CELEBRATION MODAL */}
      {matchedProfile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-rose-950 to-[#19060f] border-2 border-rose-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/50 text-rose-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span>C'est un Match !</span>
            </div>

            <h3 className="text-2xl font-black text-white">
              Toi & {matchedProfile.pseudo} vous vous plaisez !
            </h3>

            {/* Matched Avatar Pair */}
            <div className="flex items-center justify-center -space-x-4 py-2">
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-rose-400 shadow-lg relative z-10">
                <img src={user.photoUrl} alt={user.pseudo} className="w-full h-full object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white z-20 shadow">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-rose-400 shadow-lg relative z-10">
                <img src={matchedProfile.photoUrl} alt={matchedProfile.pseudo} className="w-full h-full object-cover" />
              </div>
            </div>

            <p className="text-xs text-rose-300/90 leading-relaxed">
              Ouvre immédiatement un MP chiffré sécurisé par <strong>FireBall Secure</strong> ou retrouve-le sur le Discord officiel !
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onStartChat(matchedProfile);
                  setMatchedProfile(null);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-xl shadow-rose-900/60 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <Lock className="w-4 h-4" />
                <span>Envoyer un MP chiffré</span>
              </button>

              <button
                onClick={() => setMatchedProfile(null)}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold border border-rose-800 cursor-pointer"
              >
                Continuer à swiper
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CROSS-AGE MODERATION CONFIRMATION MODAL */}
      {showModerationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-rose-950 border border-amber-500/60 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-300">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-black text-white">
              Accès à la tranche d'âge supérieure
            </h4>

            <p className="text-xs text-rose-200/90 leading-relaxed text-left">
              Tu as demandé à explorer les profils de personnes plus âgées. 
              Pour garantir la sécurité de tous :
            </p>

            <ul className="text-left text-xs text-amber-200/90 space-y-1.5 list-disc list-inside bg-amber-950/40 p-3 rounded-xl border border-amber-800/40">
              <li>Tout contenu inapproprié ou sollicitation suspecte est bloqué en temps réel.</li>
              <li>Les messages sont vérifiés par les filtres de sécurité FireBall Guardian.</li>
              <li>Le bouton de signalement rapide reste accessible en 1 clic.</li>
            </ul>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowModerationModal(false)}
                className="w-1/2 py-2.5 rounded-xl bg-rose-900/60 text-rose-300 text-xs font-bold border border-rose-800 cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={confirmOlderSearch}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Confirmer l'accès
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
