import { useState, useEffect } from 'react';
import { IconButton, Badge, Popover, Box, Typography, List, ListItem, ListItemText, Button, Divider, Chip } from '@mui/material';
import { Notifications, NotificationsActive, CheckCircle } from '@mui/icons-material';
import { njoftimetAPI } from '../api/client';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [njoftimet, setNjoftimet] = useState([]);
  const [palexuara, setPalexuara] = useState(0);

  const ngarkoNjoftimet = async () => {
    try {
      const res = await njoftimetAPI.lista({ per_faqe: 10 });
      setNjoftimet(res.data.te_dhena.njoftimet);
      setPalexuara(res.data.te_dhena.palexuara);
    } catch (err) {
      console.error('Gabim gjatë ngarkimit të njoftimeve');
    }
  };

  useEffect(() => {
    ngarkoNjoftimet();
    const interval = setInterval(ngarkoNjoftimet, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
    ngarkoNjoftimet();
  };

  const handleLexo = async (id) => {
    try {
      await njoftimetAPI.shenioLexuar(id);
      ngarkoNjoftimet();
    } catch (err) { }
  };

  const handleLexoTeGjitha = async () => {
    try {
      await njoftimetAPI.lexoTeGjitha();
      ngarkoNjoftimet();
    } catch (err) { }
  };

  const tipiColor = {
    rezervim: '#10B981',
    sigurim: '#F59E0B',
    sistem: '#6C63FF',
    paralajmerim: '#EF4444'
  };

  return (
    <>
      <IconButton onClick={handleOpen} size="small" sx={{ color: '#9CA3AF' }}>
        <Badge badgeContent={palexuara} color="error" max={9}>
          {palexuara > 0 ? <NotificationsActive sx={{ animation: 'pulse 2s infinite' }} /> : <Notifications />}
        </Badge>
      </IconButton>

      <Popover anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { width: 360, maxHeight: 440, background: 'rgba(17,24,39,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 3 } }}>
        
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight={700}>Njoftimet</Typography>
          {palexuara > 0 && (
            <Button size="small" onClick={handleLexoTeGjitha} startIcon={<CheckCircle sx={{ fontSize: 16 }} />}
              sx={{ fontSize: '0.75rem', color: '#6C63FF' }}>
              Lexo të gjitha
            </Button>
          )}
        </Box>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        
        <List sx={{ p: 0, maxHeight: 350, overflow: 'auto' }}>
          {njoftimet.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Nuk ka njoftime</Typography>
            </Box>
          ) : (
            njoftimet.map((n) => (
              <ListItem key={n.id} onClick={() => !n.lexuar && handleLexo(n.id)}
                sx={{ cursor: !n.lexuar ? 'pointer' : 'default', background: !n.lexuar ? 'rgba(108,99,255,0.05)' : 'transparent',
                  borderLeft: `3px solid ${tipiColor[n.tipi] || '#6C63FF'}`, '&:hover': { background: 'rgba(108,99,255,0.08)' } }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={n.lexuar ? 400 : 700} sx={{ flex: 1 }}>{n.titulli}</Typography>
                      {!n.lexuar && <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#6C63FF', flexShrink: 0 }} />}
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                      {n.mesazhi?.substring(0, 80)}{n.mesazhi?.length > 80 ? '...' : ''}
                    </Typography>
                  }
                />
              </ListItem>
            ))
          )}
        </List>
      </Popover>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </>
  );
};

export default NotificationBell;
