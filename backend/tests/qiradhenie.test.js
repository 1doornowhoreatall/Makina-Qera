const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Automjet, Sigurim, Qiradhenie } = require('../src/models');

describe('Qiradhënie API', () => {
  let adminToken, klientToken, klientId;
  let automjetId, automjet2Id;

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

    // Krijo klient
    const klient = await User.create({
      emri: 'Klient', mbiemri: 'Test',
      email: 'klient@test.com', password_hash: 'Klient123!',
      datelindja: '1995-01-01', nr_personal: 'KLT000001',
      telefoni: '+355690000001', roli: 'klient', email_verified: true
    });
    klientId = klient.id;

    const klientRes = await request(app).post('/api/auth/hyrje')
      .send({ email: 'klient@test.com', password: 'Klient123!' });
    klientToken = klientRes.body.te_dhena.token;

    // Krijo automjete
    const auto1 = await Automjet.create({
      targa: 'AA 111 BB', modeli: 'Toyota Corolla',
      viti_prodhimit: 2022, nr_max_pasagjeresh: 5,
      tipi_motorrit: 'benzinë', tipi_kambios: 'automatike',
      kilometrazhi: 15000, cmimi_ditor: 35.00
    });
    automjetId = auto1.id;

    const auto2 = await Automjet.create({
      targa: 'AA 222 CC', modeli: 'VW Golf',
      viti_prodhimit: 2021, nr_max_pasagjeresh: 5,
      tipi_motorrit: 'naftë', tipi_kambios: 'manuale',
      kilometrazhi: 28000, cmimi_ditor: 30.00
    });
    automjet2Id = auto2.id;

    // Krijo sigurim aktiv për auto1
    await Sigurim.create({
      automjet_id: automjetId,
      emri_shoqerise: 'Sigal',
      data_fillimit: '2025-01-01',
      data_mbarimit: '2027-12-31',
      kosto: 350
    });

    // Auto2 nuk ka sigurim (për testim)
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let qiraDhenieId;

  describe('POST /api/qiradhenie', () => {
    it('klienti duhet të krijojë qiradhënie me sukses', async () => {
      const sot = new Date();
      const pas5Diteve = new Date(sot.getTime() + 5 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/qiradhenie')
        .set('Authorization', `Bearer ${klientToken}`)
        .send({
          automjet_id: automjetId,
          data_terheqjes: sot.toISOString(),
          vendi_terheqjes: 'Tiranë, Qendra',
          data_dorezimit: pas5Diteve.toISOString(),
          vendi_dorezimit: 'Tiranë, Qendra'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.cmimi_total).toBeDefined();
      expect(parseFloat(res.body.te_dhena.cmimi_total)).toBeGreaterThan(0);
      qiraDhenieId = res.body.te_dhena.id;
    });

    it('duhet të refuzojë kur ka konflikt periudhash', async () => {
      const sot = new Date();
      const pas3Diteve = new Date(sot.getTime() + 3 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/qiradhenie')
        .set('Authorization', `Bearer ${klientToken}`)
        .send({
          automjet_id: automjetId,
          data_terheqjes: sot.toISOString(),
          vendi_terheqjes: 'Durrës',
          data_dorezimit: pas3Diteve.toISOString(),
          vendi_dorezimit: 'Durrës'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.sukses).toBe(false);
    });

    it('duhet të refuzojë kur sigurimi nuk është aktiv', async () => {
      const sot = new Date();
      const pas5Diteve = new Date(sot.getTime() + 5 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/qiradhenie')
        .set('Authorization', `Bearer ${klientToken}`)
        .send({
          automjet_id: automjet2Id,
          data_terheqjes: sot.toISOString(),
          vendi_terheqjes: 'Tiranë',
          data_dorezimit: pas5Diteve.toISOString(),
          vendi_dorezimit: 'Tiranë'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.mesazh).toContain('sigurim');
    });

    it('duhet të refuzojë pa autentikim', async () => {
      const res = await request(app)
        .post('/api/qiradhenie')
        .send({
          automjet_id: automjetId,
          data_terheqjes: new Date().toISOString(),
          vendi_terheqjes: 'Test',
          data_dorezimit: new Date(Date.now() + 86400000).toISOString(),
          vendi_dorezimit: 'Test'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/qiradhenie', () => {
    it('duhet të kthejë listën e qiradhënieve', async () => {
      const res = await request(app)
        .get('/api/qiradhenie')
        .set('Authorization', `Bearer ${klientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.qiradheniet.length).toBeGreaterThan(0);
    });

    it('klienti duhet të shohë vetëm qiradhëniet e tij', async () => {
      const res = await request(app)
        .get('/api/qiradhenie')
        .set('Authorization', `Bearer ${klientToken}`);

      expect(res.statusCode).toBe(200);
      res.body.te_dhena.qiradheniet.forEach(q => {
        expect(q.klient_id).toBe(klientId);
      });
    });
  });

  describe('GET /api/qiradhenie/kontrollo-disponueshmerine', () => {
    it('duhet të kontrollojë disponueshmërinë', async () => {
      const pas10 = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];
      const pas15 = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];

      const res = await request(app)
        .get(`/api/qiradhenie/kontrollo-disponueshmerine?automjet_id=${automjetId}&data_fillimit=${pas10}&data_mbarimit=${pas15}`)
        .set('Authorization', `Bearer ${klientToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.disponueshem).toBeDefined();
    });
  });

  describe('PUT /api/qiradhenie/:id/statusi', () => {
    it('admin duhet të ndryshojë statusin', async () => {
      const res = await request(app)
        .put(`/api/qiradhenie/${qiraDhenieId}/statusi`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ statusi: 'perfunduar', shenime_gjendjeje: 'Dorëzim pa probleme' });

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.statusi).toBe('perfunduar');
    });
  });
});
