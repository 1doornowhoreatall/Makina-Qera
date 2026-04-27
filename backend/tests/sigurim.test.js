const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Automjet, Sigurim } = require('../src/models');

describe('Sigurime API', () => {
  let adminToken;
  let automjetId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Krijo admin
    await User.create({
      emri: 'Admin', mbiemri: 'Test',
      email: 'admin@test.com', password_hash: 'Admin123!',
      datelindja: '1985-01-01', nr_personal: 'ADM000001',
      telefoni: '+355690000000', roli: 'admin', email_verified: true
    });
    const adminRes = await request(app).post('/api/auth/hyrje')
      .send({ email: 'admin@test.com', password: 'Admin123!' });
    adminToken = adminRes.body.te_dhena.token;

    // Krijo automjet
    const automjet = await Automjet.create({
      targa: 'AA 111 BB', modeli: 'Test Car',
      viti_prodhimit: 2022, nr_max_pasagjeresh: 5,
      tipi_motorrit: 'benzinë', tipi_kambios: 'manuale',
      kilometrazhi: 10000, cmimi_ditor: 30.00
    });
    automjetId = automjet.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let sigurimId;

  describe('POST /api/sigurime', () => {
    it('duhet të krijojë sigurim me sukses', async () => {
      const res = await request(app)
        .post('/api/sigurime')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          automjet_id: automjetId,
          emri_shoqerise: 'Sigal UNIQA Group',
          data_fillimit: '2026-01-01',
          data_mbarimit: '2026-12-31',
          kosto: 350.00
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.emri_shoqerise).toBe('Sigal UNIQA Group');
      sigurimId = res.body.te_dhena.id;
    });

    it('duhet të refuzojë kur automjeti nuk ekziston', async () => {
      const res = await request(app)
        .post('/api/sigurime')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          automjet_id: 99999,
          emri_shoqerise: 'Test',
          data_fillimit: '2026-01-01',
          data_mbarimit: '2026-12-31',
          kosto: 100
        });

      expect(res.statusCode).toBe(404);
    });

    it('duhet të refuzojë kur data_mbarimit < data_fillimit', async () => {
      const res = await request(app)
        .post('/api/sigurime')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          automjet_id: automjetId,
          emri_shoqerise: 'Test',
          data_fillimit: '2026-12-31',
          data_mbarimit: '2026-01-01',
          kosto: 100
        });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/sigurime', () => {
    it('duhet të kthejë listën e sigurimeve', async () => {
      const res = await request(app)
        .get('/api/sigurime')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.sigurimet.length).toBeGreaterThan(0);
    });

    it('duhet të filtrojë sipas automjet_id', async () => {
      const res = await request(app)
        .get(`/api/sigurime?automjet_id=${automjetId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      res.body.te_dhena.sigurimet.forEach(s => {
        expect(s.automjet_id).toBe(automjetId);
      });
    });
  });

  describe('GET /api/sigurime/qe-skadojne', () => {
    it('duhet të kthejë sigurimet që skadojnë', async () => {
      const res = await request(app)
        .get('/api/sigurime/qe-skadojne?dite=365')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.sigurimet).toBeDefined();
    });
  });

  describe('PUT /api/sigurime/:id', () => {
    it('duhet të përditësojë sigurimin', async () => {
      const res = await request(app)
        .put(`/api/sigurime/${sigurimId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ kosto: 400.00 });

      expect(res.statusCode).toBe(200);
      expect(parseFloat(res.body.te_dhena.kosto)).toBe(400.00);
    });
  });

  describe('DELETE /api/sigurime/:id', () => {
    it('duhet të fshijë sigurimin', async () => {
      // Krijo sigurim për fshirje
      const sig = await Sigurim.create({
        automjet_id: automjetId,
        emri_shoqerise: 'Për Fshirje',
        data_fillimit: '2025-01-01',
        data_mbarimit: '2025-12-31',
        kosto: 100
      });

      const res = await request(app)
        .delete(`/api/sigurime/${sig.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sukses).toBe(true);
    });
  });
});
