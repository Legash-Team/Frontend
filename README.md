# Legash — Frontend Web Application

Legash is a Smart Blood Donation Management System designed to connect blood donors, hospitals, and blood centers through a unified digital platform.

This repository, **legash-web**, contains the web application used by hospitals, blood centers, administrators, and super administrators. It provides interfaces for hospital management, blood stock monitoring, blood requisitions, donor coordination, event publishing, and administrative operations.

## Repository Information

**Project:** Legash — Smart Blood Donation Management System

**Repository:** Legash-Team/Frontend

**Architecture:** React 18 and TypeScript Single Page Application (SPA).

**Primary Responsibility:** Web application architecture, dashboard development, user interface design, localization, role-based access control, and integration with the Legash Backend API.

---

## Contributors

- Hanan Seid Mohammed — CTC-3381-26
- Enkumariam Dejene Tegegn — CTC-551-26

---

## Tech Stack

- React 18 — User interface library
- TypeScript — Type-safe JavaScript
- Vite — Development server and build tool
- CSS — Styling and responsive layouts
- REST API — Backend communication
- i18n — Internationalization and multilingual support

## Engineering Team & Responsibilities

The frontend is developed through collaboration between two engineers, with responsibilities covering frontend architecture and design systems, dashboard experiences, multilingual localization, hospital medical records, registration workflows, inventory management, and facility administration.

### 1. Hanan Seid Mohammed

**Web Frontend Lead & Design Systems**

**Institutional ID:** CTC-3381-26

**Primary Responsibilities:**

**React 18 & TypeScript SPA Architecture:** Leads the frontend application architecture, organizing the React and TypeScript codebase into maintainable and reusable modules while establishing consistent development patterns across the application.

**Design Systems:** Leads the development and maintenance of shared design systems, reusable UI components, and consistent interface patterns to ensure a unified user experience across different dashboards and application modules.

**Hospital Dashboard UX:** Oversees hospital dashboard user experience improvements, including dashboard layouts, navigation, information presentation, and workflows for hospital users.

**Blood Center Dashboard UX:** Leads the design and improvement of blood center dashboard experiences, ensuring that blood center users can efficiently access their operational information and management features.

**Multilingual Localization Engine:** Implements the frontend localization engine supporting English, Amharic, and Afaan Oromo (EN/AM/OM), including translation management and consistent language handling across the application.

**Hospital Medical Records:** Develops and maintains hospital medical record interfaces, including donor information, donation history, donation outcomes, and clinical record presentation.

**Donor Intake Workflows:** Implements and improves frontend workflows used by hospitals to register donor intake information and manage donation-related interactions.

**Role-Based Access Control (RBAC):** Implements frontend route guards and permission-based navigation to ensure that hospital staff, blood centers, administrators, and super administrators can access only the pages and functionality authorized for their roles.

**Frontend Architecture & Integration:** Coordinates the frontend structure and integration with backend APIs, ensuring that dashboard modules, user permissions, and application workflows operate consistently.

### 2. Enkumariam Dejene Tegegn

**Web Applications Engineer**

**Institutional ID:** CTC-551-26

**Primary Responsibilities:**

**Hospital Registration & Onboarding:** Develops hospital registration and onboarding workflows, including registration forms, input handling, validation, submission processes, and the user experience throughout the hospital onboarding journey.

**Real-Time Blood Stock Ledger:** Implements the hospital blood stock management interface through the BloodStockPage, supporting the display and management of real-time inventory across all eight ABO/Rh blood groups.

**Blood Requisition Management:** Develops hospital blood requisition interfaces and workflows, allowing healthcare facilities to submit, monitor, and manage requests for blood supplies.

**Facility Profile Administration:** Implements facility profile management functionality, including profile information display, profile editing, form handling, and integration with backend profile services.

**Terms & Privacy Components:** Develops reusable terms and privacy-related components used across registration, onboarding, and other relevant application workflows.

**Layout Modularization:** Improves frontend layout organization and component modularization to promote reusability, maintainability, and consistency across application pages.

**Form Development & Validation:** Develops and maintains application forms and their supporting components, ensuring consistent input handling, validation, and data submission behavior.

**Backend API Integration:** Integrates hospital registration, blood inventory, requisition, and facility profile interfaces with their corresponding backend API endpoints.

## Getting Started

### Prerequisites

- Node.js (v20 or later recommended)
- npm
- Git

### Installation

Clone the repository and install dependencies:

```bash
git clone <frontend-repository-url>
cd Frontend
npm install
```

### Environment Configuration

Create a `.env` file in the root directory and configure the backend API URL:

```env
VITE_API_URL=http://localhost:3000/api
```

For production, use the deployed backend API URL.

### Running the Application

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

`http://localhost:5173`

## Production Build

Generate the production build:

```bash
npm run build
```

## Backend Integration

The frontend communicates with the Legash Backend API through RESTful endpoints.

The backend handles authentication, authorization, database operations, donation workflows, inventory management, and other business logic, while the frontend provides the corresponding user interfaces.

Ensure that the backend is running and that `VITE_API_URL` points to the correct API environment.

## Testing

Build the application:

```bash
npm run build
```

Run additional available tests and checks using the scripts defined in `package.json`.

Verify affected pages, API integrations, responsive layouts, and role-based access behavior before submitting changes.

## Git Workflow

- Create a separate branch for each task.
- Keep changes focused on the assigned feature or fix.
- Open a pull request for review.
- Verify the production build before merging.
- Avoid committing directly to the main branch.
