import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, MenuItem, CircularProgress,
  TablePagination, Alert
} from '@mui/material';
import { Add, Edit, Delete, Warning, Close } from '@mui/icons-material';
import { sigurimeAPI, automjeteAPI } from '../../api/client';

const InsurancePage = () => {
  const [sigurime, setSigurime] = useState([]);
  const [automjete, setAutomjete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(0);
  const [perFaqe, setPerFaqe] = useState(10);
  const [totali, setTotali] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ automjet_id: '', emri_shoqerise: '', data_fillimit: '', data_mbarimit: '', kosto: '' });
  const [qeSkadojne, setQeSkadojne] = useState([]);

  const ngarko = async () => {
    setLoading(true);
    try {
      const [sigRes, autoRes, skadRes] = await Promise.all([
        sigurimeAPI.lista({ faqe: faqe + 1, per_faqe: perFaqe }),
        automjeteAPI.lista({ per_faqe: 100 }),
        sigurimeAPI.qeSkadojne(30)
      ]);
      setSigurime(sigRes.data.te_dhena.sigurimet);
      setTotali(sigRes.data.te_dhena.totali);
      setAutomjete(autoRes.data.te_dhena.automjetet);
      setQeSkadojne(skadRes.data.te_dhena.sigurimet);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { ngarko(); }, [faqe, perFaqe]);

  const handleSubmit = async () => {
    setError('');
    try {
      if (editMode) {
        await sigurimeAPI.perditeso(editId, form);
      } else {
        await sigurimeAPI.krijo(form);
      }
      setDialogOpen(false);
      ngarko();
    } catch (err) {
      setError(err.response?.data?.mesazh || 'Gabim');
    }
  };

  const handleEdit = (s) => {
    setForm({
      automjet_id: s.automjet_id, emri_shoqerise: s.emri_shoqerise,
      data_fillimit: s.data_fillimit, data_mbarimit: s.data_mbarimit, kosto: s.kosto
    });
    setEditId(s.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Jeni i sigurt?')) {
      await sigurimeAPI.fshi(id);
      ngarko();
    }
  };

  const statusSigurimi = (s) => {
    const sot = new Date();
    const mbarimi = new Date(s.data_mbarimit);
    const fillimi = new Date(s.data_fillimit);
    if (mbarimi < sot) return <Chip label="I skaduar" color="error" size="small" />;
    const dite = Math.ceil((mbarimi - sot) / 86400000);
    if (dite <= 30) return <Chip label={`Skadon për ${dite} ditë`} color="warning" size="small" />;
    if (fillimi <= sot) return <Chip label="Aktiv" color="success" size="small" />;
    return <Chip label="I ardhshëm" size="small" variant="outlined" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Sigurimet</Typography>
          <Typography variant="body2" color="text.secondary">Menaxhoni sigurimet e automjeteve</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => { setForm({ automjet_id: '', emri_shoqerise: '', data_fillimit: '', data_mbarimit: '', kosto: '' }); setEditMode(false); setError(''); setDialogOpen(true); }}>
          Shto Sigurim
        </Button>
      </Box>

      {qeSkadojne.length > 0 && (
        <Alert severity="warning" icon={<Warning />} sx={{ mb: 3, borderRadius: 2, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
          <strong>{qeSkadojne.length} sigurime</strong> skadojnë brenda 30 ditëve. Kontrolloni dhe rinovoni.
        </Alert>
      )}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Automjeti</TableCell>
                <TableCell>Shoqëria</TableCell>
                <TableCell>Fillimi</TableCell>
                <TableCell>Mbarimi</TableCell>
                <TableCell>Kosto (€)</TableCell>
                <TableCell>Statusi</TableCell>
                <TableCell align="right">Veprime</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : sigurime.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Nuk ka sigurime</Typography></TableCell></TableRow>
              ) : (
                sigurime.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell><Typography fontWeight={600}>{s.automjeti?.targa}</Typography><Typography variant="caption" color="text.secondary">{s.automjeti?.modeli}</Typography></TableCell>
                    <TableCell>{s.emri_shoqerise}</TableCell>
                    <TableCell>{new Date(s.data_fillimit).toLocaleDateString('sq-AL')}</TableCell>
                    <TableCell>{new Date(s.data_mbarimit).toLocaleDateString('sq-AL')}</TableCell>
                    <TableCell><Typography fontWeight={600}>€{s.kosto}</Typography></TableCell>
                    <TableCell>{statusSigurimi(s)}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(s)} sx={{ color: '#6C63FF' }}><Edit fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => handleDelete(s.id)} sx={{ color: '#EF4444' }}><Delete fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totali} page={faqe} onPageChange={(e, p) => setFaqe(p)}
          rowsPerPage={perFaqe} onRowsPerPageChange={(e) => { setPerFaqe(parseInt(e.target.value)); setFaqe(0); }}
          labelRowsPerPage="Rreshta:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} nga ${count}`} />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight={700}>{editMode ? 'Edito Sigurimin' : 'Shto Sigurim'}</Typography>
          <IconButton onClick={() => setDialogOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth select label="Automjeti" value={form.automjet_id} onChange={(e) => setForm({ ...form, automjet_id: e.target.value })}>
                {automjete.map(a => <MenuItem key={a.id} value={a.id}>{a.targa} — {a.modeli}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Shoqëria e sigurimit" value={form.emri_shoqerise} onChange={(e) => setForm({ ...form, emri_shoqerise: e.target.value })} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Data fillimit" type="date" value={form.data_fillimit} onChange={(e) => setForm({ ...form, data_fillimit: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Data mbarimit" type="date" value={form.data_mbarimit} onChange={(e) => setForm({ ...form, data_mbarimit: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Kosto (€)" type="number" value={form.kosto} onChange={(e) => setForm({ ...form, kosto: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9CA3AF' }}>Anulo</Button>
          <Button variant="contained" onClick={handleSubmit}>{editMode ? 'Ruaj' : 'Shto'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InsurancePage;
