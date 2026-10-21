# Changelog

All notable changes to the **SCC::CTF Registration Portal** will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-10-21

### Added
- **ScholarGate Identity (DAPODIK) Cross-Verification**:
  - Direct integration with SMAN 1 Gedeg ScholarGate SSO API (`https://portal.sman1gedeg.sch.id/api/v1/members/lookup?nisn={nisn}`).
  - Automatically verifies student active status and synchronizes official academic grade/class.
  - SMANSAGE students verified through ScholarGate are completely exempt from uploading student ID cards.
- **Fuzzy Name Similarity Matching & Anti-Oversharing**:
  - Implemented token matching and Levenshtein distance similarity algorithm with tolerance for abbreviated names (e.g., `M. Ryan` vs `Muhammad Ardian Ryan`).
  - Strict privacy protection (anti-oversharing): Invalid NISN or mismatched names return generic error feedback without leaking official student identity records.
- **Dynamic Competition Bracket Controls**:
  - Added checkboxes in Admin Dashboard to enable/disable specific education brackets: SMA/MA, SMK, University/Mahasiswa, and General/Open.
  - Streamlined public registration form with smart checkbox (`Saya adalah siswa aktif SMA Negeri 1 Gedeg`) replacing rigid categorization.
- **Database Migration**:
  - Added non-destructive database auto-migration for `is_gedeg_verified` column in `participants` table.

---

## [1.2.0] - 2026-10-19

### Added
- **S3-Compatible Identity Document Upload (IDCloudHost Object Storage)**:
  - Added support for uploading supporting identity documents (Student ID card, National ID card / KTP, or College Student ID / KTM) for external and general participants.
  - Direct integration with IDCloudHost S3 Object Storage endpoint (`is3.cloudhost.id`), bucket `is3-storage.smage.my.id`, under directory path `/scc-ctfreg/<category>/<identifier>_<timestamp>_<random>.<ext>`.
  - Public document URL preview: `https://is3-storage.smage.my.id/scc-ctfreg/...`.
  - Identity document link is accessible directly in the Admin Dashboard participant table and included in formatted Excel `.xlsx` exports.
- **Simplified SMANSAGE Grade Selection**:
  - Streamlined internal school grades to **Grade X**, **Grade XI**, and **Grade XII**.
  - Internal student validation requires a valid NISN (min. 8 digits).
- **Automated GHCR Container Build & Publish Action**:
  - Added `.github/workflows/docker-publish.yml` GitHub Actions workflow for multi-architecture image builds (`linux/amd64`, `linux/arm64`) published to `ghcr.io/ardianryan/scc-portal`.
- **Comprehensive English Documentation & Licensing**:
  - Added GNU Affero General Public License v3.0 (`LICENSE`), matching the official GZCTF platform license.
  - Added Contributor Covenant Code of Conduct (`CODE_OF_CONDUCT.md`).
  - Added sanitized `.env.example` reference and `.gitignore` file.

### Security
- Protected all cloud credentials and database files from public git tracking.
- Implemented file upload type restrictions (JPEG, PNG, WEBP, PDF only) and 5MB size limit.

---

## [1.1.0] - 2026-10-19

### Added
- **Registration Date Window Scheduling**:
  - Configurable start datetime (`reg_start_at`) and deadline datetime (`reg_end_at`) accessible via the Admin Dashboard.
  - Automatic schedule validation on frontend form and backend API with clear localization feedback.
  - Manual emergency toggle (Open / Closed) overriding scheduled dates.
- **At-Rest AES-256-GCM Encryption**:
  - Encrypted sensitive credential fields (`smtp_pass`) in local SQLite database using authenticated AES-256-GCM.

### Security & Polish
- Removed inline JavaScript `onclick` handlers on printable ticket cards to enforce strict Content Security Policy (`helmet`).
- Added `rel="noopener noreferrer"` attributes across all external links with `target="_blank"`.
- Added standard `autocomplete` attributes to login inputs for enhanced browser security.
- Cleaned em dashes to maintain high typographical craftsmanship.

---

## [1.0.0] - 2026-10-19

### Added
- Initial release of the SCC::CTF 2026 Registration Portal.
- Step 1 Onboarding Wizard (Official regulations, AI whitelist policy, and multi-platform tooling setup guide).
- Step 2 Registration Form supporting both Individual and Team participation modes.
- Step 3 Automated synchronization with GZCTF platform API (account creation, team provisioning, and automatic invite-code joining).
- Transactional notification emails via Microsoft 365 SMTP.
- Protected Admin Dashboard with live statistics and Excel `.xlsx` export.
