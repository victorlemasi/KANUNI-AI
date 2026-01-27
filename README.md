# KANUNI AI - Governance Intelligence Platform

**KANUNI AI** (Swahili for "Rule/Law") is a next-generation institutional governance platform designed to automate risk assessment for procurement, legal contracts, and internal audits.

## 🚀 Core Modules

The platform features four specialized analysis engines powered by BERT (`mobilebert-uncased-mnli`):

### 1. 🏢 Standard Procurement
- **Goal**: General risk assessment for institutional documents.
- **Checks**: PFM Act compliance, Vendor concentration, Fraud indicators.

### 2. ⚖️ Contract Review
- **Goal**: Automate legal risk detection in agreements.
- **Checks**: Presence of *Termination*, *Indemnity*, *Liability*, *Confidentiality*, and *Governing Law* clauses.
- **Critical Alerts**: Flags "Unlimited Liability" and missing protections.

### 3. 🚨 Fraud Detection
- **Goal**: Identify financial irregularities and corruption risks.
- **Checks**:
    - **Benford's Law Indicators**: Suspicious round-dollar amounts (e.g., $50,000.00).
    - **High-Risk Keywords**: "Facilitation", "Expedite", "Bearer cash", "Gift".

### 4. 📋 Internal Audit
- **Goal**: Verify evidence readiness for audit trails.
- **Checks**: Presence of *Invoice Numbers*, *Dates*, *Total Amounts*, and *Approval Signatures*.
- **Output**: Auto-generated compliance checklist.

## 🛠️ Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Glassmorphism Design System
- **AI Engine**: @xenova/transformers (Client/Server hybrid)
- **Persistence**: LocalStorage (Institutional Memory) & File System (Node.js)

## 📦 Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 📖 Usage
1.  **Select Mode**: Toggle between Procurement, Contract, Fraud, or Audit mode on the dashboard.
2.  **Upload**: Drag & drop PDF or Word (.docx) files.
3.  **Analyze**: AI generates a real-time risk score, compliance report, and actionable suggestions.
4.  **Save/Export**: Download the report as a `.txt` file or view it in the **Saved Reports** dashboard.

## 🛡️ Pillars of Governance
- **Decision Intelligence**: AI-driven risk scoring to support human decision-making.
- **Compliance Automation**: Automated checks against regulatory frameworks.
- **HITL Governance**: Human-in-the-Loop design ensuring AI assists rather than replaces oversight.

---
(c) 2024 KANUNI AI - Decision Certainty
