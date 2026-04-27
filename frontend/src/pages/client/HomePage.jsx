import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  TextField, MenuItem, InputAdornment, CircularProgress, Pagination
} from '@mui/material';
import {
  Search, DirectionsCar, LocalGasStation, Speed, People as PeopleIcon,
  CalendarMonth, Settings
} from '@mui/icons-material';
import { automjeteAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const motorIcons = { 'benzinë': '⛽', 'naftë': '🛢️', 'elektrik': '⚡', 'hibrid': '🔋' };

const HomePage = () => {
  const { eshteHyrur } = useAuth();
  const navigate = useNavigate();
  const [automjete, setAutomjete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(1);
  const [faqeTotale, setFaqeTotale] = useState(1);
  const [filters, setFilters] = useState({ modeli: '', tipi_motorrit: '', tipi_kambios: '' });

  useEffect(() => {
    const ngarko = async () => {
      setLoading(true);
      try {
        const params = { faqe, per_faqe: 9 };
        if (filters.modeli) params.modeli = filters.modeli;
        if (filters.tipi_motorrit) params.tipi_motorrit = filters.tipi_motorrit;
        if (filters.tipi_kambios) params.tipi_kambios = filters.tipi_kambios;
        const res = await automjeteAPI.lista(params);
        setAutomjete(res.data.te_dhena.automjetet);
        setFaqeTotale(res.data.te_dhena.faqe_totale);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    ngarko();
  }, [faqe, filters]);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative', borderRadius: 4, overflow: 'hidden', mb: 4, p: { xs: 3, md: 5 },
        background: 'linear-gradient(135deg, rgba(108,99,255,0.15) 0%, rgba(0,217,255,0.08) 100%)',
        border: '1px solid rgba(108,99,255,0.15)'
      }}>
        <Box sx={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)', top: -50, right: -50 }} />
        <Typography variant="h3" fontWeight={800} sx={{ mb: 1, background: 'linear-gradient(135deg, #6C63FF, #00D9FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Gjeni automjetin perfekt 🚗
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, fontWeight: 400 }}>
          Zgjidhni nga flota jonë e automjeteve cilësore. Çmime konkurruese, sigurim i plotë, pa stress.
        </Typography>
      </Box>

      {/* Filtrat */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField fullWidth size="small" placeholder="Kërko sipas modelit..." value={filters.modeli}
                onChange={(e) => { setFilters({ ...filters, modeli: e.target.value }); setFaqe(1); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment> }} />
            </Grid>
            <Grid item xs={6} md={3.5}>
              <TextField fullWidth select size="small" label="Tipi motorrit" value={filters.tipi_motorrit}
                onChange={(e) => { setFilters({ ...filters, tipi_motorrit: e.target.value }); setFaqe(1); }}>
                <MenuItem value="">Të gjitha</MenuItem>
                <MenuItem value="benzinë">⛽ Benzinë</MenuItem>
                <MenuItem value="naftë">🛢️ Naftë</MenuItem>
                <MenuItem value="elektrik">⚡ Elektrik</MenuItem>
                <MenuItem value="hibrid">🔋 Hibrid</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} md={3.5}>
              <TextField fullWidth select size="small" label="Kambio" value={filters.tipi_kambios}
                onChange={(e) => { setFilters({ ...filters, tipi_kambios: e.target.value }); setFaqe(1); }}>
                <MenuItem value="">Të gjitha</MenuItem>
                <MenuItem value="manuale">Manuale</MenuItem>
                <MenuItem value="automatike">Automatike</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Lista e automjeteve */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6C63FF' }} />
        </Box>
      ) : automjete.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <DirectionsCar sx={{ fontSize: 80, color: '#374151', mb: 2 }} />
          <Typography variant="h5" color="text.secondary">Nuk u gjetën automjete</Typography>
          <Typography variant="body2" color="text.secondary">Provoni të ndryshoni filtrat e kërkimit</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {automjete.map((auto) => (
              <Grid item xs={12} sm={6} md={4} key={auto.id}>
                <Card sx={{
                  height: '100%', display: 'flex', flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 12px 40px rgba(108,99,255,0.15)' }
                }}>
                  {/* Car visual header */}
                  <Box sx={{
                    height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,217,255,0.05) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)', position: 'relative'
                  }}>
                    <DirectionsCar sx={{ fontSize: 80, color: '#6C63FF', opacity: 0.6 }} />
                    <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                      <Chip label={`${motorIcons[auto.tipi_motorrit] || ''} ${auto.tipi_motorrit}`} size="small"
                        sx={{ background: 'rgba(108,99,255,0.15)', color: '#B4B0FF', fontWeight: 600, fontSize: '0.7rem' }} />
                    </Box>
                    <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
                      <Chip label={auto.targa} size="small"
                        sx={{ background: 'rgba(0,217,255,0.15)', color: '#00D9FF', fontWeight: 700, fontFamily: 'monospace' }} />
                    </Box>
                  </Box>

                  <CardContent sx={{ flex: 1, p: 2.5 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{auto.modeli}</Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarMonth sx={{ fontSize: 16, color: '#9CA3AF' }} /><Typography variant="caption" color="text.secondary">{auto.viti_prodhimit}</Typography></Box></Grid>
                      <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Settings sx={{ fontSize: 16, color: '#9CA3AF' }} /><Typography variant="caption" color="text.secondary">{auto.tipi_kambios}</Typography></Box></Grid>
                      <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Speed sx={{ fontSize: 16, color: '#9CA3AF' }} /><Typography variant="caption" color="text.secondary">{auto.kilometrazhi?.toLocaleString()} km</Typography></Box></Grid>
                      <Grid item xs={6}><Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PeopleIcon sx={{ fontSize: 16, color: '#9CA3AF' }} /><Typography variant="caption" color="text.secondary">{auto.nr_max_pasagjeresh} vende</Typography></Box></Grid>
                    </Grid>
                  </CardContent>

                  <CardActions sx={{ p: 2.5, pt: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h5" fontWeight={800} sx={{ color: '#6C63FF', lineHeight: 1 }}>€{auto.cmimi_ditor}</Typography>
                      <Typography variant="caption" color="text.secondary">/ditë</Typography>
                    </Box>
                    <Button variant="contained" size="small"
                      onClick={() => eshteHyrur ? navigate(`/rezervo/${auto.id}`) : navigate('/hyrje')}>
                      Rezervo
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {faqeTotale > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={faqeTotale} page={faqe} onChange={(e, p) => setFaqe(p)}
                sx={{ '& .MuiPaginationItem-root': { color: '#9CA3AF', '&.Mui-selected': { background: '#6C63FF', color: '#fff' } } }} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default HomePage;
