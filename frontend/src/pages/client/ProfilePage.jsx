import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button,
  Avatar, Chip, Divider, Alert
} from '@mui/material';
import { Person, Save } from '@mui/icons-material';

const ProfilePage = () => {
  const { perdoruesi, perditesoProfili } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    emri: perdoruesi?.emri || '',
    mbiemri: perdoruesi?.mbiemri || '',
    telefoni: perdoruesi?.telefoni || ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await perditesoProfili(form);
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.mesazh || 'Gabim');
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Profili Im</Typography>

      {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>Profili u përditësua me sukses!</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ textAlign: 'center' }}>
            <CardContent sx={{ p: 4 }}>
              <Avatar sx={{
                width: 100, height: 100, mx: 'auto', mb: 2, fontSize: '2.5rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #6C63FF, #00D9FF)',
                boxShadow: '0 8px 32px rgba(108,99,255,0.3)'
              }}>
                {perdoruesi?.emri?.[0]}{perdoruesi?.mbiemri?.[0]}
              </Avatar>
              <Typography variant="h5" fontWeight={700}>{perdoruesi?.emri} {perdoruesi?.mbiemri}</Typography>
              <Chip label={perdoruesi?.roli === 'admin' ? 'Administrator' : 'Klient'}
                sx={{ mt: 1, background: perdoruesi?.roli === 'admin' ? 'rgba(108,99,255,0.2)' : 'rgba(0,217,255,0.2)',
                  color: perdoruesi?.roli === 'admin' ? '#6C63FF' : '#00D9FF', fontWeight: 600 }} />
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Typography variant="body2" color="text.secondary">{perdoruesi?.email}</Typography>
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: perdoruesi?.email_verified ? '#10B981' : '#EF4444' }} />
                <Typography variant="caption" color="text.secondary">
                  {perdoruesi?.email_verified ? 'Email i verifikuar' : 'Email i paverifikuar'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>Informacionet Personale</Typography>
                <Button variant="outlined" size="small" onClick={() => setEditing(!editing)}
                  sx={{ borderColor: 'rgba(108,99,255,0.5)', color: '#6C63FF' }}>
                  {editing ? 'Anulo' : 'Edito'}
                </Button>
              </Box>

              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Emri" value={form.emri} disabled={!editing}
                      onChange={(e) => setForm({ ...form, emri: e.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Mbiemri" value={form.mbiemri} disabled={!editing}
                      onChange={(e) => setForm({ ...form, mbiemri: e.target.value })} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Email" value={perdoruesi?.email} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Telefoni" value={form.telefoni} disabled={!editing}
                      onChange={(e) => setForm({ ...form, telefoni: e.target.value })} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Nr. Personal" value={perdoruesi?.nr_personal} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Datëlindja" value={perdoruesi?.datelindja} disabled />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Regjistruar më" value={perdoruesi?.krijuar_me ? new Date(perdoruesi.krijuar_me).toLocaleDateString('sq-AL') : ''} disabled />
                  </Grid>
                  {editing && (
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" startIcon={<Save />} sx={{ mt: 1 }}>
                        Ruaj Ndryshimet
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
