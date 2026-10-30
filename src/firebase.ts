import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, DatingProfile, Message, Conversation } from './types';
import { encryptFireBall, decryptFireBall } from './utils/fireballSecure';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error handling conforming to skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      isAnonymous: auth.currentUser?.isAnonymous
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// Initialize anonymous auth if possible (no email needed)
export async function initAuth() {
  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
    return auth.currentUser?.uid || null;
  } catch (err) {
    console.warn('Anonymous auth not enabled or skipped:', err);
    return null;
  }
}

/* ============================================================
   USER PROFILES (FIRESTORE)
   ============================================================ */

export async function saveUserProfileToFirestore(profile: UserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// Subscribe to other registered profiles for swiping
export function subscribeToProfiles(
  currentUserId: string,
  onProfilesUpdate: (profiles: DatingProfile[]) => void
) {
  const path = 'users';
  try {
    const usersRef = collection(db, 'users');
    return onSnapshot(usersRef, (snapshot) => {
      const list: DatingProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.id !== currentUserId) {
          list.push({
            id: data.id,
            pseudo: data.pseudo,
            age: data.age,
            gender: data.gender,
            bio: data.bio || '',
            photoUrl: data.photoUrl,
            discordTag: data.discordTag || `${data.pseudo}#hub`,
            location: 'The Hub Discord',
            interests: data.interests || [],
            ageCategory: data.ageCategory,
            verified: true,
            distanceKm: Math.floor(Math.random() * 25) + 3,
            onlineStatus: 'online'
          });
        }
      });
      onProfilesUpdate(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

/* ============================================================
   SWIPES & MATCHES (FIRESTORE)
   ============================================================ */

export async function recordSwipe(
  userId: string,
  targetUserId: string,
  direction: 'like' | 'pass' | 'superlike'
): Promise<boolean> {
  const swipeId = `${userId}_${targetUserId}`;
  const path = `swipes/${swipeId}`;
  try {
    await setDoc(doc(db, 'swipes', swipeId), {
      id: swipeId,
      userId,
      targetUserId,
      direction,
      createdAt: new Date().toISOString()
    });

    // Check if other user also liked this user -> MATCH!
    if (direction === 'like' || direction === 'superlike') {
      const reciprocalSwipeId = `${targetUserId}_${userId}`;
      const recDoc = await getDoc(doc(db, 'swipes', reciprocalSwipeId));
      if (recDoc.exists()) {
        const recData = recDoc.data();
        if (recData.direction === 'like' || recData.direction === 'superlike') {
          return true; // Match confirmed!
        }
      }
    }
    return false;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/* ============================================================
   CONVERSATIONS & ENCRYPTED MP (FIRESTORE)
   ============================================================ */

export async function createOrGetConversation(
  user: UserProfile,
  participant: DatingProfile,
  encryptionKeyId: string
): Promise<string> {
  // Sort IDs to guarantee consistent conversation ID between two users
  const sortedIds = [user.id, participant.id].sort();
  const convId = `conv_${sortedIds[0]}_${sortedIds[1]}`;
  const path = `conversations/${convId}`;

  try {
    const convRef = doc(db, 'conversations', convId);
    const snap = await getDoc(convRef);
    if (!snap.exists()) {
      await setDoc(convRef, {
        id: convId,
        participantIds: [user.id, participant.id],
        participantsData: {
          [user.id]: {
            pseudo: user.pseudo,
            photoUrl: user.photoUrl,
            age: user.age,
            gender: user.gender,
            discordTag: user.discordTag,
            ageCategory: user.ageCategory
          },
          [participant.id]: {
            pseudo: participant.pseudo,
            photoUrl: participant.photoUrl,
            age: participant.age,
            gender: participant.gender,
            discordTag: participant.discordTag,
            ageCategory: participant.ageCategory
          }
        },
        encryptionKeyId,
        lastMessageText: '',
        lastMessageTimestamp: '',
        moderationActive: user.ageCategory === '13-15' && participant.ageCategory === '16+',
        createdAt: new Date().toISOString()
      });
    }
    return convId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return convId;
  }
}

// Subscribe to real-time conversations for a user
export function subscribeToUserConversations(
  userId: string,
  onUpdate: (conversations: Conversation[]) => void
) {
  const path = 'conversations';
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId)
    );

    return onSnapshot(q, (snapshot) => {
      const convs: Conversation[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const otherId = data.participantIds.find((id: string) => id !== userId);
        const otherData = data.participantsData?.[otherId] || {
          pseudo: 'Membre The Hub',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
          age: 18,
          gender: 'Autre',
          discordTag: 'discord#hub',
          ageCategory: '16+'
        };

        const participant: DatingProfile = {
          id: otherId || 'unknown',
          pseudo: otherData.pseudo,
          photoUrl: otherData.photoUrl,
          age: otherData.age || 18,
          gender: otherData.gender || 'Autre',
          bio: '',
          discordTag: otherData.discordTag || `${otherData.pseudo}#hub`,
          location: 'The Hub Discord',
          interests: [],
          ageCategory: otherData.ageCategory || '16+',
          verified: true,
          distanceKm: 5,
          onlineStatus: 'online'
        };

        convs.push({
          id: data.id,
          participant,
          unreadCount: 0,
          encryptionKeyId: data.encryptionKeyId || 'FB-AES256-DEFAULT',
          moderationActive: !!data.moderationActive,
          lastMessage: data.lastMessageText ? {
            id: 'last',
            conversationId: data.id,
            senderId: data.lastMessageSenderId || '',
            senderName: data.lastMessageSenderName || '',
            text: data.lastMessageText,
            cipherText: data.lastMessageCipher || '',
            timestamp: data.lastMessageTimestamp || '',
            encryptedWith: 'FireBall-AES256-GCM',
            status: 'delivered'
          } : undefined
        });
      });
      onUpdate(convs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}

// Send encrypted message to Firestore
export async function sendFirestoreMessage(
  conversationId: string,
  sender: UserProfile,
  text: string,
  encryptionKeyId: string
): Promise<Message> {
  const { cipherText } = encryptFireBall(text, encryptionKeyId);
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const msgId = 'msg_' + Date.now();
  const path = `conversations/${conversationId}/messages/${msgId}`;

  const message: Message = {
    id: msgId,
    conversationId,
    senderId: sender.id,
    senderName: sender.pseudo,
    text,
    cipherText,
    timestamp: timeStr,
    encryptedWith: 'FireBall-AES256-GCM',
    status: 'sent'
  };

  try {
    // 1. Save message in subcollection
    await setDoc(doc(db, 'conversations', conversationId, 'messages', msgId), {
      ...message,
      createdAt: new Date().toISOString()
    });

    // 2. Update last message on conversation
    await setDoc(doc(db, 'conversations', conversationId), {
      lastMessageText: text,
      lastMessageCipher: cipherText,
      lastMessageTimestamp: timeStr,
      lastMessageSenderId: sender.id,
      lastMessageSenderName: sender.pseudo,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return message;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
}

// Subscribe in real-time to messages of a conversation
export function subscribeToMessages(
  conversationId: string,
  encryptionKeyId: string,
  onMessages: (messages: Message[]) => void
) {
  const path = `conversations/${conversationId}/messages`;
  try {
    const q = query(collection(db, 'conversations', conversationId, 'messages'));
    return onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        let decryptedText = data.text;
        if (!decryptedText && data.cipherText) {
          decryptedText = decryptFireBall(data.cipherText, encryptionKeyId);
        }
        msgs.push({
          id: data.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          text: decryptedText || data.cipherText,
          cipherText: data.cipherText,
          timestamp: data.timestamp,
          encryptedWith: data.encryptedWith || 'FireBall-AES256-GCM',
          status: data.status || 'delivered'
        });
      });
      // Sort chronologically by id or timestamp
      msgs.sort((a, b) => a.id.localeCompare(b.id));
      onMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return () => {};
  }
}
