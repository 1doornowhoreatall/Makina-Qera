const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');

// Importo rrugët
const authRoutes = require('./routes/auth');
const automjeteRoutes = require('./routes/automjete');
const sigurimeRoutes = require('./routes/sigurime');
const klienteRoutes = require('./routes/kliente');
const qiraDhenieRoutes = require('./routes/qiradhenie');
const raporteRoutes = require('./routes/raporte');
const njoftimetRoutes = require('./routes/njoftimet');

// Importo middleware
const { trajtuesGabimesh, rrugaNukGjendet } = require('./middleware/errorHandler');

const app = express();

// Middleware bazë
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger dokumentim
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { background-color: #1a237e; }
    .swagger-ui .topbar .download-url-wrapper .select-label { color: #fff; }
  `,
  customSiteTitle: 'Makina Qera — API Dokumentim'
}));

// Rruga kryesore
app.get('/api', (req, res) => {
  res.json({
    sukses: true,
    mesazh: 'Mirë se vini në API-n e Makina Qera!',
    versioni: '1.0.0',
    dokumentimi: '/api-docs',
    endpoints: {
      autentikim: '/api/auth',
      automjete: '/api/automjete',
      sigurime: '/api/sigurime',
      kliente: '/api/kliente',
      qiradhenie: '/api/qiradhenie',
      raporte: '/api/raporte',
      njoftimet: '/api/njoftimet'
    }
  });
});

// Rrugët e API-së
app.use('/api/auth', authRoutes);
app.use('/api/automjete', automjeteRoutes);
app.use('/api/sigurime', sigurimeRoutes);
app.use('/api/kliente', klienteRoutes);
app.use('/api/qiradhenie', qiraDhenieRoutes);
app.use('/api/raporte', raporteRoutes);
app.use('/api/njoftimet', njoftimetRoutes);

// Trajtimi i gabimeve
app.use(rrugaNukGjendet);
app.use(trajtuesGabimesh);

module.exports = app;
