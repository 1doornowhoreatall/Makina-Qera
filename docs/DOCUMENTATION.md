# Makina Qera — Dokumentim Teknik

## Sistemi Dixhital i Menaxhimit të Qiradhënies së Automjeteve

---

## 1. Përshkrimi i Projektit

**Makina Qera** është një aplikacion full‑stack për menaxhimin e një kompanie qiradhënie automjetesh. Sistemi përfshin:

- Menaxhimin e automjeteve (CRUD)
- Menaxhimin e sigurimeve me kontrolle automatike
- Regjistrimin dhe verifikimin e klientëve
- Procesin e qiradhënies me kontroll disponueshmërie
- Autentikim dhe autorizim me role (Admin/Klient)
- Raporte dhe statistika
- Njoftimet in-app dhe me email
- API dokumentim me Swagger/OpenAPI

### Teknologjitë e Përdorura

| Shtresë | Teknologjia |
|---------|-------------|
| Backend | Node.js 20 + Express.js |
| Bazë të dhënash | PostgreSQL 16 |
| ORM | Sequelize 6 |
| Frontend | React 18 + Vite 5 |
| UI Library | Material UI (MUI) 5 |
| Autentikim | JWT (JSON Web Tokens) |
| Validim | express-validator |
| Email | Nodemailer |
| Testim | Jest + Supertest |
| Deploy | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Dokumentim API | Swagger / OpenAPI 3.0 |

---

## 2. Diagrami ER (Entity-Relationship)

```mermaid
erDiagram
    PERDORUESIT {
        int id PK
        string emri
        string mbiemri
        string email UK
        string password_hash
        date datelindja
        string nr_personal UK
        string telefoni
        enum roli "admin | klient"
        boolean email_verified
        string verification_token
        timestamp krijuar_me
        timestamp perditesuar_me
    }
    
    AUTOMJETET {
        int id PK
        string targa UK
        string modeli
        int viti_prodhimit
        int nr_max_pasagjeresh
        enum tipi_motorrit "benzine | nafte | elektrik | hibrid"
        enum tipi_kambios "manuale | automatike"
        int kilometrazhi
        decimal cmimi_ditor
        string foto_url
        enum statusi "aktiv | ne_mirembajtje | jashte_perdorimit"
        timestamp krijuar_me
    }
    
    SIGURIMET {
        int id PK
        int automjet_id FK
        string emri_shoqerise
        date data_fillimit
        date data_mbarimit
        decimal kosto
        timestamp krijuar_me
    }
    
    QIRADHENIET {
        int id PK
        int automjet_id FK
        int klient_id FK
        datetime data_terheqjes
        string vendi_terheqjes
        datetime data_dorezimit
        string vendi_dorezimit
        text shenime_gjendjeje
        enum statusi "aktive | perfunduar | anuluar"
        decimal cmimi_total
        timestamp krijuar_me
    }
    
    NJOFTIMET {
        int id PK
        int user_id FK
        enum tipi "rezervim | sigurim | sistem | paralajmerim"
        string titulli
        text mesazhi
        boolean lexuar
        timestamp krijuar_me
    }
    
    PERDORUESIT ||--o{ QIRADHENIET : "bën"
    AUTOMJETET ||--o{ SIGURIMET : "ka"
    AUTOMJETET ||--o{ QIRADHENIET : "qirajepet"
    PERDORUESIT ||--o{ NJOFTIMET : "merr"
```

---

## 3. Diagrami i Rasteve të Përdorimit (Use Case Diagram)

```mermaid
graph TB
    subgraph Sistemi["🚗 Sistemi Makina Qera"]
        UC1[Regjistrim]
        UC2[Hyrje / Dalje]
        UC3[Kërko Automjete]
        UC4[Rezervo Automjet]
        UC5[Shiko Historikun]
        UC6[Edito Profilin]
        UC7[Menaxho Automjete CRUD]
        UC8[Menaxho Sigurime]
        UC9[Menaxho Klientë]
        UC10[Menaxho Qiradhënie]
        UC11[Shiko Raporte]
        UC12[Merr Njoftim]
        UC13[Verifiko Email]
        UC14[Kontrollo Disponueshmëri]
        UC15[Kontrollo Sigurim Aktiv]
    end

    Klient((👤 Klient))
    Admin((👨‍💼 Admin))

    Klient --> UC1
    Klient --> UC2
    Klient --> UC3
    Klient --> UC4
    Klient --> UC5
    Klient --> UC6
    Klient --> UC12
    Klient --> UC13

    Admin --> UC2
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12

    UC4 -.->|"përfshin"| UC14
    UC4 -.->|"përfshin"| UC15

    style Klient fill:#00D9FF,stroke:#00A3CC,color:#000
    style Admin fill:#6C63FF,stroke:#4A42CC,color:#fff
```

---

## 4. Diagrami i Klasave (Class Diagram)

```mermaid
classDiagram
    class User {
        +int id
        +string emri
        +string mbiemri
        +string email
        +string password_hash
        +date datelindja
        +string nr_personal
        +string telefoni
        +enum roli
        +boolean email_verified
        +verifikoPassword(password) bool
        +emriPlote() string
        +toJSON() object
    }

    class Automjet {
        +int id
        +string targa
        +string modeli
        +int viti_prodhimit
        +int nr_max_pasagjeresh
        +enum tipi_motorrit
        +enum tipi_kambios
        +int kilometrazhi
        +decimal cmimi_ditor
        +enum statusi
    }

    class Sigurim {
        +int id
        +int automjet_id
        +string emri_shoqerise
        +date data_fillimit
        +date data_mbarimit
        +decimal kosto
        +eshteAktiv() bool
        +skadonSeshpejti(dite) bool
    }

    class Qiradhenie {
        +int id
        +int automjet_id
        +int klient_id
        +datetime data_terheqjes
        +string vendi_terheqjes
        +datetime data_dorezimit
        +string vendi_dorezimit
        +text shenime_gjendjeje
        +enum statusi
        +decimal cmimi_total
        +ditetQirase() int
    }

    class Njoftim {
        +int id
        +int user_id
        +enum tipi
        +string titulli
        +text mesazhi
        +boolean lexuar
    }

    class QiraDhenieService {
        +kontrolloDisponueshmerine(autoId, fillim, mbarim) object
        +kontrolloSigurimin(autoId, fillim, mbarim) object
        +llogaritCmimin(autoId, fillim, mbarim) number
    }

    class SigurimService {
        +gjejSiguriQeSkadonjne(dite) array
        +gjejSigurimeSkaduara() array
        +kaSigurimAktiv(autoId) bool
        +startoCronJob() void
    }

    User "1" --> "*" Qiradhenie : klient_id
    Automjet "1" --> "*" Sigurim : automjet_id
    Automjet "1" --> "*" Qiradhenie : automjet_id
    User "1" --> "*" Njoftim : user_id
    QiraDhenieService ..> Qiradhenie : përdor
    QiraDhenieService ..> Automjet : përdor
    QiraDhenieService ..> Sigurim : përdor
    SigurimService ..> Sigurim : përdor
```

---

## 5. Diagrami i Sekuencës — Procesi i Rezervimit

```mermaid
sequenceDiagram
    actor K as 👤 Klienti
    participant F as 🖥️ Frontend
    participant A as ⚙️ API Backend
    participant S as 📊 Shërbimi
    participant DB as 🗄️ PostgreSQL
    participant E as 📧 Email

    K->>F: Zgjedh automjetin dhe datat
    F->>A: GET /qiradhenie/kontrollo-disponueshmerine
    A->>S: QiraDhenieService.kontrolloDisponueshmerine()
    S->>DB: Kërko qiradhënie konfliktuese
    DB-->>S: Rezultati
    S-->>A: {disponueshem: true/false, cmimi}
    A-->>F: Përgjigje
    F-->>K: Shfaq disponueshmërinë + çmimin

    K->>F: Konfirmo rezervimin
    F->>A: POST /qiradhenie
    A->>S: Kontrollo disponueshmëri
    S->>DB: Verifiko konflikte
    DB-->>S: OK
    A->>S: Kontrollo sigurim aktiv
    S->>DB: Kërko sigurim për periudhën
    DB-->>S: Sigurim i gjetur
    A->>S: Llogarit çmimin
    S-->>A: cmimi_total
    A->>DB: Krijo qiradhënien
    DB-->>A: Qiradhënia e re
    A->>DB: Krijo njoftim
    A->>E: Dërgo email konfirmimi
    E-->>K: 📧 Email konfirmimi
    A-->>F: {sukses: true, qiradhenia}
    F-->>K: ✅ Rezervimi u konfirmua!
```

---

## 6. Diagrami i Aktivitetit — Procesi i Qiradhënies

```mermaid
flowchart TD
    A([🟢 Fillimi]) --> B[Klienti zgjedh automjetin]
    B --> C[Klienti zgjedh datat]
    C --> D{Kontrollo disponueshmërinë}
    D -->|Padisponueshëm| E[Shfaq mesazh gabimi]
    E --> C
    D -->|Disponueshëm| F{Kontrollo sigurimin}
    F -->|Pa sigurim aktiv| G[Refuzo - sigurim i skaduar]
    G --> H([🛑 Fund])
    F -->|Sigurim aktiv| I[Llogarit çmimin]
    I --> J[Shfaq detajet + çmimin]
    J --> K{Klienti konfirmon?}
    K -->|Jo| L[Anulo]
    L --> H
    K -->|Po| M[Krijo qiradhënien]
    M --> N[Dërgo njoftim in-app]
    N --> O[Dërgo email konfirmimi]
    O --> P([✅ Rezervimi u krye])

    style A fill:#10B981,stroke:#059669,color:#fff
    style H fill:#EF4444,stroke:#DC2626,color:#fff
    style P fill:#10B981,stroke:#059669,color:#fff
    style D fill:#6C63FF,stroke:#4A42CC,color:#fff
    style F fill:#F59E0B,stroke:#D97706,color:#000
    style K fill:#00D9FF,stroke:#00A3CC,color:#000
```

---

## 7. Diagrami i Arkitekturës

```mermaid
graph TB
    subgraph Klienti["🌐 Klienti (Browser)"]
        R[React 18 + MUI]
        AX[Axios HTTP Client]
    end

    subgraph Backend["⚙️ Backend Server"]
        EX[Express.js]
        MW[Middleware Layer]
        CT[Controllers]
        SV[Services]
        MD[Sequelize Models]
        
        MW --> |Auth| JWT[JWT Verification]
        MW --> |Validim| VL[express-validator]
        MW --> |Sigurim| HM[Helmet + CORS]
        
        CT --> |Logjikë biznesi| SV
        SV --> |ORM| MD
    end

    subgraph Database["🗄️ Database"]
        PG[(PostgreSQL 16)]
    end

    subgraph Services["🔧 Shërbime"]
        CR[node-cron Jobs]
        NM[Nodemailer]
        SW[Swagger UI]
    end

    subgraph Deploy["🐳 Deploy"]
        DC[Docker Compose]
        GH[GitHub Actions CI/CD]
    end

    R --> AX
    AX --> |REST API| EX
    EX --> MW
    MW --> CT
    MD --> PG
    CR --> SV
    SV --> NM
    EX --> SW
    DC --> Backend
    DC --> Database
    GH --> DC

    style R fill:#61DAFB,stroke:#21A1C9,color:#000
    style EX fill:#339933,stroke:#1A661A,color:#fff
    style PG fill:#336791,stroke:#1D3D55,color:#fff
    style DC fill:#2496ED,stroke:#1276C5,color:#fff
```

---

## 8. Struktura e API Endpoints

### 8.1 Autentikim (`/api/auth`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| POST | `/regjistrim` | Regjistrim i ri | Publik |
| POST | `/hyrje` | Hyrje (login) | Publik |
| GET | `/verifiko-email/:token` | Verifiko email | Publik |
| GET | `/profili` | Profili aktual | Autentikuar |
| PUT | `/profili` | Përditëso profilin | Autentikuar |

### 8.2 Automjete (`/api/automjete`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/` | Lista me filtrime | Publik |
| GET | `/:id` | Detajet | Publik |
| POST | `/` | Krijo automjet | Admin |
| PUT | `/:id` | Përditëso | Admin |
| DELETE | `/:id` | Fshi | Admin |

### 8.3 Sigurime (`/api/sigurime`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/` | Lista | Admin |
| GET | `/qe-skadojne` | Që skadojnë brenda 30 ditëve | Admin |
| GET | `/:id` | Detajet | Admin |
| POST | `/` | Krijo sigurim | Admin |
| PUT | `/:id` | Përditëso | Admin |
| DELETE | `/:id` | Fshi | Admin |

### 8.4 Klientë (`/api/kliente`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/` | Lista e klientëve | Admin |
| GET | `/:id` | Detajet | Admin |
| PUT | `/:id` | Përditëso | Admin |
| DELETE | `/:id` | Fshi | Admin |

### 8.5 Qiradhënie (`/api/qiradhenie`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/` | Lista (admin=të gjitha, klient=vetëm e tij) | Autentikuar |
| GET | `/kontrollo-disponueshmerine` | Kontrollo disponueshmërinë | Autentikuar |
| GET | `/:id` | Detajet | Autentikuar |
| POST | `/` | Krijo qiradhënie | Autentikuar |
| PUT | `/:id/statusi` | Ndrysho statusin | Admin |

### 8.6 Raporte (`/api/raporte`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/statistika` | Statistikat e dashboard | Admin |
| GET | `/perdorimi` | Raporti i përdorimit | Admin |
| GET | `/sigurime` | Raporti i sigurimeve | Admin |

### 8.7 Njoftimet (`/api/njoftimet`)

| Metoda | Rruga | Përshkrimi | Akses |
|--------|-------|------------|-------|
| GET | `/` | Lista e njoftimeve | Autentikuar |
| PUT | `/:id/lexo` | Shëno si të lexuar | Autentikuar |
| PUT | `/lexo-te-gjitha` | Lexo të gjitha | Autentikuar |

---

## 9. Metodat dhe Pattern-et e Përdorura

### 9.1 Design Patterns

| Pattern | Ku përdoret | Arsyeja |
|---------|-------------|---------|
| **MVC** | Backend komplet | Ndarje e qartë e detyrave: Models, Controllers, Routes |
| **Repository Pattern** | Sequelize ORM | Abstraktim mbi bazën e të dhënave |
| **Service Layer** | QiraDhenieService, SigurimService | Logjika e biznesit e izoluar nga controllers |
| **Middleware Pattern** | Express middleware chain | Autentikim, validim, trajtim gabimesh |
| **Singleton** | Sequelize instance | Një lidhje e vetme me DB |
| **Observer Pattern** | Cron jobs + Njoftimet | Njoftim automatik kur ndodhin ngjarje |
| **Provider Pattern** | React AuthContext | Menaxhimi i gjendjes së autentikimit |
| **Protected Route** | React Router | Kontroll aksesi bazuar në role |

### 9.2 Parimet e Sigurisë

- **Hashing**: Fjalëkalimet ruhen me bcrypt (12 raunde)
- **JWT**: Token-et kanë afat skadence (7 ditë)
- **CORS**: Kufizuar vetëm në frontend URL
- **Helmet**: Headers sigurie HTTP
- **Input Validation**: express-validator për çdo input
- **SQL Injection**: Parandaluar nga Sequelize ORM (parameterized queries)
- **Role-Based Access Control**: Admin vs Klient me middleware

### 9.3 Metodologjia e Testimit

- **Unit Tests**: Logjika e shërbimeve (QiraDhenieService, SigurimService)
- **Integration Tests**: API endpoints me supertest
- **Coverage Target**: ≥ 80% (branches, functions, lines, statements)
- **Test DB**: PostgreSQL i veçantë (makina_qera_test)

---

## 10. Diagrami i Deploymenti

```mermaid
graph TB
    subgraph Production["☁️ Mjedisi i Prodhimit"]
        subgraph Docker["🐳 Docker Compose"]
            FE["📱 Frontend Container<br/>nginx:alpine<br/>Port: 3000"]
            BE["⚙️ Backend Container<br/>node:20-alpine<br/>Port: 5000"]
            DB["🗄️ PostgreSQL Container<br/>postgres:16-alpine<br/>Port: 5432"]
            VOL["💾 Volume: postgres_data"]
        end

        FE -->|"/api/*"| BE
        BE --> DB
        DB --> VOL
    end

    subgraph CI["🔄 CI/CD Pipeline"]
        GH["GitHub Actions"]
        T1["1. Checkout"]
        T2["2. Install deps"]
        T3["3. Run tests"]
        T4["4. Build"]
        T5["5. Docker build"]
    end

    DEV["👨‍💻 Zhvilluesi"] -->|"git push"| GH
    GH --> T1 --> T2 --> T3 --> T4 --> T5
    T5 -->|"deploy"| Docker

    style FE fill:#61DAFB,stroke:#21A1C9,color:#000
    style BE fill:#339933,stroke:#1A661A,color:#fff
    style DB fill:#336791,stroke:#1D3D55,color:#fff
    style GH fill:#24292e,stroke:#000,color:#fff
```

---

## 11. Seed Data (Të Dhënat Shembull)

| Entiteti | Sasia | Shembuj |
|----------|-------|---------|
| Përdorues | 6 | 1 admin + 5 klientë |
| Automjete | 10 | Toyota Corolla, VW Golf, Mercedes C-Class, BMW X3, Tesla Model 3, etj. |
| Kompani sigurimi | 5 | Sigal UNIQA, Eurosig, Albsig, Insig, Intersig VIG |
| Sigurime | 20 | 10 aktive + 10 historike |
| Qiradhënie | 8 | Aktive, përfunduara, anuluara |
| Njoftimet | 4 | Sistem, rezervim, sigurim |

### Kredencialet Demo

```
Admin:   admin@makinaqera.al   / Admin123!
Klient:  andi.hoxha@email.com  / Klient123!
```

---

## 12. Struktura e Dosjes së Projektit

```
makina-qera/
├── backend/
│   ├── src/
│   │   ├── config/          # Konfigurimet (database, auth)
│   │   ├── middleware/       # Auth, validim, error handler
│   │   ├── models/           # Sequelize modelet (5 modele)
│   │   ├── controllers/      # Request handlers (7 controllers)
│   │   ├── services/         # Logjika e biznesit (2 services)
│   │   ├── routes/           # Express rrugët (7 route files)
│   │   ├── utils/            # Email utility
│   │   ├── seeders/          # Seed data
│   │   └── app.js            # Express app setup
│   ├── tests/                # Jest testet (4 test suites)
│   ├── swagger.js            # OpenAPI config
│   ├── server.js             # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios API client
│   │   ├── components/       # UI Components (4)
│   │   ├── context/          # Auth Context
│   │   ├── pages/
│   │   │   ├── admin/        # 5 faqe admin
│   │   │   ├── auth/         # 2 faqe auth
│   │   │   └── client/       # 4 faqe klient
│   │   ├── theme.js          # MUI dark theme
│   │   ├── App.jsx           # Routing
│   │   └── main.jsx          # Entry
│   └── package.json
├── docs/
│   └── DOCUMENTATION.md      # Ky dokument
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── nginx.conf
├── .github/workflows/ci.yml
└── README.md
