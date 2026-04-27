import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Alert,
  CircularProgress, Chip, Divider
} from '@mui/material';
import { DirectionsCar, CalendarMonth, LocationOn, CheckCircle } from '@mui/icons-material';
import { automjeteAPI, qiraDhenieAPI } from '../../api/client';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [automjeti, setAutomjeti] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [disponueshmeria, setDisponueshmeria] = useState(null);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({
    data_terheqjes: '', data_dorezimit: '',
    vendi_terheqjes: '', vendi_dorezimit: '',
    shenime_gjendjeje: ''
  });

  useEffect(() => {
    const ngarko = async () => {
      try {
        const res = await automjeteAPI.detajet(id);
        setAutomjeti(res.data.te_dhena);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    ngarko();
  }, [id]);

  // Kontrollo disponueshmërinë kur ndryshojnë datat
  useEffect(() => {
    if (form.data_terheqjes && form.data_dorezimit) {
      const kontrollo = async () => {
        setChecking(true);
        try {
          const res = await qiraDhenieAPI.kontrolloDisponueshmerine({
            automjet_id: id, data_fillimit: form.data_terheqjes, data_mbarimit: form.data_dorezimit
          });
          setDisponueshmeria(res.data.te_dhena);
        } catch (err) { setDisponueshmeria(null); }
        finally { setChecking(false); }
      };
      kontrollo();
    }
  }, [form.data_terheqjes, form.data_dorezimit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await qiraDhenieAPI.krijo({
        automjet_id: parseInt(id),
        data_terheqjes: new Date(form.data_terheqjes).toISOString(),
        data_dorezimit: new Date(form.data_dorezimit).toISOString(),
        vendi_terheqjes: form.vendi_terheqjes,
        vendi_dorezimit: form.vendi_dorezimit,
        shenime_gjendjeje: form.shenime_gjendjeje
      });
      setSuccess(true);
      setTimeout(() => navigate('/qirat-e-mia'), 2000);
    } catch (err) {
      setError(err.response?.data?.mesazh || 'Gabim gjatë krijimit të rezervimit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CheckCircle sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
        <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Rezervimi u krye!</Typography>
        <Typography color="text.secondary">Duke ju ridrejtuar tek qirat e mia...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>Rezervo Automjetin</Typography>

      <Grid container spacing={3}>
        {/* Detajet e automjetit */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 80 }}>
            <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,217,255,0.05))' }}>
              <DirectionsCar sx={{ fontSize: 70, color: '#6C63FF', opacity: 0.6 }} />
            </Box>
            <CardContent>
              <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>{automjeti?.modeli}</Typography>
              <Chip label={automjeti?.targa} sx={{ fontFamily: 'monospace', mb: 2, background: 'rgba(108,99,255,0.15)', color: '#6C63FF' }} />
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Viti</Typography><Typography fontWeight={600}>{automjeti?.viti_prodhimit}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Motori</Typography><Typography fontWeight={600}>{automjeti?.tipi_motorrit}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Kambio</Typography><Typography fontWeight={600}>{automjeti?.tipi_kambios}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Vende</Typography><Typography fontWeight={600}>{automjeti?.nr_max_pasagjeresh}</Typography></Grid>
              </Grid>
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#6C63FF' }}>€{automjeti?.cmimi_ditor}</Typography>
                <Typography variant="body2" color="text.secondary">/ditë</Typography>
              </Box>
              {disponueshmeria?.cmimi_total && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 2, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Typography variant="caption" color="text.secondary">Çmimi total</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#10B981' }}>€{disponueshmeria.cmimi_total}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Forma e rezervimit */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
              
              {disponueshmeria && !disponueshmeria.disponueshem && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>{disponueshmeria.mesazh}</Alert>
              )}
              {disponueshmeria?.disponueshem && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>✅ Automjeti është i disponueshëm për këtë periudhë!</Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CalendarMonth sx={{ color: '#6C63FF' }} /> Periudha</Typography></Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Data tërheqjes" type="datetime-local" required value={form.data_terheqjes}
                      onChange={(e) => setForm({ ...form, data_terheqjes: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Data dorëzimit" type="datetime-local" required value={form.data_dorezimit}
                      onChange={(e) => setForm({ ...form, data_dorezimit: e.target.value })} InputLabelProps={{ shrink: true }} />
                  </Grid>

                  <Grid item xs={12}><Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><LocationOn sx={{ color: '#6C63FF' }} /> Vendndodhjet</Typography></Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Vendi i tërheqjes" required value={form.vendi_terheqjes}
                      onChange={(e) => setForm({ ...form, vendi_terheqjes: e.target.value })} placeholder="p.sh. Tiranë, Aeroporti" />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField fullWidth label="Vendi i dorëzimit" required value={form.vendi_dorezimit}
                      onChange={(e) => setForm({ ...form, vendi_dorezimit: e.target.value })} placeholder="p.sh. Durrës, Porti" />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth multiline rows={3} label="Shënime (opsionale)" value={form.shenime_gjendjeje}
                      onChange={(e) => setForm({ ...form, shenime_gjendjeje: e.target.value })} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting || !disponueshmeria?.disponueshem}
                      sx={{ py: 1.5, fontSize: '1.05rem', fontWeight: 700 }}>
                      {submitting ? <CircularProgress size={24} color="inherit" /> : checking ? 'Duke kontrolluar...' : 'Konfirmo Rezervimin'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingPage;
