import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  MessageCircle, 
  User, 
  Lock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { UserProfile, DatingProfile, Conversation, Message } from './types';
import { DiscordHeader } from './components/DiscordHeader';
import { OnboardingView } from './components/OnboardingView';
import { SwipeDeck } from './components/SwipeDeck';
import { FireBallSecureChat } from './components/FireBallSecureChat';
import { UserProfileView } from './components/UserProfileView';
import { generateKeyId } from './utils/fireballSecure';
import { 
  initAuth,
  saveUserProfileToFirestore,
  subscribeToProfiles,
  subscribeToUserConversations,
  subscribeToMessages,
  sendFirestoreMessage,
  createOrGetConversation,
  recordSwipe
} from './firebase';

const STORAGE_USER_KEY = 'thehub_user_profile_v1';

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
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);

  // Init anonymous Firebase auth on startup
  useEffect(() => {
    initAuth();
  }, []);

  // Sync user profile to localStorage and ensure it is saved in Firestore
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      saveUserProfileToFirestore(user).catch((err) => {
        console.warn('Could not sync user to Firestore:', err);
      });
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [user]);

  // Subscribe to all profiles in Firestore in real-time
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToProfiles(user.id, (loadedProfiles) => {
      setProfiles(loadedProfiles);
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Subscribe to real-time conversations in Firestore
  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserConversations(user.id, (loadedConvs) => {
      setConversations(loadedConvs);
    });
    return () => unsubscribe();
  }, [user?.id]);

  // Subscribe to real-time messages for the active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setActiveMessages([]);
      return;
    }
    const currentConv = conversations.find((c) => c.id === activeConversationId);
    const keyId = currentConv?.encryptionKeyId || 'FB-AES256-DEFAULT';

    const unsubscribe = subscribeToMessages(activeConversationId, keyId, (msgs) => {
      setActiveMessages(msgs);
    });
    return () => unsubscribe();
  }, [activeConversationId, conversations]);

  // Onboarding Complete
  const handleOnboardingComplete = async (newProfile: UserProfile) => {
    setUser(newProfile);
    try {
      await saveUserProfileToFirestore(newProfile);
    } catch (e) {
      console.warn('Saved locally, firestore pending:', e);
    }
    setActiveTab('swipe');
  };

  // Start chat with a profile
  const handleStartChat = async (profile: DatingProfile, initialText?: string) => {
    if (!user) return;
    const sorted = [user.id, profile.id].sort();
    const convId = `conv_${sorted[0]}_${sorted[1]}`;
    const keyId = generateKeyId();

    // Optimistically update conversations so chat view is active immediately
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === convId);
      if (exists) return prev;
      const optimisticConv: Conversation = {
        id: convId,
        participant: profile,
        unreadCount: 0,
        encryptionKeyId: keyId,
        moderationActive: user.ageCategory === '13-15' && profile.ageCategory === '16+',
      };
      return [optimisticConv, ...prev];
    });

    setActiveConversationId(convId);
    setActiveTab('chat');

    try {
      await createOrGetConversation(user, profile, keyId);
      if (initialText && initialText.trim()) {
        await sendFirestoreMessage(convId, user, initialText.trim(), keyId);
      }
    } catch (err) {
      console.error('Error starting conversation:', err);
    }
  };

  // Send message with FireBall Secure to Firestore
  const handleSendMessage = async (conversationId: string, text: string) => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv || !user) return;

    try {
      await sendFirestoreMessage(conversationId, user, text, conv.encryptionKeyId);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Record swipe in Firestore
  const handleSwipe = async (
    targetProfile: DatingProfile,
    direction: 'like' | 'pass' | 'superlike'
  ): Promise<boolean> => {
    if (!user) return false;
    const isMatch = await recordSwipe(user.id, targetProfile.id, direction);
    if (isMatch) {
      // Create conversation automatically on match!
      const keyId = generateKeyId();
      await createOrGetConversation(user, targetProfile, keyId);
    }
    return isMatch;
  };

  const totalUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const handleUpdateUserSettings = async (updated: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      saveUserProfileToFirestore(merged).catch(console.warn);
      return merged;
    });
  };

  const handleResetProfile = () => {
    if (window.confirm('Es-tu sûr(e) de vouloir réinitialiser ton profil ?')) {
      setUser(null);
      setConversations([]);
      setActiveConversationId(null);
      localStorage.removeItem(STORAGE_USER_KEY);
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
                profiles={profiles}
                onStartChat={handleStartChat}
                onUpdateUserSettings={handleUpdateUserSettings}
                onSwipe={handleSwipe}
              />
            )}

            {activeTab === 'chat' && (
              <FireBallSecureChat
                user={user}
                profiles={profiles}
                conversations={conversations}
                activeConversationId={activeConversationId}
                messages={activeMessages}
                onSelectConversation={setActiveConversationId}
                onSendMessage={handleSendMessage}
                onStartChat={handleStartChat}
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
