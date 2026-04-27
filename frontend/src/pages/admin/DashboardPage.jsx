import { useState, useEffect } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { DirectionsCar, People, Receipt, Security, TrendingUp, Warning } from '@mui/icons-material';
import StatCard from '../../components/StatCard';
import { raporteAPI } from '../../api/client';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ngarko = async () => {
      try {
        const res = await raporteAPI.statistika();
        setStats(res.data.te_dhena);
      } catch (err) {
        console.error('Gabim:', err);
      } finally {
        setLoading(false);
      }
    };
    ngarko();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#6C63FF' }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Titulli */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>
          Paneli Kryesor
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Mirë se vini! Ja një përmbledhje e sistemit.
        </Typography>
      </Box>

      {/* Statistikat kryesore */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Automjete Totale"
            value={stats?.automjete?.totali || 0}
            subtitle={`${stats?.automjete?.aktive || 0} aktive`}
            icon={<DirectionsCar />}
            color="#6C63FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Klientë"
            value={stats?.kliente?.totali || 0}
            subtitle="Të regjistruar"
            icon={<People />}
            color="#00D9FF"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Qiradhënie Aktive"
            value={stats?.qiradhenie?.aktive || 0}
            subtitle={`${stats?.qiradhenie?.perfunduara || 0} të përfunduara`}
            icon={<Receipt />}
            color="#10B981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Të Ardhura"
            value={`€${(stats?.qiradhenie?.te_ardhurat_totale || 0).toLocaleString('sq-AL')}`}
            subtitle="Totale"
            icon={<TrendingUp />}
            color="#F59E0B"
          />
        </Grid>
      </Grid>

      {/* Paralajmërime */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Sigurime që Skadojnë"
            value={stats?.sigurime?.qe_skadojne_30_dite || 0}
            subtitle="Brenda 30 ditëve"
            icon={<Warning />}
            color="#F59E0B"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Sigurime të Skaduara"
            value={stats?.sigurime?.te_skaduara || 0}
            subtitle="Kërkojnë rinovim"
            icon={<Security />}
            color="#EF4444"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
