const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

describe('Autentikim API', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  let token;
  let adminToken;

  // ═══════════════════════════════════════
  // REGJISTRIM
  // ═══════════════════════════════════════
  describe('POST /api/auth/regjistrim', () => {
    it('duhet të regjistrojë një përdorues të ri me sukses', async () => {
      const res = await request(app)
        .post('/api/auth/regjistrim')
        .send({
          emri: 'Andi',
          mbiemri: 'Hoxha',
          email: 'andi@test.com',
          password: 'Password123',
          datelindja: '2000-01-15',
          nr_personal: 'I12345678A',
          telefoni: '+355691234567'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.token).toBeDefined();
      expect(res.body.te_dhena.perdoruesi.email).toBe('andi@test.com');
      expect(res.body.te_dhena.perdoruesi.roli).toBe('klient');
      expect(res.body.te_dhena.perdoruesi.password_hash).toBeUndefined();

      token = res.body.te_dhena.token;
    });

    it('duhet të refuzojë regjistrim me email dublikat', async () => {
      const res = await request(app)
        .post('/api/auth/regjistrim')
        .send({
          emri: 'Test',
          mbiemri: 'User',
          email: 'andi@test.com',
          password: 'Password123',
          datelindja: '2000-01-15',
          nr_personal: 'J99999999Z',
          telefoni: '+355699999999'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.sukses).toBe(false);
    });

    it('duhet të refuzojë regjistrim nëse mosha < 18', async () => {
      const today = new Date();
      const underAge = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      
      const res = await request(app)
        .post('/api/auth/regjistrim')
        .send({
          emri: 'Minor',
          mbiemri: 'Test',
          email: 'minor@test.com',
          password: 'Password123',
          datelindja: underAge.toISOString().split('T')[0],
          nr_personal: 'X11111111X',
          telefoni: '+355690000000'
        });

      expect(res.statusCode).toBe(500);
    });

    it('duhet të refuzojë regjistrim pa email', async () => {
      const res = await request(app)
        .post('/api/auth/regjistrim')
        .send({
          emri: 'Test',
          mbiemri: 'User',
          password: 'Password123',
          datelindja: '2000-01-15',
          nr_personal: 'K11111111K',
          telefoni: '+355690000001'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.gabime).toBeDefined();
    });

    it('duhet të refuzojë fjalëkalim të dobët', async () => {
      const res = await request(app)
        .post('/api/auth/regjistrim')
        .send({
          emri: 'Test',
          mbiemri: 'User',
          email: 'weak@test.com',
          password: '123',
          datelindja: '2000-01-15',
          nr_personal: 'L22222222L',
          telefoni: '+355690000002'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  // ═══════════════════════════════════════
  // HYRJE (LOGIN)
  // ═══════════════════════════════════════
  describe('POST /api/auth/hyrje', () => {
    it('duhet të hyjë me sukses me kredenciale të sakta', async () => {
      const res = await request(app)
        .post('/api/auth/hyrje')
        .send({
          email: 'andi@test.com',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.token).toBeDefined();
      expect(res.body.te_dhena.perdoruesi.emri).toBe('Andi');
    });

    it('duhet të refuzojë me fjalëkalim të gabuar', async () => {
      const res = await request(app)
        .post('/api/auth/hyrje')
        .send({
          email: 'andi@test.com',
          password: 'GabimPassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.sukses).toBe(false);
    });

    it('duhet të refuzojë me email që nuk ekziston', async () => {
      const res = await request(app)
        .post('/api/auth/hyrje')
        .send({
          email: 'nuk_ekziston@test.com',
          password: 'Password123'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // ═══════════════════════════════════════
  // PROFILI
  // ═══════════════════════════════════════
  describe('GET /api/auth/profili', () => {
    it('duhet të kthejë profilin me token valid', async () => {
      const res = await request(app)
        .get('/api/auth/profili')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.sukses).toBe(true);
      expect(res.body.te_dhena.email).toBe('andi@test.com');
    });

    it('duhet të refuzojë pa token', async () => {
      const res = await request(app)
        .get('/api/auth/profili');

      expect(res.statusCode).toBe(401);
    });

    it('duhet të refuzojë me token të pavlefshëm', async () => {
      const res = await request(app)
        .get('/api/auth/profili')
        .set('Authorization', 'Bearer token-i-pavlefshem');

      expect(res.statusCode).toBe(401);
    });
  });

  // ═══════════════════════════════════════
  // PËRDITËSO PROFILIN
  // ═══════════════════════════════════════
  describe('PUT /api/auth/profili', () => {
    it('duhet të përditësojë profilin', async () => {
      const res = await request(app)
        .put('/api/auth/profili')
        .set('Authorization', `Bearer ${token}`)
        .send({ emri: 'Andi-Edit', telefoni: '+355699000000' });

      expect(res.statusCode).toBe(200);
      expect(res.body.te_dhena.emri).toBe('Andi-Edit');
    });
  });

  // ═══════════════════════════════════════
  // VERIFIKIM EMAIL
  // ═══════════════════════════════════════
  describe('GET /api/auth/verifiko-email/:token', () => {
    it('duhet të refuzojë token të pavlefshëm', async () => {
      const res = await request(app)
        .get('/api/auth/verifiko-email/token-fals');

      expect(res.statusCode).toBe(400);
    });
  });
});
