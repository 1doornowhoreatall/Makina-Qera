require('dotenv').config();
const { sequelize, User, Automjet, Sigurim, Qiradhenie, Njoftim } = require('../models');

/**
 * Seed Data — Të dhëna shembull për zhvillim
 * 
 * Përmban:
 * - 1 admin + 5 klientë
 * - 10 automjete me targa shqiptare
 * - 5 kompani sigurimi, 20 sigurime
 * - 8 qiradhënie shembull
 */
const seed = async () => {
  try {
    console.log('🌱 Duke populluar bazën e të dhënave...\n');

    // Sinkronizo dhe pastro
    await sequelize.sync({ force: true });
    console.log('✅ Tabelat u rikrijuan');

    // ═══════════════════════════════════════
    // PËRDORUESIT
    // ═══════════════════════════════════════
    console.log('\n👥 Duke krijuar përdoruesit...');

    const admin = await User.create({
      emri: 'Admin',
      mbiemri: 'Sistemi',
      email: 'admin@makinaqera.al',
      password_hash: 'Admin123!',
      datelindja: '1985-03-15',
      nr_personal: 'I00000001A',
      telefoni: '+355691000001',
      roli: 'admin',
      email_verified: true
    });

    const kliente = [];
    const klienteData = [
      { emri: 'Andi', mbiemri: 'Hoxha', email: 'andi.hoxha@email.com', datelindja: '1995-06-20', nr_personal: 'I12345678A', telefoni: '+355692345678' },
      { emri: 'Besa', mbiemri: 'Kelmendi', email: 'besa.kelmendi@email.com', datelindja: '1990-11-08', nr_personal: 'J23456789B', telefoni: '+355693456789' },
      { emri: 'Dritan', mbiemri: 'Shehu', email: 'dritan.shehu@email.com', datelindja: '1988-02-14', nr_personal: 'K34567890C', telefoni: '+355694567890' },
      { emri: 'Elona', mbiemri: 'Basha', email: 'elona.basha@email.com', datelindja: '1998-09-03', nr_personal: 'L45678901D', telefoni: '+355695678901' },
      { emri: 'Fatos', mbiemri: 'Berisha', email: 'fatos.berisha@email.com', datelindja: '1992-12-25', nr_personal: 'M56789012E', telefoni: '+355696789012' }
    ];

    for (const k of klienteData) {
      const klient = await User.create({
        ...k,
        password_hash: 'Klient123!',
        roli: 'klient',
        email_verified: true
      });
      kliente.push(klient);
    }
    console.log(`  ✅ ${kliente.length + 1} përdorues u krijuan (1 admin + ${kliente.length} klientë)`);

    // ═══════════════════════════════════════
    // AUTOMJETET
    // ═══════════════════════════════════════
    console.log('\n🚗 Duke krijuar automjetet...');

    const automjeteData = [
      { targa: 'AA 123 BB', modeli: 'Toyota Corolla', viti_prodhimit: 2022, nr_max_pasagjeresh: 5, tipi_motorrit: 'benzinë', tipi_kambios: 'automatike', kilometrazhi: 15000, cmimi_ditor: 35.00 },
      { targa: 'AA 456 CC', modeli: 'Volkswagen Golf', viti_prodhimit: 2021, nr_max_pasagjeresh: 5, tipi_motorrit: 'naftë', tipi_kambios: 'manuale', kilometrazhi: 28000, cmimi_ditor: 30.00 },
      { targa: 'AA 789 DD', modeli: 'Mercedes-Benz C-Class', viti_prodhimit: 2023, nr_max_pasagjeresh: 5, tipi_motorrit: 'naftë', tipi_kambios: 'automatike', kilometrazhi: 8000, cmimi_ditor: 65.00 },
      { targa: 'TR 100 EE', modeli: 'BMW X3', viti_prodhimit: 2022, nr_max_pasagjeresh: 5, tipi_motorrit: 'naftë', tipi_kambios: 'automatike', kilometrazhi: 20000, cmimi_ditor: 55.00 },
      { targa: 'TR 200 FF', modeli: 'Fiat 500', viti_prodhimit: 2020, nr_max_pasagjeresh: 4, tipi_motorrit: 'benzinë', tipi_kambios: 'manuale', kilometrazhi: 42000, cmimi_ditor: 20.00 },
      { targa: 'DR 300 GG', modeli: 'Audi A4', viti_prodhimit: 2023, nr_max_pasagjeresh: 5, tipi_motorrit: 'naftë', tipi_kambios: 'automatike', kilometrazhi: 5000, cmimi_ditor: 60.00 },
      { targa: 'DR 400 HH', modeli: 'Renault Clio', viti_prodhimit: 2021, nr_max_pasagjeresh: 5, tipi_motorrit: 'benzinë', tipi_kambios: 'manuale', kilometrazhi: 35000, cmimi_ditor: 25.00 },
      { targa: 'EL 500 II', modeli: 'Tesla Model 3', viti_prodhimit: 2024, nr_max_pasagjeresh: 5, tipi_motorrit: 'elektrik', tipi_kambios: 'automatike', kilometrazhi: 3000, cmimi_ditor: 75.00 },
      { targa: 'VL 600 JJ', modeli: 'Toyota RAV4 Hybrid', viti_prodhimit: 2023, nr_max_pasagjeresh: 5, tipi_motorrit: 'hibrid', tipi_kambios: 'automatike', kilometrazhi: 12000, cmimi_ditor: 50.00 },
      { targa: 'SH 700 KK', modeli: 'Ford Focus', viti_prodhimit: 2020, nr_max_pasagjeresh: 5, tipi_motorrit: 'benzinë', tipi_kambios: 'manuale', kilometrazhi: 55000, cmimi_ditor: 22.00 }
    ];

    const automjete = [];
    for (const a of automjeteData) {
      const automjet = await Automjet.create(a);
      automjete.push(automjet);
    }
    console.log(`  ✅ ${automjete.length} automjete u krijuan`);

    // ═══════════════════════════════════════
    // SIGURIMET
    // ═══════════════════════════════════════
    console.log('\n🛡️ Duke krijuar sigurimet...');

    const shoqerite = ['Sigal UNIQA Group', 'Eurosig', 'Albsig', 'Insig', 'Intersig VIG'];
    const sigurimet = [];
    const sot = new Date();

    for (let i = 0; i < automjete.length; i++) {
      // Sigurim aktiv
      const sigAktiv = await Sigurim.create({
        automjet_id: automjete[i].id,
        emri_shoqerise: shoqerite[i % shoqerite.length],
        data_fillimit: new Date(sot.getFullYear(), 0, 1).toISOString().split('T')[0],
        data_mbarimit: new Date(sot.getFullYear(), 11, 31).toISOString().split('T')[0],
        kosto: 200 + Math.floor(Math.random() * 300)
      });
      sigurimet.push(sigAktiv);

      // Sigurim i vitit të kaluar (historik)
      const sigHisotrik = await Sigurim.create({
        automjet_id: automjete[i].id,
        emri_shoqerise: shoqerite[(i + 2) % shoqerite.length],
        data_fillimit: new Date(sot.getFullYear() - 1, 0, 1).toISOString().split('T')[0],
        data_mbarimit: new Date(sot.getFullYear() - 1, 11, 31).toISOString().split('T')[0],
        kosto: 180 + Math.floor(Math.random() * 250)
      });
      sigurimet.push(sigHisotrik);
    }
    console.log(`  ✅ ${sigurimet.length} sigurime u krijuan (${shoqerite.length} kompani sigurimi)`);

    // ═══════════════════════════════════════
    // QIRADHËNIET
    // ═══════════════════════════════════════
    console.log('\n📋 Duke krijuar qiradhëniet...');

    const qiradheniet = [
      {
        automjet_id: automjete[0].id, klient_id: kliente[0].id,
        data_terheqjes: new Date(sot.getTime() - 10 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Tiranë, Rruga e Durrësit',
        data_dorezimit: new Date(sot.getTime() - 3 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Tiranë, Rruga e Durrësit',
        shenime_gjendjeje: 'Automjeti u dorëzua në gjendje të mirë',
        statusi: 'perfunduar', cmimi_total: 245.00
      },
      {
        automjet_id: automjete[1].id, klient_id: kliente[1].id,
        data_terheqjes: new Date(sot.getTime() - 5 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Durrës, Porti',
        data_dorezimit: new Date(sot.getTime() + 2 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Tiranë, Aeroporti',
        shenime_gjendjeje: 'Klienti kërkon dorëzim në aeroport',
        statusi: 'aktive', cmimi_total: 210.00
      },
      {
        automjet_id: automjete[2].id, klient_id: kliente[2].id,
        data_terheqjes: new Date(sot.getTime() + 1 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Tiranë, Blloku',
        data_dorezimit: new Date(sot.getTime() + 8 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Tiranë, Blloku',
        statusi: 'aktive', cmimi_total: 455.00
      },
      {
        automjet_id: automjete[3].id, klient_id: kliente[3].id,
        data_terheqjes: new Date(sot.getTime() - 20 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Tiranë, Qendra',
        data_dorezimit: new Date(sot.getTime() - 15 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Tiranë, Qendra',
        shenime_gjendjeje: 'Pa probleme',
        statusi: 'perfunduar', cmimi_total: 275.00
      },
      {
        automjet_id: automjete[4].id, klient_id: kliente[4].id,
        data_terheqjes: new Date(sot.getTime() - 2 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Vlorë, Lungomare',
        data_dorezimit: new Date(sot.getTime() + 5 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Vlorë, Lungomare',
        statusi: 'aktive', cmimi_total: 140.00
      },
      {
        automjet_id: automjete[5].id, klient_id: kliente[0].id,
        data_terheqjes: new Date(sot.getTime() - 30 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Korçë, Qendra',
        data_dorezimit: new Date(sot.getTime() - 25 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Korçë, Qendra',
        shenime_gjendjeje: 'Gërvishtje e vogël në parakolp',
        statusi: 'perfunduar', cmimi_total: 300.00
      },
      {
        automjet_id: automjete[6].id, klient_id: kliente[1].id,
        data_terheqjes: new Date(sot.getTime() - 45 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Shkodër, Qendra',
        data_dorezimit: new Date(sot.getTime() - 40 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Shkodër, Qendra',
        statusi: 'perfunduar', cmimi_total: 125.00
      },
      {
        automjet_id: automjete[7].id, klient_id: kliente[2].id,
        data_terheqjes: new Date(sot.getTime() - 15 * 24 * 60 * 60 * 1000),
        vendi_terheqjes: 'Tiranë, Aeroporti',
        data_dorezimit: new Date(sot.getTime() - 8 * 24 * 60 * 60 * 1000),
        vendi_dorezimit: 'Tiranë, Aeroporti',
        statusi: 'anuluar', cmimi_total: 525.00
      }
    ];

    for (const q of qiradheniet) {
      await Qiradhenie.create(q);
    }
    console.log(`  ✅ ${qiradheniet.length} qiradhënie u krijuan`);

    // ═══════════════════════════════════════
    // NJOFTIMET
    // ═══════════════════════════════════════
    console.log('\n🔔 Duke krijuar njoftimet...');

    await Njoftim.bulkCreate([
      { user_id: admin.id, tipi: 'sistem', titulli: 'Mirë se vini në sistem', mesazhi: 'Sistemi Makina Qera u instalua me sukses. Ju keni akses të plotë administrativ.', lexuar: true },
      { user_id: admin.id, tipi: 'sigurim', titulli: 'Kontrolli ditor i sigurimeve', mesazhi: 'Të gjitha sigurimet janë aktive. Asnjë sigurim nuk skadon brenda 30 ditëve.', lexuar: false },
      { user_id: kliente[0].id, tipi: 'rezervim', titulli: 'Rezervimi u konfirmua', mesazhi: 'Rezervimi juaj për Toyota Corolla u konfirmua me sukses.', lexuar: true },
      { user_id: kliente[1].id, tipi: 'rezervim', titulli: 'Rezervimi aktiv', mesazhi: 'Keni një rezervim aktiv për Volkswagen Golf. Dorëzimi planifikohet për 2 ditë.', lexuar: false }
    ]);
    console.log('  ✅ 4 njoftimet u krijuan');

    console.log('\n═══════════════════════════════════════');
    console.log('✅ SEED DATA U KOMPLETUA ME SUKSES!');
    console.log('═══════════════════════════════════════');
    console.log('\n📧 Kredencialet e hyrjes:');
    console.log('  Admin:  admin@makinaqera.al / Admin123!');
    console.log('  Klient: andi.hoxha@email.com / Klient123!');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Gabim gjatë popullimit:', error);
    process.exit(1);
  }
};

seed();
