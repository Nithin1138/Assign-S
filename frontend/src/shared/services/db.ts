import { config } from '../config';
import { auth } from './firebase';

// --------------------------------------------------
// Auth header helper — attaches Firebase ID token
// --------------------------------------------------
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // If token fetch fails, request proceeds without auth header
  }
  return headers;
};

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  institution?: string;
  fieldOfStudy?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'midnight' | 'emerald' | 'rose' | 'amber' | 'nord' | 'coffee' | 'system';
    accentColor?: string;
    fontFamily?: 'sans' | 'serif' | 'mono';
    glassmorphism?: boolean;
    emailNotifications?: boolean;
    aiSuggestions?: boolean;
    publicProfile?: boolean;
  };
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
}

export interface Document {
  id: string;
  userId: string;
  title: string;
  topic: string;
  description: string;
  content: string;
  sections?: DocumentSection[];
  taskType: string;
  tone: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = config.apiUrl;

const mapDoc = (d: any): Document => ({
  id: String(d.id),
  userId: d.user_id,
  title: d.title || 'Untitled',
  topic: d.topic || '',
  description: d.description || '',
  content: d.content || '',
  sections: d.sections || [],
  taskType: d.task_type || 'generate',
  tone: d.tone || 'neutral',
  createdAt: d.created_at,
  updatedAt: d.updated_at
});

const mapTemplate = (t: any) => ({
  id: String(t.id),
  userId: t.user_id,
  docId: t.doc_id,
  title: t.name,
  name: t.name,
  topic: t.topic || '',
  description: t.description || '',
  sections: t.sections || [],
  metadataFields: t.metadata_fields || {},
  style: t.style || {},
  createdAt: t.created_at,
  updatedAt: t.updated_at
});

// --------------------------------------------------
// User Profile
// --------------------------------------------------
export const syncUser = async (user: any) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Sync User failed:", error);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users/${uid}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ uid, ...updates })
    });
    return await response.json();
  } catch (error) {
    console.error("Update User failed:", error);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/users/${uid}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return { ...data, createdAt: data.created_at } as UserProfile;
  } catch (error) {
    console.error("Get User Profile failed:", error);
    return null;
  }
};

// --------------------------------------------------
// Documents
// --------------------------------------------------
export const createDocument = async (userId: string, title: string, content: string, topic?: string, description?: string, tone?: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        title: title || 'Untitled Assignment',
        content,
        topic,
        description,
        tone
      })
    });
    const json = await response.json();
    return json?.data ?? json;
  } catch (error) {
    console.error("Create Document failed:", error);
  }
};

export const updateDocument = async (userId: string, docId: string, updates: Partial<Document>) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/${docId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        user_id: userId,
        title: updates.title,
        content: updates.content,
        topic: updates.topic,
        description: updates.description,
        sections: updates.sections,
        task_type: updates.taskType,
        tone: updates.tone
      })
    });
    return await response.json();
  } catch (error) {
    console.error("Update Document failed:", error);
  }
};

export const deleteDocument = async (userId: string, docId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/${docId}?user_id=${userId}`, {
      method: 'DELETE',
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("Delete Document failed:", error);
  }
};

export const getDocument = async (userId: string, docId: string): Promise<Document | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/${docId}?user_id=${userId}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return mapDoc(data);
  } catch (error) {
    console.error("Get Document failed:", error);
    return null;
  }
};

export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents?user_id=${userId}`, { headers });
    const data = await response.json();
    return data.map(mapDoc);
  } catch (error) {
    console.error("List Documents failed:", error);
    return [];
  }
};

// --------------------------------------------------
// Templates
// --------------------------------------------------
export const getUserTemplates = async (userId: string): Promise<any[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/templates?user_id=${userId}`, { headers });
    const data = await response.json();
    return data.map(mapTemplate);
  } catch (error) {
    console.error("List Templates failed:", error);
    return [];
  }
};

export const saveAsTemplate = async (userId: string, data: { name: string, sections: any[], metadataFields?: any, style?: any, topic?: string, description?: string, docId?: number, extractionDetails?: any }) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/templates`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: userId,
        name: data.name,
        sections: data.sections,
        metadata_fields: data.metadataFields,
        style: data.style,
        topic: data.topic,
        description: data.description,
        doc_id: data.docId,
        extraction_details: data.extractionDetails
      })
    });
    const json = await response.json();
    if (!response.ok) {
      throw new Error(json?.error || json?.data?.detail || json?.detail || 'Failed to save template');
    }
    return json?.data ?? json;
  } catch (error) {
    console.error("Save Template failed:", error);
    throw error;
  }
};

export const deleteTemplate = async (userId: string, templateId: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/templates/${templateId}?user_id=${userId}`, {
      method: 'DELETE',
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("Delete Template failed:", error);
  }
};

// --------------------------------------------------
// High-Speed Persistence & Caching Engine
// --------------------------------------------------

const CACHE_KEYS = { DOCS: '_am_docs_cache', TPLS: '_am_tpls_cache' };

const _loadFromStorage = (key: string) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : {};
  } catch { return {}; }
};

const _saveToStorage = (key: string, val: any) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
};

const _docCache: Record<string, Document[]> = _loadFromStorage(CACHE_KEYS.DOCS);
const _tplCache: Record<string, any[]> = _loadFromStorage(CACHE_KEYS.TPLS);
const _listeners: Set<() => void> = new Set();

export const subscribeToUserDocuments = (userId: string, callback: (docs: Document[]) => void) => {
  // 1. Instant sync from memory/storage
  if (_docCache[userId]) {
    callback(_docCache[userId]);
  }

  // 2. High-speed revalidation
  getUserDocuments(userId).then(docs => {
    _docCache[userId] = docs;
    _saveToStorage(CACHE_KEYS.DOCS, _docCache);
    callback(docs);
  });

  const listener = () => _docCache[userId] && callback(_docCache[userId]);
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
};

export const subscribeToUserTemplates = (userId: string, callback: (docs: any[]) => void) => {
  if (_tplCache[userId]) {
    callback(_tplCache[userId]);
  }

  getUserTemplates(userId).then(tpls => {
    _tplCache[userId] = tpls;
    _saveToStorage(CACHE_KEYS.TPLS, _tplCache);
    callback(tpls);
  });

  const listener = () => _tplCache[userId] && callback(_tplCache[userId]);
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
};

export const subscribeToSharedDocuments = (userId: string, callback: (docs: Document[]) => void) => {
  const SHARED_KEY = '_am_shared_cache';
  const cache = _loadFromStorage(SHARED_KEY);
  
  if (cache[userId]) {
    callback(cache[userId]);
  }

  getSharedDocuments(userId).then(docs => {
    cache[userId] = docs;
    _saveToStorage(SHARED_KEY, cache);
    callback(docs as Document[]);
  });

  const listener = () => cache[userId] && callback(cache[userId]);
  _listeners.add(listener);
  return () => { _listeners.delete(listener); };
};

// --------------------------------------------------
// Sharing Operations
// --------------------------------------------------

export const getDocumentByShareCode = async (code: string): Promise<Document | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/share/${code}`, { headers });
    if (!response.ok) return null;
    const data = await response.json();
    return mapDoc(data);
  } catch (error) {
    console.error("Get Shared Document failed:", error);
    return null;
  }
};

export const saveSharedDocument = async (code: string) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/save-shared/${code}`, {
      method: 'POST',
      headers,
    });
    return await response.json();
  } catch (error) {
    console.error("Save Shared Document failed:", error);
  }
};

export const getSharedDocuments = async (userId: string): Promise<Document[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/list/shared?user_id=${userId}`, { headers });
    const data = await response.json();
    return data.map(mapDoc);
  } catch (error) {
    console.error("List Shared Documents failed:", error);
    return [];
  }
};

export const generateShareCode = async (docId: string): Promise<string | null> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/documents/${docId}/share`, {
      method: 'POST',
      headers,
    });
    const json = await response.json();
    return json?.data?.share_code || json?.share_code || null;
  } catch (error) {
    console.error("Generate Share Code failed:", error);
    return null;
  }
};
