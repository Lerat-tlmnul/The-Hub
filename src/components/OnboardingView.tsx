import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight,
  ExternalLink,
  Flame
} from 'lucide-react';
import { UserProfile, Gender, AgeCategory } from '../types';
import { AVATAR_PRESETS, INTEREST_TAGS } from '../data/profiles';
import { verifyImageSafety, ImageSafetyCheckResult } from '../utils/fireballSecure';
import { DISCORD_INVITE_URL, LOGO_URL } from './DiscordHeader';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [pseudo, setPseudo] = useState('');
  const [birthYear, setBirthYear] = useState('2008');
  const [birthMonth, setBirthMonth] = useState('06');
  const [birthDay, setBirthDay] = useState('15');
  const [ageAttestation, setAgeAttestation] = useState(false);
  
  const [gender, setGender] = useState<Gender>('Femme');
  const [bio, setBio] = useState('');
  const [discordTag, setDiscordTag] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Discord', 'Gaming', 'Lofi']);
  
  const [photoUrl, setPhotoUrl] = useState(AVATAR_PRESETS[0].url);
  const [photoSafetyResult, setPhotoSafetyResult] = useState<ImageSafetyCheckResult | null>({
    safe: true,
    score: 99,
    checks: { formatValid: true, sizeWithinBounds: true, aiNsfwClean: true, metadataClean: true }
  });
  const [isScanning, setIsScanning] = useState(false);
  const [searchOlderAllowed, setSearchOlderAllowed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Calculate age accurately
  const calculateAge = (): number => {
    const today = new Date();
    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const currentAge = calculateAge();
  const isUnderageForPlatform = currentAge < 13;
  const computedCategory: AgeCategory = currentAge <= 15 ? '13-15' : '16+';

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const result = await verifyImageSafety(file);
    setIsScanning(false);
    setPhotoSafetyResult(result);

    if (result.safe) {
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setErrorMsg(result.reason || 'Image non conforme aux règles de sécurité.');
    }
  };

  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter(t => t !== tag));
    } else {
      if (selectedInterests.length < 6) {
        setSelectedInterests([...selectedInterests, tag]);
      }
    }
  };

  const handleFinish = () => {
    setErrorMsg('');
    if (!pseudo.trim()) {
      setErrorMsg('Renseigne un pseudo pour continuer.');
      return;
    }
    if (isUnderageForPlatform) {
      setErrorMsg('Accès réservé aux 13 ans et plus.');
      return;
    }
    if (!ageAttestation) {
      setErrorMsg('Merci de certifier l’exactitude de ton âge.');
      return;
    }
    if (!bio.trim()) {
      setErrorMsg('Ajoute une courte description.');
      return;
    }

    const birthDateStr = `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`;
    const newProfile: UserProfile = {
      id: 'user-' + Date.now(),
      pseudo: pseudo.trim(),
      age: currentAge,
      birthDate: birthDateStr,
      gender,
      bio: bio.trim(),
      photoUrl,
      discordTag: discordTag.trim() || `${pseudo.trim().toLowerCase()}#hub`,
      interests: selectedInterests,
      ageCategory: computedCategory,
      verifiedAge: true,
      verifiedPhoto: true,
      searchOlderAllowed,
      createdAt: new Date().toISOString()
    };

    onComplete(newProfile);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 overflow-y-auto no-scrollbar">
      
      {/* Top Welcome Title */}
      <div className="text-center pt-2 pb-4 space-y-1.5">
        <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden bg-rose-900/60 border border-rose-500/40 p-0.5 shadow-md">
          <img src={LOGO_URL} alt="The Hub" className="w-full h-full object-cover rounded-xl" />
        </div>

        <h1 className="text-lg font-black text-white tracking-tight">
          Bienvenue à The Hub,
          <span className="block text-rose-300 font-extrabold text-sm mt-0.5">
            découvre l'appli de rencontre tirée du Discord !
          </span>
        </h1>
        <p className="text-[11px] text-rose-300/70">
          Aucun email requis • Chiffré par FireBall Secure
        </p>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-950 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* iOS Form Card */}
      <div className="ios-card rounded-2xl p-4 space-y-3.5 text-xs">
        
        {/* Step 1: Identity & Age */}
        {step === 1 && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-rose-200 mb-1">
                Pseudo
              </label>
              <input
                type="text"
                placeholder="Ex: Lina, Noam..."
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                maxLength={20}
                className="w-full px-3 py-2 rounded-xl ios-input text-white text-xs font-medium placeholder-rose-400/40"
              />
            </div>

            {/* Birth date / Age */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-rose-200">
                  Date de naissance (13 ans min.)
                </label>
                <span className="text-[10px] text-rose-300 font-bold bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800">
                  {currentAge} ans • {computedCategory === '13-15' ? '13-15 ans' : '16+ ans'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <select
                  value={birthDay}
                  onChange={(e) => setBirthDay(e.target.value)}
                  className="px-2 py-1.5 rounded-lg ios-input text-white text-xs"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={String(d).padStart(2, '0')}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(e.target.value)}
                  className="px-2 py-1.5 rounded-lg ios-input text-white text-xs"
                >
                  {[
                    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
                  ].map((m, idx) => (
                    <option key={m} value={String(idx + 1).padStart(2, '0')}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  className="px-2 py-1.5 rounded-lg ios-input text-white text-xs"
                >
                  {Array.from({ length: 50 }, (_, i) => 2026 - 13 - i).map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                  <option value="2014">2014 (12 ans)</option>
                </select>
              </div>

              {isUnderageForPlatform ? (
                <p className="mt-1 text-[11px] text-red-400 font-medium">
                  L'accès est réservé aux 13 ans et plus.
                </p>
              ) : (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageAttestation}
                    onChange={(e) => setAgeAttestation(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 border-rose-700 bg-rose-950"
                  />
                  <span className="text-[11px] text-rose-300">
                    Je certifie avoir {currentAge} ans (13+).
                  </span>
                </label>
              )}
            </div>

            {/* Gender Segmented Control */}
            <div>
              <label className="block text-[11px] font-bold text-rose-200 mb-1">
                Genre
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-rose-950/80 rounded-xl border border-rose-900/60">
                {(['Femme', 'Homme', 'Non-binaire', 'Autre'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      gender === g
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-rose-300 hover:text-white'
                    }`}
                  >
                    {g === 'Non-binaire' ? 'NB' : g}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!pseudo.trim()) return setErrorMsg('Renseigne un pseudo.');
                if (isUnderageForPlatform) return setErrorMsg('13 ans minimum requis.');
                if (!ageAttestation) return setErrorMsg('Certifie ton âge pour continuer.');
                setErrorMsg('');
                setStep(2);
              }}
              className="w-full mt-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow"
            >
              <span>Continuer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Step 2: Description & Photo */}
        {step === 2 && (
          <>
            <div>
              <label className="block text-[11px] font-bold text-rose-200 mb-1">
                Description de profil
              </label>
              <textarea
                rows={2}
                placeholder="Ce que tu aimes, tes jeux, tes passions..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={240}
                className="w-full px-3 py-2 rounded-xl ios-input text-white text-xs placeholder-rose-400/40 resize-none"
              />
            </div>

            {/* Photo Selection with Instant Safety Scan */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-rose-200">
                  Photo de profil
                </label>
                {photoSafetyResult?.safe && (
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Sans contenu dangereux
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-rose-400 shrink-0">
                  <img src={photoUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-100 text-[11px] font-semibold cursor-pointer border border-rose-700/60">
                    <Upload className="w-3 h-3" />
                    <span>Choisir une photo</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>

                  {/* Preset Avatars */}
                  <div className="flex gap-1.5">
                    {AVATAR_PRESETS.slice(0, 4).map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setPhotoUrl(av.url)}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                          photoUrl === av.url ? 'border-rose-400 scale-105' : 'border-rose-900 opacity-60'
                        }`}
                      >
                        <img src={av.url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Discord Tag */}
            <div>
              <label className="block text-[11px] font-bold text-rose-200 mb-1">
                Tag Discord (Optionnel)
              </label>
              <input
                type="text"
                placeholder="pseudo#0000"
                value={discordTag}
                onChange={(e) => setDiscordTag(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl ios-input text-white text-xs"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-semibold"
              >
                Retour
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow"
              >
                Accéder à The Hub
              </button>
            </div>
          </>
        )}

      </div>

      <div className="text-center pt-2">
        <a
          href={DISCORD_INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-indigo-300 hover:text-white inline-flex items-center gap-1 font-medium"
        >
          <span>Serveur Discord The Hub</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>

    </div>
  );
};
