const request = require('supertest');
const app = require('../src/app');
const { sequelize, User, Automjet } = require('../src/models');

describe('Automjete API', () => {
  let adminToken;
  let klientToken;
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

    // Krijo klient
    await User.create({
      emri: 'Klient', mbiemri: 'Test',
      email: 'klient@test.com', password_hash: 'Klient123!',
      datelindja: '1995-01-01', nr_personal: 'KLT000001',
      telefoni: '+355690000001', roli: 'klient', email_verified: true
    });
    const klientRes = await request(app).post('/api/auth/hyrje')
      .send({ email: 'klient@test.com', password: 'Klient123!' });
    klientToken = klientRes.body.te_dhena.token;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  // ═══════════════════════════════════════
  // KRIJO AUTOMJET
  // ═══════════════════════════════════════
  describe('POST /api/automjete', () => {
    it('admin duhet të krijojë automjet me sukses', async () => {
      const res = await request(app)
        .post('/api/automjete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targa: 'AA 111 BB',
          modeli: 'Toyota Corolla',
          viti_prodhimit: 2022,
          nr_max_pasagjeresh: 5,
          tipi_motorrit: 'benzinë',
          tipi_kambios: 'automatike',
          kilometrazhi: 15000,
          cmimi_ditor: 35.00
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.targa).toBe('AA 111 BB');
      automjetId = res.body.te_dhena.id;
    });

    it('duhet të refuzojë targë dublikat', async () => {
      const res = await request(app)
        .post('/api/automjete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targa: 'AA 111 BB',
          modeli: 'Golf',
          viti_prodhimit: 2021,
          nr_max_pasagjeresh: 5,
          tipi_motorrit: 'naftë',
          tipi_kambios: 'manuale',
          kilometrazhi: 20000,
          cmimi_ditor: 30.00
        });

      expect(res.statusCode).toBe(409);
    });

    it('klienti nuk duhet të krijojë automjet', async () => {
      const res = await request(app)
        .post('/api/automjete')
        .set('Authorization', `Bearer ${klientToken}`)
        .send({
          targa: 'AA 222 CC',
          modeli: 'Test',
          viti_prodhimit: 2022,
          nr_max_pasagjeresh: 5,
          tipi_motorrit: 'benzinë',
          tipi_kambios: 'manuale',
          kilometrazhi: 1000,
          cmimi_ditor: 25.00
        });

      expect(res.statusCode).toBe(403);
    });

    it('duhet të refuzojë vit prodhimi i pavlefshëm', async () => {
      const res = await request(app)
        .post('/api/automjete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targa: 'AA 333 DD',
          modeli: 'Test',
          viti_prodhimit: 1950,
          nr_max_pasagjeresh: 5,
          tipi_motorrit: 'benzinë',
          tipi_kambios: 'manuale',
          kilometrazhi: 1000,
          cmimi_ditor: 25.00
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ═══════════════════════════════════════
  // LISTA E AUTOMJETEVE
  // ═══════════════════════════════════════
  describe('GET /api/automjete', () => {
    it('duhet të kthejë listën e automjeteve', async () => {
      const res = await request(app).get('/api/automjete');

      expect(res.statusCode).toBe(200);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.automjetet).toBeDefined();
      expect(res.body.te_dhena.automjetet.length).toBeGreaterThan(0);
    });

    it('duhet të filtrojë sipas modelit', async () => {
      const res = await request(app).get('/api/automjete?modeli=Toyota');

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.automjetet.every(a => 
        a.modeli.toLowerCase().includes('toyota')
      )).toBe(true);
    });

    it('duhet të filtrojë sipas tipit të motorrit', async () => {
      const res = await request(app).get('/api/automjete?tipi_motorrit=benzinë');

      expect(res.statusCode).toBe(200);
      res.body.te_dhena.automjetet.forEach(a => {
        expect(a.tipi_motorrit).toBe('benzinë');
      });
    });
  });

  // ═══════════════════════════════════════
  // DETAJET E AUTOMJETIT
  // ═══════════════════════════════════════
  describe('GET /api/automjete/:id', () => {
    it('duhet të kthejë detajet e automjetit', async () => {
      const res = await request(app).get(`/api/automjete/${automjetId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.id).toBe(automjetId);
      expect(res.body.te_dhena.targa).toBe('AA 111 BB');
    });

    it('duhet të kthejë 404 për ID që nuk ekziston', async () => {
      const res = await request(app).get('/api/automjete/99999');

      expect(res.statusCode).toBe(404);
    });
  });

  // ═══════════════════════════════════════
  // PËRDITËSO AUTOMJETIN
  // ═══════════════════════════════════════
  describe('PUT /api/automjete/:id', () => {
    it('admin duhet të përditësojë automjetin', async () => {
      const res = await request(app)
        .put(`/api/automjete/${automjetId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ kilometrazhi: 20000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.kilometrazhi).toBe(20000);
    });
  });

  // ═══════════════════════════════════════
  // FSHI AUTOMJETIN
  // ═══════════════════════════════════════
  describe('DELETE /api/automjete/:id', () => {
    it('admin duhet të fshijë automjetin', async () => {
      // Krijo automjet për fshirje
      const createRes = await request(app)
        .post('/api/automjete')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          targa: 'ZZ 999 ZZ',
          modeli: 'Për Fshirje',
          viti_prodhimit: 2020,
          nr_max_pasagjeresh: 5,
          tipi_motorrit: 'benzinë',
          tipi_kambios: 'manuale',
          kilometrazhi: 0,
          cmimi_ditor: 10.00
        });

      const res = await request(app)
        .delete(`/api/automjete/${createRes.body.te_dhena.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sukses).toBe(true);
    });
  });
});
