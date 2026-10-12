# CareerCompass AI — Security and Privacy Architecture

## 1. Threat Model & Mitigation Strategy

| Threat Category | Potential Risk | Mitigation in CareerCompass AI |
|---|---|---|
| **Broken Object Level Auth (BOLA)** | User A reads/updates User B's resume or roadmap via URL ID | Strict tenant checks in every repository and service query (`WHERE user_id = current_user.id`) |
| **Malicious File Upload** | Executable script or zip bomb uploaded as PDF | MIME type inspection, file extension check, max file size guard (10MB), isolated disk storage |
| **Prompt Injection** | Adversarial text in resume overriding LLM instructions | Resume content treated strictly as passive data inside JSON delimiters with delimited prompt sandboxing |
| **Credential Theft** | Brute force or database breach leaking passwords | Argon2 / BCrypt one-way password hashing with salt; JWT tokens signed with SHA-256 |
| **Data Leakage** | Logging passwords or personally identifiable info (PII) | Structured logging filters out passwords, authorization headers, and raw resume file contents |
| **Cross-Origin Abuse** | Unrestricted domain requests | Configurable CORS middleware limiting origins to specified client domains |

---

## 2. Authentication & Session Strategy
- **Token Type**: JSON Web Tokens (JWT) signed with `HS256`.
- **Claims**:
  - `sub`: User ID (subject)
  - `email`: User email
  - `is_superuser`: Boolean administrative flag
  - `exp`: Standard UTC expiration timestamp
- **Transport**: Standard HTTP `Authorization: Bearer <token>` headers.
- **Revocation / Invalidation**: Client-side storage purge upon logout; user active state verification on every protected route.

---

## 3. Data Privacy & GDPR Compliance
- **Right to Access**: Users can view and export their complete profile, parsed resumes, and generated roadmaps.
- **Right to Erasure**: Endpoint `DELETE /api/v1/users/account` completely cascades and deletes user records, associated profile, uploaded resume files from the file system, analyses, job matches, and learning roadmaps.
- **Isolated Storage**: Uploaded documents are saved under `uploads/resumes/{user_id}/{uuid}.{ext}` with restrictive filesystem permissions.
