import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth duhet të përdoret brenda AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [perdoruesi, setPerdoruesi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Ngarko profilin kur ka token
  const ngarkoProfili = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.profili();
      setPerdoruesi(res.data.te_dhena);
    } catch (err) {
      console.error('Gabim gjatë ngarkimit të profilit:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('perdoruesi');
      setToken(null);
      setPerdoruesi(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    ngarkoProfili();
  }, [ngarkoProfili]);

  // Hyrje (Login)
  const hyrje = async (email, password) => {
    const res = await authAPI.hyrje({ email, password });
    const { token: newToken, perdoruesi: user } = res.data.te_dhena;
    localStorage.setItem('token', newToken);
    localStorage.setItem('perdoruesi', JSON.stringify(user));
    setToken(newToken);
    setPerdoruesi(user);
    return user;
  };

  // Regjistrim
  const regjistrim = async (data) => {
    const res = await authAPI.regjistrim(data);
    const { token: newToken, perdoruesi: user } = res.data.te_dhena;
    localStorage.setItem('token', newToken);
    localStorage.setItem('perdoruesi', JSON.stringify(user));
    setToken(newToken);
    setPerdoruesi(user);
    return user;
  };

  // Dalje (Logout)
  const dalje = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('perdoruesi');
    setToken(null);
    setPerdoruesi(null);
  };

  // Përditëso profilin
  const perditesoProfili = async (data) => {
    const res = await authAPI.perditesoProfili(data);
    setPerdoruesi(res.data.te_dhena);
    return res.data.te_dhena;
  };

  const eshteAdmin = perdoruesi?.roli === 'admin';
  const eshteKlient = perdoruesi?.roli === 'klient';
  const eshteHyrur = !!perdoruesi;

  return (
    <AuthContext.Provider value={{
      perdoruesi, loading, token,
      hyrje, regjistrim, dalje, perditesoProfili,
      eshteAdmin, eshteKlient, eshteHyrur
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
