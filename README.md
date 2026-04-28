
# Doxio

## An AI-powered Assignment & Document Automation Platform

Doxio is a next-generation academic tool designed to revolutionize the way students and professionals create structured documents. By leveraging advanced AI, Doxio automates the entire assignment workflow—from initial research and citation management to final document generation.

---

## ✨ Features

### 📄 Structure-First Document Generation
*   **Smart Template Engine**: Define your document structure once and let the AI populate it with high-quality, context-aware content.
*   **Deep Content Generation**: Generates comprehensive assignments, research papers, lab reports, and more, tailored to your specific requirements.

### 📚 AI-Powered Research
*   **Web Search Integration**: Automatically searches the web for relevant information based on your assignment topic.
*   **Automatic Citations**: Cites sources in real-time using APA, MLA, and Chicago styles, ensuring academic integrity.
*   **Citation Management**: A built-in library to manage all your references in one place.

### 📝 Academic Tools
*   **Plagiarism Detection**: Advanced algorithms to ensure your content is 100% original.
*   **Grammar & Style Correction**: Refines your writing to match professional and academic standards.
*   **Tone Adjustment**: Switch between formal, semi-formal, and technical tones effortlessly.

### ⚡ Lightning Fast & Efficient
*   **Instant Generation**: Get full document drafts in seconds, not hours.
*   **Real-time Preview**: See your document come to life as the AI writes.
*   **Multi-Format Export**: Export to DOCX, PDF, and Markdown with perfect formatting.

### 🎨 Stunning User Experience
*   **Dark Mode Native**: A beautiful, eye-strain-reducing dark interface.
*   **Smooth Animations**: Built with Framer Motion for a fluid and premium feel.
*   **Interactive Dashboard**: Manage your projects with an intuitive and visually striking dashboard.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) (Next.js 14+)
*   **Styling**:
    *   [Tailwind CSS](https://tailwindcss.com/)
    *   [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Shared Components**: Custom components for SplitText, Hyperspeed, BorderGlow, etc.

### Backend
*   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
*   **Database**: [PostgreSQL](https://www.postgresql.org/)
*   **Libraries**:
    *   `python-multipart`: For file uploads and forms
    *   `httpx`: For async HTTP requests to LLMs
    *   `pydantic`: For data validation and serialization
    *   `python-dotenv`: For environment variable management

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.8+)
*   [PostgreSQL](https://www.postgresql.org/)
*   [LLM API Key](https://platform.openai.com/) (e.g., OpenAI API Key)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd Assign-Strutured
    ```

2.  **Backend Setup**
    *   Navigate to the backend directory:
        ```bash
        cd backend
        ```
    *   Install dependencies:
        ```bash
        pip install -r requirements.txt
        ```
    *   Create a `.env` file based on `.env.example`:
        ```bash
        cp .env.example .env
        # Edit .env with your actual values
        ```
    *   Run the server:
        ```bash
        uvicorn main:app --reload
        ```

3.  **Frontend Setup**
    *   Navigate to the frontend directory:
        ```bash
        cd ../frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file based on `.env.example`:
        ```bash
        cp .env.example .env
        # Edit .env with your actual API URL if needed
        ```
    *   Run the development server:
        ```bash
        npm run dev
        ```

4.  **Access the App**
    Open [http://localhost:3000](http://localhost:3000) in your browser to use Doxio!

---

## 📂 Project Structure

```
Assign-Strutured/
├── frontend/
│   ├── src/
│   │   ├── shared/       # Reusable UI components
│   │   ├── pages/        # Main pages (LandingPage, Dashboard, etc.)
│   │   └── features/     # Feature modules (Auth, Assignments)
│   └── public/           # Static assets
├── backend/
│   ├── main.py           # FastAPI app entry point
│   ├── requirements.txt  # Python dependencies
│   ├── .env.example      # Environment variable template
│   └── app/
│       ├── api/          # API endpoints
│       ├── services/     # Business logic & LLM integrations
│       ├── models/       # Database models (SQLAlchemy)
│       └── schemas/      # Pydantic validation schemas
├── .gitignore
├── README.md
└── package.json
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new feature, a bug fix, or a UI improvement, we appreciate your help.

### Steps
1.  Fork the repository
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Doxio Team** - [EMAIL_ADDRESS]

**Project URL**: https://doxio.ai
