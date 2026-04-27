import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, Link, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, CarRental } from '@mui/icons-material';

const LoginPage = () => {
  const { hyrje } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await hyrje(form.email, form.password);
      navigate(user.roli === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.mesazh || 'Gabim gjatë hyrjes. Provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1a1f3a 0%, #0A0E1A 50%)',
      position: 'relative', overflow: 'hidden', p: 2
    }}>
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', top: -100, right: -100 }} />
      <Box sx={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.1) 0%, transparent 70%)', bottom: -50, left: -50 }} />

      <Card sx={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '18px', background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 32px rgba(108,99,255,0.3)' }}>
              <CarRental sx={{ fontSize: 34, color: '#fff' }} />
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Mirë se vini
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Hyni në llogarinë tuaj të Makina Qera
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Email" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#6C63FF', fontSize: 20 }} /></InputAdornment> }}
              sx={{ mb: 2.5 }}
            />
            <TextField
              fullWidth label="Fjalëkalimi" required
              type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#6C63FF', fontSize: 20 }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ fontSize: 20 }} /> : <Visibility sx={{ fontSize: 20 }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Hyni'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            Nuk keni llogari?{' '}
            <Link component={RouterLink} to="/regjistrim" sx={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Regjistrohuni
            </Link>
          </Typography>

          {/* Demo credentials */}
          <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              🔑 Kredencialet demo:
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Admin: admin@makinaqera.al / Admin123!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Klient: andi.hoxha@email.com / Klient123!
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
