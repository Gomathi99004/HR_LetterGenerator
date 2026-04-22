HR Letter Generator & AI Assistant

📌 Overview  
This is a full-stack HR application designed to automate and simplify the generation of standard HR documents, including Offer Letters, Experience Letters, and Relieving Letters. It features both a form-based generator and an AI chat assistant.

🚀 Features  
- AI Chat Assistant: Generate HR letters using natural conversation with an OpenAI-powered assistant  
- Quick Generator: Fill structured forms with validation for instant document creation  
- Template Management: Upload and manage `.docx` templates  
- Multiple Document Types: Offer, Experience, and Relieving Letters  
- Export Options: Download in DOCX and PDF formats  

🧠 Tech Stack  

Backend (HR-B)  
- FastAPI  
- MongoDB (motor)  
- docxtpl, docx2pdf  
- OpenAI API (openai, openai-agents)  
- Python  

Frontend (HR-F)  
- React + Vite  
- Tailwind CSS  
- Lucide React  
- JavaScript (ES6+)  

📋 Prerequisites  
- Node.js (v18+)  
- Python (v3.9+)  
- MongoDB  
- Microsoft Word (for PDF conversion)  
- OpenAI API Key  

🛠️ Setup  

Backend  
cd HR-B  
python -m venv venv  
source venv/bin/activate  (macOS/Linux)  
venv\Scripts\activate     (Windows)  
pip install -r requirements.txt  
uvicorn app.main:app --reload  

Frontend  
cd HR-F  
npm install  
npm run dev  

App runs at http://localhost:5173  

🏗️ Architecture  
- HR-B → Backend APIs, database, template processing  
- HR-F → Frontend UI (Chat, Forms, Templates)  
