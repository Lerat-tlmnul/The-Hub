import React, { useState } from 'react';
import { ExternalLink, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface DiscordHeaderProps {
  user: UserProfile | null;
}

export const DISCORD_INVITE_URL = 'https://discord.gg/pxv347ftZ';
export const LOGO_URL = 'https://scontent.xx.fbcdn.net/v/t39.105495-1/876136747_1417331710551451_1647812395478615014_n.webp?_nc_ht=scontent.xx.fbcdn.net&_nc_cat=107&_nc_ohc=tiy1hKXubQgQ7kNvwGC1d9J&sdl=0&ccb=14-4&oh=00_AQSfumzeYIAKBd5WAwrhJSKAG_LsuUvGB92sX-Yaf6PmOg&oe=6AE97C47&_nc_sid=a21977';

export const DiscordHeader: React.FC<DiscordHeaderProps> = ({ user }) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="w-full flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-rose-900 border border-rose-400/40 flex items-center justify-center shrink-0 shadow-sm">
          {!logoError ? (
            <img 
              src={LOGO_URL} 
              alt="The Hub" 
              onError={() => setLogoError(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-[10px] font-black text-white">HUB</span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-extrabold text-sm tracking-tight text-white">
            THE HUB
          </span>
          <span className="text-[9px] font-semibold text-rose-300/80 bg-rose-950/60 border border-rose-800/40 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
            <Lock className="w-2.5 h-2.5 text-rose-400 inline" />
            FireBall Secure
          </span>
        </div>
      </div>

      {/* Discord Quick Action */}
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="ios-button flex items-center gap-1.5 bg-[#5865F2] hover:bg-[#4752c4] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm"
      >
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
        <span>Discord</span>
        <ExternalLink className="w-3 h-3 opacity-80" />
      </a>
    </div>
  );
};
