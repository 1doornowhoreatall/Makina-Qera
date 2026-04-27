import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, CircularProgress,
  TablePagination, InputAdornment, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Search, DirectionsCar, Close } from '@mui/icons-material';
import { automjeteAPI } from '../../api/client';

const tipiMotorrit = ['benzinë', 'naftë', 'elektrik', 'hibrid'];
const tipiKambios = ['manuale', 'automatike'];
const statusOptions = ['aktiv', 'ne_mirembajtje', 'jashte_perdorimit'];

const emptyForm = {
  targa: '', modeli: '', viti_prodhimit: new Date().getFullYear(),
  nr_max_pasagjeresh: 5, tipi_motorrit: 'benzinë', tipi_kambios: 'manuale',
  kilometrazhi: 0, cmimi_ditor: 30, statusi: 'aktiv'
};

const VehiclesPage = () => {
  const [automjete, setAutomjete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(0);
  const [perFaqe, setPerFaqe] = useState(10);
  const [totali, setTotali] = useState(0);
  const [kerkim, setKerkim] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const ngarko = async () => {
    setLoading(true);
    try {
      const res = await automjeteAPI.lista({ faqe: faqe + 1, per_faqe: perFaqe, modeli: kerkim || undefined });
      setAutomjete(res.data.te_dhena.automjetet);
      setTotali(res.data.te_dhena.totali);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { ngarko(); }, [faqe, perFaqe, kerkim]);

  const handleSubmit = async () => {
    setError('');
    try {
      if (editMode) {
        await automjeteAPI.perditeso(editId, form);
      } else {
        await automjeteAPI.krijo(form);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      ngarko();
    } catch (err) {
      setError(err.response?.data?.mesazh || err.response?.data?.gabime?.map(g => g.mesazh).join(', ') || 'Gabim');
    }
  };

  const handleEdit = (auto) => {
    setForm({
      targa: auto.targa, modeli: auto.modeli, viti_prodhimit: auto.viti_prodhimit,
      nr_max_pasagjeresh: auto.nr_max_pasagjeresh, tipi_motorrit: auto.tipi_motorrit,
      tipi_kambios: auto.tipi_kambios, kilometrazhi: auto.kilometrazhi,
      cmimi_ditor: auto.cmimi_ditor, statusi: auto.statusi
    });
    setEditId(auto.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    try {
      await automjeteAPI.fshi(deleteId);
      setDeleteDialogOpen(false);
      ngarko();
    } catch (err) {
      setError(err.response?.data?.mesazh || 'Gabim gjatë fshirjes');
    }
  };

  const statusChip = (s) => {
    const colors = { aktiv: 'success', ne_mirembajtje: 'warning', jashte_perdorimit: 'error' };
    const labels = { aktiv: 'Aktiv', ne_mirembajtje: 'Mirëmbajtje', jashte_perdorimit: 'Jashtë' };
    return <Chip label={labels[s] || s} color={colors[s] || 'default'} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Automjetet</Typography>
          <Typography variant="body2" color="text.secondary">Menaxhoni flotën e automjeteve</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setForm(emptyForm); setEditMode(false); setError(''); setDialogOpen(true); }}>
          Shto Automjet
        </Button>
      </Box>

      {/* Kërkim */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <TextField fullWidth placeholder="Kërko sipas modelit..." size="small" value={kerkim}
            onChange={(e) => { setKerkim(e.target.value); setFaqe(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Targa</TableCell>
                <TableCell>Modeli</TableCell>
                <TableCell>Viti</TableCell>
                <TableCell>Motori</TableCell>
                <TableCell>Kambio</TableCell>
                <TableCell>Km</TableCell>
                <TableCell>€/Ditë</TableCell>
                <TableCell>Statusi</TableCell>
                <TableCell align="right">Veprime</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}><CircularProgress size={32} sx={{ color: '#6C63FF' }} /></TableCell></TableRow>
              ) : automjete.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <DirectionsCar sx={{ fontSize: 48, color: '#374151', mb: 1. }} />
                  <Typography color="text.secondary">Nuk ka automjete</Typography>
                </TableCell></TableRow>
              ) : (
                automjete.map((a) => (
                  <TableRow key={a.id} hover sx={{ '&:hover': { background: 'rgba(108,99,255,0.04)' } }}>
                    <TableCell><Typography fontWeight={700} sx={{ color: '#6C63FF' }}>{a.targa}</Typography></TableCell>
                    <TableCell>{a.modeli}</TableCell>
                    <TableCell>{a.viti_prodhimit}</TableCell>
                    <TableCell><Chip label={a.tipi_motorrit} size="small" variant="outlined" /></TableCell>
                    <TableCell>{a.tipi_kambios}</TableCell>
                    <TableCell>{a.kilometrazhi?.toLocaleString()}</TableCell>
                    <TableCell><Typography fontWeight={600}>€{a.cmimi_ditor}</Typography></TableCell>
                    <TableCell>{statusChip(a.statusi)}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edito"><IconButton size="small" onClick={() => handleEdit(a)} sx={{ color: '#6C63FF' }}><Edit fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Fshi"><IconButton size="small" onClick={() => { setDeleteId(a.id); setDeleteDialogOpen(true); }} sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totali} page={faqe} onPageChange={(e, p) => setFaqe(p)}
          rowsPerPage={perFaqe} onRowsPerPageChange={(e) => { setPerFaqe(parseInt(e.target.value)); setFaqe(0); }}
          labelRowsPerPage="Rreshta për faqe:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} nga ${count}`} />
      </Card>

      {/* Dialog Shto/Edito */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>{editMode ? 'Edito Automjetin' : 'Shto Automjet të Ri'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={6}><TextField fullWidth label="Targa" value={form.targa} onChange={(e) => setForm({ ...form, targa: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Modeli" value={form.modeli} onChange={(e) => setForm({ ...form, modeli: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Viti" type="number" value={form.viti_prodhimit} onChange={(e) => setForm({ ...form, viti_prodhimit: parseInt(e.target.value) })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Pasagjerë" type="number" value={form.nr_max_pasagjeresh} onChange={(e) => setForm({ ...form, nr_max_pasagjeresh: parseInt(e.target.value) })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Km" type="number" value={form.kilometrazhi} onChange={(e) => setForm({ ...form, kilometrazhi: parseInt(e.target.value) })} /></Grid>
            <Grid item xs={4}><TextField fullWidth select label="Motori" value={form.tipi_motorrit} onChange={(e) => setForm({ ...form, tipi_motorrit: e.target.value })}>{tipiMotorrit.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField fullWidth select label="Kambio" value={form.tipi_kambios} onChange={(e) => setForm({ ...form, tipi_kambios: e.target.value })}>{tipiKambios.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}</TextField></Grid>
            <Grid item xs={4}><TextField fullWidth label="€/Ditë" type="number" value={form.cmimi_ditor} onChange={(e) => setForm({ ...form, cmimi_ditor: parseFloat(e.target.value) })} /></Grid>
            {editMode && (
              <Grid item xs={12}><TextField fullWidth select label="Statusi" value={form.statusi} onChange={(e) => setForm({ ...form, statusi: e.target.value })}>{statusOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField></Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9CA3AF' }}>Anulo</Button>
          <Button variant="contained" onClick={handleSubmit}>{editMode ? 'Ruaj' : 'Shto'}</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Fshirje */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Konfirmoni fshirjen</DialogTitle>
        <DialogContent><Typography>Jeni i sigurt që doni ta fshini këtë automjet?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Anulo</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Fshi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesPage;
