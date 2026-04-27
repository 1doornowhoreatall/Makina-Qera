import { Box, Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#6C63FF', subtitle, trend }) => {
  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 40px ${color}22`,
      }
    }}>
      {/* Gradient accent bar */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />

      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.08em' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color, lineHeight: 1, mb: subtitle ? 0.5 : 0 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography variant="caption" sx={{ color: trend > 0 ? '#10B981' : '#EF4444', fontWeight: 600, display: 'flex', alignItems: 'center', mt: 0.5 }}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
          <Box sx={{
            width: 50, height: 50, borderRadius: '14px',
            background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color, fontSize: 26
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
