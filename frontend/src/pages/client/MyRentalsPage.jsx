import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination
} from '@mui/material';
import { History, Receipt } from '@mui/icons-material';
import { qiraDhenieAPI } from '../../api/client';

const MyRentalsPage = () => {
  const [qiradheniet, setQiradheniet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(0);
  const [perFaqe, setPerFaqe] = useState(10);
  const [totali, setTotali] = useState(0);

  useEffect(() => {
    const ngarko = async () => {
      setLoading(true);
      try {
        const res = await qiraDhenieAPI.lista({ faqe: faqe + 1, per_faqe: perFaqe });
        setQiradheniet(res.data.te_dhena.qiradheniet);
        setTotali(res.data.te_dhena.totali);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    ngarko();
  }, [faqe, perFaqe]);

  const statusChip = (s) => {
    const map = { aktive: { color: 'success', label: 'Aktive' }, perfunduar: { color: 'default', label: 'Përfunduar' }, anuluar: { color: 'error', label: 'Anuluar' } };
    const c = map[s] || { color: 'default', label: s };
    return <Chip label={c.label} color={c.color} size="small" />;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History sx={{ color: '#6C63FF' }} /> Qirat e Mia
        </Typography>
        <Typography variant="body2" color="text.secondary">Historiku i qiradhënieve tuaja</Typography>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Automjeti</TableCell>
                <TableCell>Tërheqja</TableCell>
                <TableCell>Dorëzimi</TableCell>
                <TableCell>Çmimi</TableCell>
                <TableCell>Statusi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : qiradheniet.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Receipt sx={{ fontSize: 60, color: '#374151', mb: 1 }} />
                  <Typography color="text.secondary" variant="h6">Nuk keni qiradhënie ende</Typography>
                  <Typography variant="body2" color="text.secondary">Kërko automjete dhe bëj rezervimin e parë!</Typography>
                </TableCell></TableRow>
              ) : (
                qiradheniet.map((q) => (
                  <TableRow key={q.id} hover sx={{ '&:hover': { background: 'rgba(108,99,255,0.04)' } }}>
                    <TableCell><Typography fontWeight={600}>#{q.id}</Typography></TableCell>
                    <TableCell>
                      <Typography fontWeight={600} sx={{ color: '#6C63FF' }}>{q.automjeti?.targa}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.automjeti?.modeli}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(q.data_terheqjes).toLocaleDateString('sq-AL')}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.vendi_terheqjes}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{new Date(q.data_dorezimit).toLocaleDateString('sq-AL')}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.vendi_dorezimit}</Typography>
                    </TableCell>
                    <TableCell><Typography fontWeight={700} sx={{ color: '#10B981' }}>€{q.cmimi_total}</Typography></TableCell>
                    <TableCell>{statusChip(q.statusi)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {totali > 0 && (
          <TablePagination component="div" count={totali} page={faqe} onPageChange={(e, p) => setFaqe(p)}
            rowsPerPage={perFaqe} onRowsPerPageChange={(e) => { setPerFaqe(parseInt(e.target.value)); setFaqe(0); }}
            labelRowsPerPage="Rreshta:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} nga ${count}`} />
        )}
      </Card>
    </Box>
  );
};

export default MyRentalsPage;
