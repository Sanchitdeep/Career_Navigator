
Candidate Name:- Sanchitdeep Singh
Roll No - B22128
Run Commands:-
**Start the backend server:**
   ```bash
   cd Career_Navigator_
   cd backend
   # Install dependencies
   npm install

   # Start sever
   npm start
   ```

   You should see:
   ```
   ✓ Backend server running on http://localhost:5000
   ✓ CORS enabled for http://localhost:5173
   ```

### Step 3: Setup Frontend

1. **In a new terminal, navigate to frontend folder:**
   ```bash
   cd Career_Navigator_
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

**AI Disclosure**

**1. Did you use an AI assistant?**
Yes, I used AI tools like ChatGPT and GitHub Copilot during development.

**2. How did you verify the suggestions?**
I verified all AI-generated suggestions by:

* Testing them in my local development environment 
* Modifying outputs to match my architecture and use case

**3. Example of a suggestion I rejected or changed:**
In one case, the AI suggested using an older Gemini model (`gemini-1.5-flash`), which resulted in API errors. After checking the available models using the API, I updated the implementation to use a supported model (`gemini-2.5-flash`). 


**Tradeoffs & Prioritization**

**1. What did you cut to stay within the 4–6 hour limit?**
Due to time constraints, I focused on building a functional end-to-end pipeline (resume → skill extraction → gap analysis → roadmap generation). I intentionally deprioritized:

* Database integration for storing user data and past analyses
* Advanced UI/UX improvements and dashboards
* Authentication and user accounts
* Embedding-based semantic skill matching (used simpler matching instead)
* Optimized API usage (retry queues, caching layers, etc.)

This allowed me to prioritize core functionality and ensure the main workflow was reliable.

---

**2. What would you build next if you had more time?**
If given more time, I would extend the project into a more complete “AI Career Assistant” by adding:

* **Database integration** (MongoDB) to store resumes, past analyses, and learning progress
* **User dashboard** to track previous reports and improvement over time
* **Embedding-based skill matching** for more accurate gap analysis
* **Smart job recommendations** with match percentage for multiple roles
* **Resume scoring and feedback system** with actionable suggestions
* **Project and interview question generator** based on target roles
* **Better API handling** with caching, rate-limit handling, and multi-model fallback (Gemini + Groq)

---

**3. Known Limitations**

* Current skill matching is partially rule-based and may miss semantic similarities (e.g., “REST APIs” vs “API development”)
* No persistent storage — analysis is not saved for future reference
* API rate limits can affect performance (fallback mechanisms are used but reduce accuracy)
* Generated roadmaps depend on LLM responses and may vary in quality
* Limited personalization due to lack of user history and progress tracking

---

**4. Additional Improvements**

* Allow users to revisit and compare past resume analyses
* Add progress tracking for learning roadmap completion
* Integrate real-world job data (salary, demand, trending skills)
* Improve UI with visual analytics (charts, skill gaps, progress bars)




Career_Navigator/
├── backend/
│   ├── package.json              # Backend dependencies
│   ├── .env                      # Environment variables (API keys)
│   ├── server.js                 # Express server entry point
│   ├── routes/
│   │   └── analysisRoutes.js    # API route definitions
│   ├── controllers/
│   │   └── analysisController.js # Request handlers
│   ├── utils/
│   │   ├── comprehensiveAnalyzer.js # Gemini API for all analysis (skills, gap, roadmap, questions)
│   │   └── csvParser.js            # CSV parsing and caching
│   └── data/
│       └── IT_Job_Roles_Skills.csv  # 400+ IT roles with descriptions & certifications
│
├── frontend/
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   ├── index.html                # HTML entry point
│   └── src/
│       ├── main.jsx              # React app entry
│       ├── App.jsx               # Main component
│       ├── App.css               # App styles
│       ├── index.css             # Global styles
│       ├── components/
│       │   ├── ResumeUpload.jsx # Resume upload component
│       │   ├── RoleSelector.jsx # Role selection component
│       │   └── ResultsDashboard.jsx # Results display component
│       └── api/
│           └── client.js         # API client (axios)
│
└── README.md                     # This file
```
