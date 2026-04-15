import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getUserProfile, UserProfile } from '../../../shared/services/db';

interface AuthContextType {
  user: any | null; // We use a generic dict for the decoded user 
  profile: UserProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  offlineUid: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => { },
  offlineUid: localStorage.getItem('_am_last_uid')
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineUid] = useState(() => localStorage.getItem('_am_last_uid'));

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('am_access_token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          // Assuming `sub` is the user's uid in the token payload
          const uid = decoded.sub;
          if (uid) {
            setUser({ uid });
            localStorage.setItem('_am_last_uid', uid);
            // Fire profile fetch in background to prevent blocking auth resolution
            getUserProfile(uid).then(p => {
              if (p) setProfile(p);
            });
          } else {
            throw new Error("Invalid token payload");
          }
        } catch (err) {
          console.error("Auth initialization failed", err);
          localStorage.removeItem('am_access_token');
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    };

    initializeAuth();

    // Setup an interval to periodically check token or listen to changes
    const handleStorageChange = () => {
      initializeAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth_changed', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth_changed', handleStorageChange);
    };
  }, []);

  const refreshProfile = async () => {
    if (user?.uid) {
      const p = await getUserProfile(user.uid);
      setProfile(p);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, offlineUid }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
