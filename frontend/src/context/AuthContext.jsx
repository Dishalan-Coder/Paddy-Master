import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

function normalizeUser(data) {
  return {
    id: data._id || data.user_id || data.id,
    role: data.role,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || '',
    district: data.district || '',
    address: data.address || '',
    bio: data.bio || '',
    profile_image_url: data.profile_image_url || '',
    is_verified: Boolean(data.is_verified),
    rating: Number(data.rating || 0),
    total_reviews: Number(data.total_reviews || 0),
    wallet_balance: Number(data.wallet_balance || 0),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pm_user')) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pm_token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pm_token');
    localStorage.removeItem('pm_user');
  }, []);

  const persistUser = useCallback((profile) => {
    const normalized = normalizeUser(profile);
    setUser(normalized);
    localStorage.setItem('pm_user', JSON.stringify(normalized));
    return normalized;
  }, []);

  const refreshProfile = useCallback(
    async () => persistUser(await authService.getProfile()),
    [persistUser],
  );

  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        await refreshProfile();
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, [token, refreshProfile, logout]);

  const saveSession = async (data) => {
    localStorage.setItem('pm_token', data.access_token);
    setToken(data.access_token);
    const provisional = persistUser(data);
    try {
      return await refreshProfile();
    } catch {
      return provisional;
    }
  };

  const login = async (credentials) =>
    saveSession(await authService.login(credentials));
  const register = async (details) =>
    saveSession(await authService.register(details));

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      setUser: persistUser,
    }),
    [user, token, loading, logout, refreshProfile, persistUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
