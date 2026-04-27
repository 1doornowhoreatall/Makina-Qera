import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  InputAdornment, IconButton, Alert, Link, CircularProgress, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Phone, Badge, CalendarMonth, CarRental } from '@mui/icons-material';

const RegisterPage = () => {
  const { regjistrim } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    emri: '', mbiemri: '', email: '', password: '', confirmPassword: '',
    datelindja: '', nr_personal: '', telefoni: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Fjalëkalimet nuk përputhen');
      return;
    }

    // Kontrollo moshën
    const datelindja = new Date(form.datelindja);
    const sot = new Date();
    let mosha = sot.getFullYear() - datelindja.getFullYear();
    const m = sot.getMonth() - datelindja.getMonth();
    if (m < 0 || (m === 0 && sot.getDate() < datelindja.getDate())) mosha--;
    if (mosha < 18) {
      setError('Mosha minimale për regjistrim është 18 vjeç');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await regjistrim(data);
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.mesazh || 'Gabim gjatë regjistrimit';
      const gabime = err.response?.data?.gabime;
      setError(gabime ? gabime.map(g => g.mesazh).join('. ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at bottom, #1a1f3a 0%, #0A0E1A 50%)',
      position: 'relative', overflow: 'hidden', p: 2, py: 4
    }}>
      <Box sx={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,217,255,0.12) 0%, transparent 70%)', top: -100, left: -100 }} />
      <Box sx={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.1) 0%, transparent 70%)', bottom: -80, right: -80 }} />

      <Card sx={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, #00D9FF, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, boxShadow: '0 8px 32px rgba(0,217,255,0.3)' }}>
              <CarRental sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ background: 'linear-gradient(135deg, #00D9FF, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Krijoni llogarinë tuaj
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Regjistrohuni për të filluar qiradhënien e automjeteve
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="Emri" required value={form.emri} onChange={handleChange('emri')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Mbiemri" required value={form.mbiemri} onChange={handleChange('mbiemri')} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" required value={form.email} onChange={handleChange('email')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Fjalëkalimi" required type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={handleChange('password')} helperText="Min. 8 karaktere, 1 shkronjë e madhe, 1 numër"
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment>,
                    endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} size="small">{showPassword ? <VisibilityOff sx={{ fontSize: 18 }} /> : <Visibility sx={{ fontSize: 18 }} />}</IconButton></InputAdornment>
                  }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Konfirmo fjalëkalimin" required type="password"
                  value={form.confirmPassword} onChange={handleChange('confirmPassword')} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Datëlindja" type="date" required value={form.datelindja}
                  onChange={handleChange('datelindja')} InputLabelProps={{ shrink: true }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonth sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Nr. Personal ID" required value={form.nr_personal}
                  onChange={handleChange('nr_personal')}
                  InputProps={{ startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Telefoni" required value={form.telefoni} onChange={handleChange('telefoni')}
                  placeholder="+355 69 xxx xxxx"
                  InputProps={{ startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#6C63FF', fontSize: 18 }} /></InputAdornment> }} />
              </Grid>
            </Grid>

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
              sx={{ mt: 3, py: 1.5, fontSize: '1rem', fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Regjistrohuni'}
            </Button>
          </form>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
            Keni llogari?{' '}
            <Link component={RouterLink} to="/hyrje" sx={{ color: '#6C63FF', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
              Hyni
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
