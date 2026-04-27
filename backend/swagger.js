const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Makina Qera — API Dokumentimi',
      version: '1.0.0',
      description: `
## Sistemi Dixhital i Menaxhimit të Qiradhënies së Automjeteve

API RESTful për menaxhimin e automjeteve, sigurimeve, klientëve dhe qiradhënieve.

### Autentikim
Të gjitha endpoints-et e mbrojtura kërkojnë JWT token në header:
\`Authorization: Bearer <token>\`

### Rolet
- **Admin**: Akseson të gjithë funksionalitetin
- **Klient**: Akseson profilin, kërkon automjete, bën rezervime
      `,
      contact: {
        name: 'Makina Qera',
        email: 'info@makinaqera.al'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveri i zhvillimit'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Vendos JWT token-in tuaj'
        }
      }
    },
    tags: [
      { name: 'Autentikim', description: 'Regjistrim, hyrje, profil' },
      { name: 'Automjete', description: 'Menaxhimi i automjeteve' },
      { name: 'Sigurime', description: 'Menaxhimi i sigurimeve' },
      { name: 'Klientë', description: 'Menaxhimi i klientëve' },
      { name: 'Qiradhënie', description: 'Menaxhimi i qiradhënieve' },
      { name: 'Raporte', description: 'Raporte dhe statistika' },
      { name: 'Njoftimet', description: 'Njoftimet in-app' }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
