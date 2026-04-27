# 🚗 Makina Qera — Sistemi Dixhital i Menaxhimit të Qiradhënies së Automjeteve

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![MUI](https://img.shields.io/badge/MUI-5-007FFF?logo=mui&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

**Aplikacion full-stack për menaxhimin e qiradhënies së automjeteve me autentikim, autorizim, raportim dhe testim.**

</div>

---

## 📋 Përmbajtja

- [Veçoritë](#-veçoritë)
- [Teknologjitë](#-teknologjitë)
- [Kërkesat Paraprake](#-kërkesat-paraprake)
- [Instalimi Lokal](#-instalimi-lokal)
- [Docker Deploy](#-docker-deploy)
- [Përdorimi](#-përdorimi)
- [API Dokumentim](#-api-dokumentim)
- [Testimi](#-testimi)
- [Struktura e Projektit](#-struktura-e-projektit)

---

## ✨ Veçoritë

### Panel Admin
- 📊 **Dashboard** me statistika në kohë reale
- 🚗 **Menaxhim Automjetesh** — CRUD, filtrime, kërkim
- 🛡️ **Menaxhim Sigurimesh** — CRUD, paralajmërime skadence
- 👥 **Menaxhim Klientësh** — Lista, detaje, verifikim
- 📋 **Menaxhim Qiradhëniesh** — Statusë, detaje, filtrime
- 📈 **Raporte** — Përdorim, të ardhura, sigurime

### Panel Klient
- 🔍 **Kërkim Automjetesh** — Filtrime sipas modelit, motorit, kambios
- 📅 **Rezervim** — Kontroll disponueshmërie, llogaritje çmimi
- 📜 **Historik Qiradhënie** — Lista e qirave personale
- 👤 **Profil** — Editim informacionesh personale

### Sigurim & Njoftimet
- 🔔 **Njoftimet In-App** — Konfirmime, paralajmërime
- 📧 **Email** — Verifikim, konfirmim rezervimi, paralajmërim sigurim
- ⏰ **Cron Job** — Kontroll ditor automatik i sigurimeve

---

## 🛠 Teknologjitë

| Shtresë | Teknologjia |
|---------|-------------|
| Backend | Node.js 20 + Express |
| Database | PostgreSQL 16 |
| ORM | Sequelize |
| Frontend | React 18 + Vite |
| UI | Material UI (MUI) |
| Auth | JWT (JSON Web Tokens) |
| Tests | Jest + Supertest |
| Deploy | Docker + GitHub Actions |

---

## 📦 Kërkesat Paraprake

- [Node.js 20+](https://nodejs.org/)
- [PostgreSQL 16+](https://www.postgresql.org/)
- [npm](https://www.npmjs.com/) ose [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (opsional)

---

## 🚀 Instalimi Lokal

### 1. Klono projektin

```bash
git clone https://github.com/your-repo/makina-qera.git
cd makina-qera
```

### 2. Konfiguro bazën e të dhënave

Krijo 2 baza të dhënash në PostgreSQL:

```sql
CREATE DATABASE makina_qera;
CREATE DATABASE makina_qera_test;
```

### 3. Instalo Backend

```bash
cd backend
cp .env.example .env
# Edito .env me kredencialet tuaja të DB
npm install
```

### 4. Populo bazën e të dhënave

```bash
npm run seed
```

### 5. Starto Backend

```bash
npm run dev
# Serveri starton në http://localhost:5000
# Swagger UI: http://localhost:5000/api-docs
```

### 6. Instalo dhe Starto Frontend

```bash
cd ../frontend
npm install
npm run dev
# Frontend starton në http://localhost:5173
```

---

## 🐳 Docker Deploy

```bash
# Starto të gjithë shërbimet
docker-compose up -d

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# API Docs: http://localhost:5000/api-docs
```

Për të ndaluar:
```bash
docker-compose down
```

---

## 🔑 Përdorimi

### Kredencialet Demo

| Roli | Email | Fjalëkalimi |
|------|-------|-------------|
| Admin | `admin@makinaqera.al` | `Admin123!` |
| Klient | `andi.hoxha@email.com` | `Klient123!` |

### Hapat kryesorë

1. Hapni frontend-in (`http://localhost:5173`)
2. Hyni me kredencialet demo
3. **Si Admin**: Menaxhoni automjete, sigurime, klientë, qiradhënie
4. **Si Klient**: Kërkoni automjete, bëni rezervim, shikoni historikun

---

## 📖 API Dokumentim

Swagger UI disponohet në: **`http://localhost:5000/api-docs`**

Përmban dokumentim të plotë OpenAPI 3.0 me:
- Të gjithë endpoints
- Request/Response schemas
- Autentikim Bearer JWT
- Shembuj kërkesash

---

## 🧪 Testimi

```bash
cd backend

# Ekzekuto testet me coverage
npm test

# Ekzekuto testet në watch mode
npm run test:watch
```

### Mbulesa e Testeve

Testet mbulojnë:
- ✅ Autentikim (regjistrim, hyrje, JWT, profil)
- ✅ Automjete (CRUD, validim targash, autorizim)
- ✅ Sigurime (CRUD, kontrolle skadence)
- ✅ Qiradhënie (krijim, konflikte, kontroll sigurimi)

Target: **≥ 80% coverage**

---

## 📁 Struktura e Projektit

```
makina-qera/
├── backend/                # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Database, auth config
│   │   ├── controllers/    # 7 controllers
│   │   ├── middleware/      # Auth, validators, errors
│   │   ├── models/          # 5 Sequelize models
│   │   ├── routes/          # 7 route files
│   │   ├── services/        # Business logic
│   │   ├── seeders/         # Seed data
│   │   └── utils/           # Email utility
│   ├── tests/               # Jest tests
│   ├── swagger.js           # OpenAPI spec
│   └── server.js            # Entry point
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── api/             # Axios client
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # 11 pages
│   │   └── theme.js         # MUI theme
├── docs/                   # Dokumentimi teknik
├── docker-compose.yml      # Docker orchestration
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── .github/workflows/      # CI/CD
└── README.md               # Ky file
```

---

## 📄 Dokumentimi Teknik

Shikoni dokumentimin e plotë teknik me diagrame në:
**[docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**

Përfshin:
- 📊 Diagrami ER (Entity-Relationship)
- 🎯 Diagrami i Rasteve të Përdorimit (Use Case)
- 🏗️ Diagrami i Klasave (Class Diagram)
- 🔄 Diagrami i Sekuencës (Sequence Diagram)
- 📋 Diagrami i Aktivitetit (Activity Diagram)
- 🏛️ Diagrami i Arkitekturës
- 🐳 Diagrami i Deploymenti
- 📝 Tabela e API Endpoints
- 🔧 Design Patterns të përdorura

---

## 📝 Licenca

ISC

---

<div align="center">
  <strong>🚗 Makina Qera</strong> — Ndërtuar me ❤️ për menaxhimin modern të qiradhënies
</div>
