# 🛡️ SCC::CTF Registration Portal

> **Official Registration Middleware & Gateway for Smansage Cybersecurity Competition (SCC::CTF 2026) — SMAN 1 Gedeg**  
> Directly integrated with the **GZCTF** competition platform engine (`https://scc.sman1gedeg.sch.id/`).

[![Build and Publish Container Image to GHCR](https://github.com/ardianryan/scc-portal/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/ardianryan/scc-portal/actions/workflows/docker-publish.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Node.js](https://img.shields.io/badge/Node.js-v22%2B-green.svg)](https://nodejs.org/)
[![Docker Image](https://img.shields.io/badge/Docker-GHCR-informational.svg)](https://github.com/ardianryan/scc-portal/pkgs/container/scc-portal)

---

## 📖 Overview

The **SCC::CTF Registration Portal** is a modern, responsive web onboarding gateway designed to streamline participant registrations for cybersecurity competitions at **SMAN 1 Gedeg (SMANSAGE)**, invited partner institutions, and open community participants.

Acting as an intelligent middleware, the portal automates user registration, identity verification, team provisioning, ticket generation, and team member synchronization directly into the **GZCTF** backend engine.

---

## ✨ Key Features

### 1. 🛡️ Step-by-Step Onboarding Wizard
- Participants must review and accept the **Official Rules & Ethical Regulations** (free AI tool whitelist, strict prohibition of DoS/scanner abuse, and Writeup reporting guidelines) before registration unlocks.
- Includes a comprehensive **Environment & Tooling Setup Guide** across Windows (WSL / Ncat), Linux / macOS, and Android (Termux with one-line installer).

### 2. 👥 Flexible Participation (Individual & Team Modes)
- **Individual Mode**: Synchronizes single participant accounts directly with GZCTF.
- **Team Mode**: Fully automated workflow provisioning team captain accounts, team creation via GZCTF API (`POST /api/team`), member account provisioning, and automatic team joining via invite tokens.

### 3. 🏫 Participant Classification & Identity Validation
- **SMANSAGE Students (ScholarGate Dapodik Integration)**: Instant cross-verification via ScholarGate Identity API (`portal.sman1gedeg.sch.id`). Verifies active student status by NISN and validates name similarity (fuzzy matching algorithm) to prevent identity spoofing while preserving privacy (anti-oversharing). **Verified SMANSAGE students are exempt from uploading student ID cards.**
- **Customizable Education Levels**: Admin can configure open competition brackets via dashboard checkboxes:
  - 🏫 SMA / MA (Senior High School / Islamic Senior High)
  - 🛠️ SMK (Vocational High School)
  - 🎓 University / College Students
  - 🌐 General / Open Community
- **External Participants**: Requires uploading supporting identity documents (Student ID, National ID / KTP, or University ID / KTM).

### 4. ☁️ S3-Compatible Object Storage Uploads (IDCloudHost)
- Direct asynchronous upload of identity verification documents to IDCloudHost S3 Object Storage (`is3.cloudhost.id`).
- Structured key paths under bucket `is3-storage.smage.my.id/scc-ctfreg/<category>/<identifier>_<timestamp>.<ext>`.
- Public document review URLs accessible directly in the Admin Panel and exported Excel sheets.

### 5. ⏰ Registration Date Scheduling Window
- Panitia/Admins can configure registration opening datetime (`reg_start_at`) and closing deadline (`reg_end_at`) from the Admin Dashboard.
- Features real-time frontend countdowns, form disabling, and an emergency manual override (🟢 Open / 🔴 Closed).

### 6. 📊 Admin Dashboard & Formatted Excel (.xlsx) Export
- Secure administration panel accessible at `/admin/login` (admin access navigation hidden from public views).
- Real-time analytics tracking internal versus external participants.
- Comprehensive formatted Excel report export containing full participant data, team rosters, and direct links to uploaded documents.

### 7. 🔒 Security & Typographical Hygiene
- **AES-256-GCM** authenticated encryption at rest for sensitive local database secrets.
- Hardened HTTP headers via **Helmet Content Security Policy (CSP)**, Reverse Tabnabbing protection (`rel="noopener noreferrer"`), and multi-tier rate limiting.
- Cohesive visual styling matching the Mantine GZCTF dark theme (`#141414`, `#202020`, brand mint/teal `#2ae5b5`).

---

## 🛠️ Technology Stack

- **Runtime & Server**: Node.js & Express.js
- **Database Engine**: Built-in `node:sqlite` (SQLite 3.53 - Zero native external compilation required)
- **Templating**: EJS (Embedded JavaScript) & GZCTF Dark Theme CSS
- **Object Storage**: AWS SDK v3 (`@aws-sdk/client-s3`) & `multer`
- **Email Gateway**: `nodemailer` (Microsoft 365 / Standard SMTP)
- **Container Registry**: Docker Multi-Arch Build & GitHub Container Registry (GHCR)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+ or 26+
- Git & Docker (optional for containerized deployment)

### 1. Clone the Repository
```bash
git clone https://github.com/ardianryan/scc-portal.git
cd scc-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
```bash
cp .env.example .env
```
Fill in the required configuration variables in `.env` (such as `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `GZCTF_URL`, and admin credentials).

### 4. Start the Application
```bash
# Production mode
npm start

# Development mode (with live watch)
npm run dev
```
Open your browser at `http://localhost:3000`.

---

## 🐳 Docker Deployment

### Run Container via GitHub Container Registry (GHCR)
```bash
docker run -d \
  --name scc-portal \
  -p 3000:3000 \
  -v scc_data:/app/database \
  --env-file .env \
  ghcr.io/ardianryan/scc-portal:latest
```

### Run with Docker Compose
```yaml
version: '3.8'

services:
  portal-registrasi:
    image: ghcr.io/ardianryan/scc-portal:latest
    container_name: scc-portal
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - GZCTF_URL=http://gzctf:80
      - GZCTF_PUBLIC_URL=https://scc.sman1gedeg.sch.id/
      - S3_ENDPOINT=https://is3.cloudhost.id
      - S3_BUCKET=is3-storage.smage.my.id
      - S3_ACCESS_KEY=${S3_ACCESS_KEY}
      - S3_SECRET_KEY=${S3_SECRET_KEY}
      - S3_PATH_PREFIX=/scc-ctfreg
      - S3_PUBLIC_DOMAIN=https://is3-storage.smage.my.id
    volumes:
      - ./portal_data:/app/database
    networks:
      - ctf-net

networks:
  ctf-net:
    external: true
```

---

## 🔐 Environment Variables Reference

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | HTTP application port | `3000` |
| `SESSION_SECRET` | Secret key for Express session cookie | `your_secret_session_key` |
| `ENCRYPTION_KEY` | 32-byte secret for AES-256-GCM database encryption | `your_encryption_key` |
| `GZCTF_URL` | Internal backend API endpoint of GZCTF | `http://localhost:8080` |
| `GZCTF_PUBLIC_URL` | Public competition domain URL | `https://scc.sman1gedeg.sch.id/` |
| `ADMIN_USER` | Default admin username | `admin` |
| `ADMIN_PASS` | Default admin password | *Configured in .env* |
| `S3_ENDPOINT` | S3-compatible storage endpoint | `https://is3.cloudhost.id` |
| `S3_BUCKET` | Destination S3 bucket name | `is3-storage.smage.my.id` |
| `S3_ACCESS_KEY` | S3 API Access Key | *Configured in .env* |
| `S3_SECRET_KEY` | S3 API Secret Key | *Configured in .env* |
| `S3_PATH_PREFIX` | Upload folder directory prefix | `/scc-ctfreg` |
| `S3_PUBLIC_DOMAIN` | Public base URL for uploaded file previews | `https://is3-storage.smage.my.id` |
| `SCHOLARGATE_API_URL` | SMAN 1 Gedeg ScholarGate Dapodik SSO API | `https://portal.sman1gedeg.sch.id` |
| `SCHOLARGATE_API_KEY` | API Key for ScholarGate member lookup | *Configured in .env* |

---

## 📜 License & Code of Conduct

- **License**: This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**, identical to the upstream [GZCTF](https://github.com/GZTimeWalker/GZCTF) platform license. See the [LICENSE](LICENSE) file for complete terms.
- **Code of Conduct**: All contributors, participants, and administrators are expected to adhere to the [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

---

<p align="center">
  Maintained by the <strong>IT Committee of Smansage Cybersecurity Competition (SCC::CTF 2026)</strong><br>
  <em>SMAN 1 Gedeg — Official Competition Gateway</em>
</p>
