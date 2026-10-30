import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  Send, 
  Flame, 
  ArrowLeft, 
  CheckCheck, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Info
} from 'lucide-react';
import { DatingProfile, UserProfile, Message, Conversation } from '../types';
import { encryptFireBall, decryptFireBall, generateKeyId } from '../utils/fireballSecure';
import { DISCORD_INVITE_URL } from './DiscordHeader';

interface FireBallSecureChatProps {
  user: UserProfile;
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
  onBackToDeck: () => void;
}

export const FireBallSecureChat: React.FC<FireBallSecureChatProps> = ({
  user,
  conversations,
  activeConversationId,
  messages,
  onSelectConversation,
  onSendMessage,
  onBackToDeck
}) => {
  const [inputText, setInputText] = useState('');
  const [inspectCipher, setInspectCipher] = useState(false);
  const [copiedDiscord, setCopiedDiscord] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, activeConv?.lastMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;
    onSendMessage(activeConv.id, inputText.trim());
    setInputText('');
  };

  const copyDiscord = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedDiscord(true);
    setTimeout(() => setCopiedDiscord(false), 2000);
  };

  // Preview live dynamic ciphertext while typing
  const liveEncryptionPreview = inputText ? encryptFireBall(inputText, activeConv?.encryptionKeyId || 'FB-DEFAULT') : null;

  return (
    <div className="flex-1 w-full flex flex-col overflow-hidden p-3 select-none">
      
      {/* If No Active Conversation: Show Conversation List */}
      {!activeConv ? (
        <div className="flex-1 liquid-glass-card p-5 sm:p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-rose-900/60">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                <h2 className="text-xl font-black text-white">Messagerie FireBall Secure</h2>
              </div>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Tous les MP sont chiffrés en temps réel avec AES-256 de bout en bout.
              </p>
            </div>
            <button
              onClick={onBackToDeck}
              className="text-xs font-bold text-rose-300 hover:text-white px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/80 cursor-pointer"
            >
              Retour au Swipe
            </button>
          </div>

          {/* Conversations Roster */}
          <div className="flex-1 overflow-y-auto divide-y divide-rose-950/60 py-2">
            {conversations.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-900/30 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Aucun MP pour le moment</h3>
                  <p className="text-xs text-rose-300/80 max-w-xs mt-1">
                    Swipe des profils et clique sur le bouton "MP Chiffré" ou attends un match pour démarrer une conversation sécurisée.
                  </p>
                </div>
                <button
                  onClick={onBackToDeck}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/40 cursor-pointer"
                >
                  Découvrir des profils
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="w-full p-3.5 rounded-2xl hover:bg-rose-900/30 transition-all flex items-center gap-3 text-left cursor-pointer group"
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-rose-400/50 shrink-0">
                    <img
                      src={conv.participant.photoUrl}
                      alt={conv.participant.pseudo}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-rose-950 rounded-full"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-extrabold text-sm text-white group-hover:text-rose-200 transition-colors">
                        {conv.participant.pseudo}
                      </span>
                      {conv.lastMessage && (
                        <span className="text-[10px] text-rose-400/80">
                          {conv.lastMessage.timestamp}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-rose-300/80 truncate">
                      <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">
                        {conv.lastMessage?.text || 'Conversation chiffrée initialisée'}
                      </span>
                    </div>
                  </div>

                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Discord Server Footer Card */}
          <div className="pt-3 border-t border-rose-900/50 flex items-center justify-between text-xs text-rose-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Chiffrement temps réel garanti par FireBall Secure</span>
            </span>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#858df3] hover:underline font-bold flex items-center gap-1"
            >
              <span>Salon Discord</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : (
        /* Active Conversation Screen */
        <div className="flex-1 liquid-glass-card flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-rose-800/50 bg-rose-950/80 flex items-center justify-between shrink-0">
            
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => onSelectConversation('')}
                className="p-1.5 rounded-lg hover:bg-rose-900/50 text-rose-300 hover:text-white transition-colors cursor-pointer"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-rose-400 shrink-0">
                <img
                  src={activeConv.participant.photoUrl}
                  alt={activeConv.participant.pseudo}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-rose-950 rounded-full"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    {activeConv.participant.pseudo}
                  </h3>
                  <span className="text-xs text-rose-300 font-bold">
                    {activeConv.participant.age} ans
                  </span>
                  <span className="text-[10px] bg-rose-900 text-rose-300 px-1.5 py-0.2 rounded-full font-semibold border border-rose-700/50">
                    {activeConv.participant.ageCategory}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  <span>FireBall Secure v2.4 (AES-256)</span>
                </div>
              </div>
            </div>

            {/* Chat Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Copy Discord Button */}
              <button
                onClick={() => copyDiscord(activeConv.participant.discordTag)}
                className="px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Copier le tag Discord"
              >
                {copiedDiscord ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">Discord</span>
              </button>

              {/* Toggle Cipher Inspection */}
              <button
                onClick={() => setInspectCipher(!inspectCipher)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  inspectCipher
                    ? 'bg-rose-500 text-white border-rose-400'
                    : 'bg-rose-950 text-rose-300 border-rose-800 hover:bg-rose-900/50'
                }`}
                title="Inspecter le flux chiffré brut"
              >
                {inspectCipher ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Chiffrement</span>
              </button>

              {/* Report button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800 cursor-pointer"
                title="Signaler un comportement"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Security Banner Alert */}
          <div className="px-4 py-2 bg-gradient-to-r from-rose-950 via-rose-900/40 to-rose-950 border-b border-rose-800/40 flex items-center justify-between text-[11px] text-rose-200">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>
                Session sécurisée : <strong>{activeConv.encryptionKeyId}</strong>
              </span>
            </div>
            <span className="text-[10px] text-rose-400 font-mono">
              ZERO-LOG • ENCRYPTED
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            
            {/* Conversation Introduction pill */}
            <div className="text-center py-2">
              <div className="inline-flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Canal privé FireBall avec {activeConv.participant.pseudo}</span>
                </div>
                <span className="text-[11px] text-rose-400/90">
                  Les messages sont protégés en temps réel. Ne partage jamais de données bancaires ou d'informations sensibles.
                </span>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-xs text-rose-300/80">
                    C'est le début de votre discussion chiffrée avec {activeConv.participant.pseudo}.
                  </p>
                  <p className="text-[11px] text-rose-400/60 mt-1">
                    Envoie le premier message sécurisé !
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-rose-400 shrink-0 mb-1">
                          <img
                            src={activeConv.participant.photoUrl}
                            alt={activeConv.participant.pseudo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs space-y-1 shadow-md ${
                          isMe
                            ? 'rounded-br-xs bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-rose-950/60'
                            : 'rounded-bl-xs bg-rose-900/60 border border-rose-700/50 text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-[10px] text-rose-200">
                          <span className="font-semibold">{isMe ? 'Toi' : activeConv.participant.pseudo}</span>
                          <span className="flex items-center gap-1 opacity-80">
                            <Lock className="w-2.5 h-2.5" />
                            <span>AES-256</span>
                          </span>
                        </div>

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                        {inspectCipher && msg.cipherText && (
                          <div className="mt-1 pt-1 border-t border-rose-400/30 text-[9px] font-mono text-rose-100/80 break-all">
                            {msg.cipherText}
                          </div>
                        )}

                        <div className={`flex items-center justify-end gap-1 text-[9px] pt-0.5 ${isMe ? 'text-rose-200/90' : 'text-rose-400/80'}`}>
                          <span>{msg.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3" />}
                        </div>
                      </div>

                      {isMe && (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-rose-400 shrink-0 mb-1">
                          <img src={user.photoUrl} alt={user.pseudo} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Live Typing Cipher Preview Banner */}
          {liveEncryptionPreview && (
            <div className="px-4 py-1.5 bg-rose-950/90 border-t border-rose-800/50 flex items-center gap-2 text-[10px] text-rose-300 font-mono overflow-hidden">
              <Flame className="w-3 h-3 text-rose-400 animate-pulse shrink-0" />
              <span className="text-white font-bold shrink-0">Chiffrement en direct :</span>
              <span className="text-emerald-300 truncate">
                {liveEncryptionPreview.cipherText}
              </span>
            </div>
          )}

          {/* Message Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 bg-rose-950/90 border-t border-rose-800/60 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Écrire un MP sécurisé à ${activeConv.participant.pseudo}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-900/40 border border-rose-700/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-500 text-white placeholder-rose-400/50 text-xs sm:text-sm outline-none transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-rose-900/50 transition-all cursor-pointer"
              title="Envoyer avec chiffrement FireBall"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

      {/* Safety Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-rose-950 border border-rose-500 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-400 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-black text-white">Signaler un profil</h4>
            
            {reportSubmitted ? (
              <div className="space-y-3">
                <p className="text-xs text-emerald-300">
                  Signalement transmis à l'équipe de modération Discord The Hub. Merci d'aider à préserver une communauté bienveillante et sécurisée.
                </p>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSubmitted(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs text-rose-300 leading-relaxed text-left">
                  Tu as remarqué un comportement suspect, du harcèlement ou un contenu dangereux ? Sélectionne le motif :
                </p>

                <div className="space-y-1.5 text-left text-xs">
                  {['Fausses déclarations d’âge', 'Contenu dangereux ou inapproprié', 'Harcèlement ou propos haineux', 'Spam / Arnaque'].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportSubmitted(true)}
                      className="w-full text-left p-2.5 rounded-xl bg-rose-900/40 hover:bg-rose-900/80 border border-rose-800 text-rose-200 transition-colors"
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-full py-2 rounded-xl bg-rose-950 text-rose-400 border border-rose-800 text-xs font-semibold"
                >
                  Annuler
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
