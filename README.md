# SkillSage

![SkillSage Banner](./rules/projectimage.png)

**SkillSage** is an enterprise-grade technical assessment and interview platform inspired by HackerRank and CodeSignal. It enables organizations to assess, interview, and hire top technical talent, while empowering candidates to develop and showcase their coding skills. SkillSage features live coding interviews, AI-powered analytics, real-time video calls, and a modern, intuitive user experience.

---

## 🚀 Features

- **Real-world Coding Challenges**: Practice and assess with industry-standard problems.
- **Live Coding Interviews**: Conduct interviews with an integrated code editor and real-time video/screen sharing.
- **AI-Powered Analysis**: Get smart insights, code quality feedback, and candidate ranking with AI.
- **Role-Based Dashboards**: Separate dashboards for recruiters and candidates.
- **Skill Analytics**: Track progress and performance with detailed analytics.
- **Secure Authentication**: Robust user management and security.
- **Enterprise Ready**: Scalable for organizations of any size.

---

## 🛠️ Tech Stack

### Frontend
- **React** (Vite, Redux Toolkit)
- **Radix UI** & **Tailwind CSS** for modern UI
- **Monaco Editor** for code editing
- **Socket.IO** for real-time features

### Backend
- **Spring Boot** (Java 21)
- **Spring Security & JWT** for authentication
- **Spring Data JPA** for database operations

### Real-Time Signaling
- **Node.js** WebRTC Signaling Server
- **Socket.IO** for video call signaling

### AI & Analytics
- **AI Analysis**: Automated code review, candidate ranking, and feedback (integrated via backend and AI components)
- **Smart Analytics**: Performance metrics, skill gap analysis, and recommendations

---

## 📦 Project Structure

```
SkillSage/
├── FRONTEND/        # React frontend
├── backend/         # Spring Boot backend
├── node-backend/    # Node.js WebRTC signaling server
└── README.md
```

---

## ⚡ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/SkillSage.git
cd SkillSage
```

### 2. Setup the Backend (Spring Boot)
```bash
cd backend
# Configure your database in application.properties
./mvnw spring-boot:run
```

### 3. Setup the Frontend (React)
```bash
cd ../FRONTEND
npm install
npm run dev
```

### 4. Start the WebRTC Signaling Server
```bash
cd ../node-backend
npm install
npm start
```

---

## 🤖 About the AI Features

SkillSage leverages AI to enhance the assessment and interview process:
- **Automated Code Review**: AI analyzes code submissions for correctness, efficiency, and best practices.
- **Candidate Ranking**: AI models evaluate and rank candidates based on performance and code quality.
- **Skill Insights**: Personalized feedback and recommendations for skill improvement.
- **Plagiarism Detection**: Ensures code originality using AI-powered similarity checks.

*Note: Some AI features require API keys or integration with third-party AI services. Configure these in your backend settings.*

---

## 📚 Documentation
- [API Reference](./backend/docs)
- [Frontend Docs](./FRONTEND/README.md)
- [WebRTC Server Docs](./node-backend/README.md)

---

## 👥 Contributing
We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) first.

---

## 📝 License
This project is licensed under the MIT License.

---

## 🌟 Acknowledgements
- Inspired by [HackerRank](https://www.hackerrank.com/) and [CodeSignal](https://codesignal.com/)
- Built with ❤️ by the SkillSage Team
