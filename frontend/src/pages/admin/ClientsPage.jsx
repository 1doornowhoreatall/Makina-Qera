import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, CircularProgress, TablePagination, Chip,
  TextField, InputAdornment
} from '@mui/material';
import { Search, People } from '@mui/icons-material';
import { klienteAPI } from '../../api/client';

const ClientsPage = () => {
  const [kliente, setKliente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqe, setFaqe] = useState(0);
  const [perFaqe, setPerFaqe] = useState(10);
  const [totali, setTotali] = useState(0);
  const [kerkim, setKerkim] = useState('');

  useEffect(() => {
    const ngarko = async () => {
      setLoading(true);
      try {
        const res = await klienteAPI.lista({ faqe: faqe + 1, per_faqe: perFaqe, emri: kerkim || undefined });
        setKliente(res.data.te_dhena.klientet);
        setTotali(res.data.te_dhena.totali);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    ngarko();
  }, [faqe, perFaqe, kerkim]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Klientët</Typography>
        <Typography variant="body2" color="text.secondary">Lista e klientëve të regjistruar</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField fullWidth placeholder="Kërko sipas emrit..." size="small" value={kerkim}
            onChange={(e) => { setKerkim(e.target.value); setFaqe(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#9CA3AF' }} /></InputAdornment> }} />
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Emri</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefoni</TableCell>
                <TableCell>Nr. Personal</TableCell>
                <TableCell>Email Verifikuar</TableCell>
                <TableCell>Qiradhënie</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={32} /></TableCell></TableRow>
              ) : kliente.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <People sx={{ fontSize: 48, color: '#374151', mb: 1 }} />
                  <Typography color="text.secondary">Nuk ka klientë</Typography>
                </TableCell></TableRow>
              ) : (
                kliente.map((k) => (
                  <TableRow key={k.id} hover>
                    <TableCell><Typography fontWeight={600}>{k.emri} {k.mbiemri}</Typography></TableCell>
                    <TableCell>{k.email}</TableCell>
                    <TableCell>{k.telefoni}</TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{k.nr_personal}</Typography></TableCell>
                    <TableCell>
                      <Chip label={k.email_verified ? 'Po' : 'Jo'} color={k.email_verified ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell><Chip label={k.qiradheniet?.length || 0} size="small" variant="outlined" /></TableCell>
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
    </Box>
  );
};

export default ClientsPage;
