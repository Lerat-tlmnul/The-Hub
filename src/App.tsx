import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MessageCircle, 
  User, 
  Lock,
  ExternalLink
} from 'lucide-react';
import { UserProfile, DatingProfile, Conversation, Message } from './types';
import { INITIAL_PROFILES } from './data/profiles';
import { DiscordHeader } from './components/DiscordHeader';
import { OnboardingView } from './components/OnboardingView';
import { SwipeDeck } from './components/SwipeDeck';
import { FireBallSecureChat } from './components/FireBallSecureChat';
import { UserProfileView } from './components/UserProfileView';
import { generateKeyId, encryptFireBall } from './utils/fireballSecure';

const STORAGE_USER_KEY = 'thehub_user_profile_v1';
const STORAGE_CONVS_KEY = 'thehub_conversations_v1';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'swipe' | 'chat' | 'profile'>('swipe');
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONVS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_CONVS_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setUser(newProfile);
    setActiveTab('swipe');
  };

  const handleStartChat = (profile: DatingProfile) => {
    let conv = conversations.find((c) => c.participant.id === profile.id);
    
    if (!conv) {
      const newKeyId = generateKeyId();
      conv = {
        id: 'conv-' + profile.id,
        participant: profile,
        unreadCount: 0,
        encryptionKeyId: newKeyId,
        moderationActive: user?.ageCategory === '13-15' && profile.ageCategory === '16+'
      };
      setConversations((prev) => [conv!, ...prev]);
    }

    setActiveConversationId(conv.id);
    setActiveTab('chat');
  };

  const handleSendMessage = (conversationId: string, text: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv || !user) return;

    const keyId = conv.encryptionKeyId;
    const { cipherText } = encryptFireBall(text, keyId);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderId: user.id,
      senderName: user.pseudo,
      text,
      cipherText,
      timestamp: timeStr,
      encryptedWith: 'FireBall-AES256-GCM',
      status: 'sent'
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: newMsg,
            unreadCount: 0
          };
        }
        return c;
      })
    );

    // Simulated match response
    setTimeout(() => {
      simulateMatchReply(conversationId, conv.participant);
    }, 1400);
  };

  const simulateMatchReply = (conversationId: string, participant: DatingProfile) => {
    const replies = [
      `Trop cool ! Viens on vocal sur The Hub ce soir ! 🌸`,
      `Yes ! Ajoute mon tag Discord qu'on joue ensemble ✨`,
      `Haha j'adore ton profil ! À très vite sur le serv 🔥`
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    const conv = conversations.find((c) => c.id === conversationId);
    const keyId = conv?.encryptionKeyId || 'FB-DEFAULT';
    const { cipherText } = encryptFireBall(replyText, keyId);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const replyMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId,
      senderId: participant.id,
      senderName: participant.pseudo,
      text: replyText,
      cipherText,
      timestamp: timeStr,
      encryptedWith: 'FireBall-AES256-GCM',
      status: 'delivered'
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: replyMsg,
            unreadCount: activeConversationId === conversationId ? 0 : c.unreadCount + 1
          };
        }
        return c;
      })
    );
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleUpdateUserSettings = (updated: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  };

  const handleResetProfile = () => {
    if (window.confirm('Es-tu sûr(e) de vouloir réinitialiser ton profil ?')) {
      setUser(null);
      setConversations([]);
      setActiveConversationId(null);
      localStorage.removeItem(STORAGE_USER_KEY);
      localStorage.removeItem(STORAGE_CONVS_KEY);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070204] text-stone-100 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top iOS Navigation Bar */}
      <header className="sticky top-0 z-30 ios-glass border-b border-rose-950/60 px-4 py-2.5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <DiscordHeader user={user} />
        </div>
      </header>

      {/* Main Container - Apple iOS layout without fake hardware bezels */}
      <main className="flex-1 max-w-xl w-full mx-auto flex flex-col overflow-hidden pb-16">
        {!user ? (
          <OnboardingView onComplete={handleOnboardingComplete} />
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === 'swipe' && (
              <SwipeDeck
                user={user}
                profiles={INITIAL_PROFILES}
                onStartChat={handleStartChat}
                onUpdateUserSettings={handleUpdateUserSettings}
              />
            )}

            {activeTab === 'chat' && (
              <FireBallSecureChat
                user={user}
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={setActiveConversationId}
                onSendMessage={handleSendMessage}
                onBackToDeck={() => setActiveTab('swipe')}
              />
            )}

            {activeTab === 'profile' && (
              <UserProfileView
                user={user}
                onUpdate={handleUpdateUserSettings}
                onReset={handleResetProfile}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Apple iOS Tab Bar */}
      {user && (
        <nav className="fixed bottom-0 inset-x-0 z-30 ios-glass border-t border-rose-950/70 py-2 px-6">
          <div className="max-w-md mx-auto flex items-center justify-around">
            <button
              onClick={() => setActiveTab('swipe')}
              className={`ios-button flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'swipe' ? 'text-rose-400 font-semibold' : 'text-stone-400 hover:text-stone-200 font-normal'
              }`}
            >
              <Flame className="w-5 h-5" />
              <span className="text-[10px]">Swipe</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`ios-button relative flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'chat' ? 'text-rose-400 font-semibold' : 'text-stone-400 hover:text-stone-200 font-normal'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-[10px]">Messages</span>
              {totalUnread > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {totalUnread}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`ios-button flex flex-col items-center gap-0.5 cursor-pointer ${
                activeTab === 'profile' ? 'text-rose-400 font-semibold' : 'text-stone-400 hover:text-stone-200 font-normal'
              }`}
            >
              <div className={`w-5 h-5 rounded-full overflow-hidden border ${activeTab === 'profile' ? 'border-rose-400' : 'border-stone-500'}`}>
                <img src={user.photoUrl} alt={user.pseudo} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px]">Profil</span>
            </button>
          </div>
        </nav>
      )}

    </div>
  );
}
