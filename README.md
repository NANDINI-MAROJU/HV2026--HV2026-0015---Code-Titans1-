CampusOps 360 is a centralized, full-stack campus operations and facility grievance redressal management system designed to streamline institutional maintenance and operational workflows. It replaces manual complaint registers and fragmented communication channels with a real-time digital pipeline connecting students, maintenance personnel, and administrative leadership.
Core Objectives & Architecture

    Streamlined Issue Reporting: Enables students and faculty to submit facility grievances (such as electrical, plumbing, IT, or sanitation issues) with category tags, urgency levels, and photo attachments.

    Location-Based QR Dispatch: Supports scanning location-specific QR codes to auto-populate building, floor, and room details, eliminating manual entry errors and speeding up triage.

    Role-Based Delegation: Features dedicated dashboards for:

        Students/Faculty: To file complaints, track real-time resolution progress, and receive updates.

        Maintenance Staff: To view assigned tasks, update job progress, and attach proof of resolution.

        Administrators: To monitor facility turnaround time (TAT), review bottleneck trends, allocate manpower, and track campus-wide resolution rates.

    Unified Single-Server Deployment: Built with a React + Vite frontend served alongside an Express.js REST API and backed by an embedded, high-performance SQLite (better-sqlite3) database for low latency and zero-configuration data persistence.
# 🏫 CampusOps 360 — Smart Campus Operations & Grievance Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-blue?style=for-the-badge&logo=render)]()
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![SQLite](https://img.shields.io/badge/Database-better--sqlite3-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

A centralized, real-time campus operational and facility grievance redressal platform. **CampusOps 360** streamlines issue reporting, automated staff delegation, QR-code location logging, and administrative analytics across campus infrastructure.

---

## 🌐 Live Demo & Credentials

**Live Application URL:** [https://campus-ops-system-bzmh.onrender.com](https://campus-ops-system-bzmh.onrender.com)

### 🔑 Demo Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `password123` | Full system analytics, staff assignment, ticket triage, department controls |
| **Staff** | `ramesh@campus.edu` | `password123` | View assigned work tickets, update progress, upload resolution proof |
| **Student / Faculty** | `student@campus.edu` | `password123` | Lodge complaints, upload photos, track resolution timeline |

> **Note:** The system also supports automatic registration and dynamic role routing for custom email formats (e.g., any email containing `admin` automatically configures administrative privileges).

---

## ✨ Key Features

* **📷 Multimodal Grievance Reporting:** Lodge complaints with category tagging, urgency indicators, and multimedia attachments.
* **📍 QR Code Quick-Logging:** Scan location-specific QR codes to auto-populate block, floor, and room information without manual typing.
* **⚡ Role-Based Dashboards:** Distinct tailored interfaces for Students, Maintenance Staff, and Campus Administrators.
* **🛠️ Automated Task Triage:** Route electrical, plumbing, sanitation, and IT issues directly to relevant maintenance supervisors.
* **📊 Administrative Analytics:** High-level metrics tracking resolution rates, average turnaround time (TAT), and facility bottleneck trends.
* **🔔 Live Notification Feed:** Status change tracking and updates from ticket submission through verification and resolution.

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 18, Vite
* **Routing:** React Router v6
* **State & Network:** Context API, Axios
* **Styling:** Modern Responsive CSS / Tailwind CSS

### Backend & Storage
* **Runtime:** Node.js (v20.x LTS), Express.js
* **Database:** SQLite via `better-sqlite3` (High-throughput, synchronous disk-backed SQL)
* **Authentication:** JWT (JSON Web Tokens), Bcrypt.js hashing
* **File Uploads:** Multer multipart engine

---

## 🚀 Local Development Setup

### Prerequisites
* Node.js `20.18.0` or higher
* npm `10.x` or higher
* Git
