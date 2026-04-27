import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, CircularProgress, TablePagination, Chip, IconButton, MenuItem,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid
} from '@mui/material';
import { Visibility, Edit } from '@mui/icons-material';
import { qiraDhenieAPI } from '../../api/client';

const RentalsPage = () => {
  const [qiradheniet, setQiradheniet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(0);
  const [perFaqe, setPerFaqe] = useState(10);
  const [totali, setTotali] = useState(0);
  const [filter, setFilter] = useState('');
  const [statusDialog, setStatusDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [shenime, setShenime] = useState('');

  const ngarko = async () => {
    setLoading(true);
    try {
      const res = await qiraDhenieAPI.lista({ faqe: faqe + 1, per_faqe: perFaqe, statusi: filter || undefined });
      setQiradheniet(res.data.te_dhena.qiradheniet);
      setTotali(res.data.te_dhena.totali);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { ngarko(); }, [faqe, perFaqe, filter]);

  const handleStatusUpdate = async () => {
    try {
      await qiraDhenieAPI.ndryshStatuisin(selectedId, { statusi: newStatus, shenime_gjendjeje: shenime });
      setStatusDialog(false);
      ngarko();
    } catch (err) { console.error(err); }
  };

  const statusChip = (s) => {
    const map = { aktive: { color: 'success', label: 'Aktive' }, perfunduar: { color: 'default', label: 'Përfunduar' }, anuluar: { color: 'error', label: 'Anuluar' } };
    const config = map[s] || { color: 'default', label: s };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>Qiradhëniet</Typography>
          <Typography variant="body2" color="text.secondary">Të gjitha qiradhëniet e sistemit</Typography>
        </Box>
        <TextField select size="small" value={filter} onChange={(e) => { setFilter(e.target.value); setFaqe(0); }}
          sx={{ minWidth: 150 }} label="Filtro statusin">
          <MenuItem value="">Të gjitha</MenuItem>
          <MenuItem value="aktive">Aktive</MenuItem>
          <MenuItem value="perfunduar">Përfunduar</MenuItem>
          <MenuItem value="anuluar">Anuluar</MenuItem>
        </TextField>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Automjeti</TableCell>
                <TableCell>Klienti</TableCell>
                <TableCell>Tërheqja</TableCell>
                <TableCell>Dorëzimi</TableCell>
                <TableCell>Çmimi</TableCell>
                <TableCell>Statusi</TableCell>
                <TableCell align="right">Veprime</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : qiradheniet.length === 0 ? (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography color="text.secondary">Nuk ka qiradhënie</Typography></TableCell></TableRow>
              ) : (
                qiradheniet.map((q) => (
                  <TableRow key={q.id} hover>
                    <TableCell><Typography fontWeight={600}>#{q.id}</Typography></TableCell>
                    <TableCell>
                      <Typography fontWeight={600} sx={{ color: '#6C63FF' }}>{q.automjeti?.targa}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.automjeti?.modeli}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{q.klienti?.emri} {q.klienti?.mbiemri}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.klienti?.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(q.data_terheqjes).toLocaleDateString('sq-AL')}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.vendi_terheqjes}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(q.data_dorezimit).toLocaleDateString('sq-AL')}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.vendi_dorezimit}</Typography>
                    </TableCell>
                    <TableCell><Typography fontWeight={700}>€{q.cmimi_total}</Typography></TableCell>
                    <TableCell>{statusChip(q.statusi)}</TableCell>
                    <TableCell align="right">
                      {q.statusi === 'aktive' && (
                        <IconButton size="small" sx={{ color: '#6C63FF' }} onClick={() => { setSelectedId(q.id); setNewStatus('perfunduar'); setShenime(''); setStatusDialog(true); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
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

      <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ndrysho Statusin e Qiradhënies</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField fullWidth select label="Statusi i ri" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <MenuItem value="aktive">Aktive</MenuItem>
                <MenuItem value="perfunduar">Përfunduar</MenuItem>
                <MenuItem value="anuluar">Anuluar</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Shënime gjendjeje" value={shenime} onChange={(e) => setShenime(e.target.value)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStatusDialog(false)}>Anulo</Button>
          <Button variant="contained" onClick={handleStatusUpdate}>Ruaj</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RentalsPage;
