# Core Unleashed | Campus Placement Portal 🚀

Core Unleashed (HireHub) is a comprehensive, modern campus placement and recruitment management system. It's designed to streamline the entire job application lifecycle—combining recruitment management, personal student profile tracking, and automated attendance solutions.

---

## 🏗 Tech Stack

| Component         | Technologies                                                                 |
| ----------------- | ---------------------------------------------------------------------------- |
| **Frontend**      | HTML5, CSS3 (Vanilla), JavaScript (ES6+), Inter Font, Lucide Icons             |
| **Backend**       | Firebase (Authentication, Firestore, Storage)                                  |
| **Integrations**  | AI-powered Resume Analysis, QR-based Attendance Tracking, Chat System           |
| **Development**   | Node.js, npm, VS Code                                                         |

---

## 📂 Features & Workflow

### 🎓 For Students
- **Smart Profile**: Build and manage your professional profile with ease.
- **AI Resume Builder**: Generate optimized resumes tailored for top-tier companies.
- **Job Explorer**: Search, filter, and apply for the latest job/internship openings.
- **Drive Calendar**: Keep track of upcoming campus drives and pre-placement talks.
- **QR Attendance**: Sign-in seamlessly to mandatory placement sessions using a built-in QR scanner.
- **Alumni Mentorship**: Directly communicate with alumni for guidance and industry insights.

### 💼 For Recruiters
- **Signup & Verification**: Secure recruiter onboarding (verified by administrators).
- **Manage Openings**: Create, edit, and post job descriptions directly to the student portal.
- **Candidate Pipeline**: Filter and shortlist applicants through a centralized dashboard.
- **Communication**: Directly invite students and send interview schedules.

### 🛡 For Administrators
- **Dashboard Overview**: Monitor active drives, total students, and recruiter demographics.
- **Recruiter Approval**: Review and approve new company registrations.
- **Profile Verification**: Ensure student data integrity before placement cycles.
- **Real-time Attendance**: Access real-time attendance logs for all placement-related events.

---

## 🛠 Procedure to Access & Run

Follow these steps to set up the project locally:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- A modern web browser (Chrome, Edge, Firefox).

### 2. Clone the Repository
```bash
git clone https://github.com/TXPratham/Core-Unleashed.git
cd Core-Unleashed
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configuration
Ensure your Firebase configuration is correctly set up in:
`firebase_setup.js`

You will need to create a project on the [Firebase Console](https://console.firebase.google.com/) and enable:
- **Authentication** (Email/Password & USN-based login)
- **Cloud Firestore**
- **Firebase Storage**

### 5. Launch the Application
- If using **VS Code**, use the **Live Server** extension to open `index.html` (the login page) or `home.html`.
- Alternatively, you can run a simple local server in the root directory:
```bash
npx live-server .
```

---

## 🚀 Future Roadmap
- [ ] Direct Interview Scheduling integration.
- [ ] AI-based job recommendations based on profile strength.
- [ ] Native Mobile App version for Android & iOS.

---

Developed with ❤️ by the Core Unleashed Team.
