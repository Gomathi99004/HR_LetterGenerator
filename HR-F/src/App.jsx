import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, FileText, Upload, Download, Send, RefreshCw, Check, AlertCircle, Briefcase, UserMinus, FilePlus, Menu, X
} from 'lucide-react';

// --- CONFIGURATION ---
const API_BASE_URL = "http://localhost:8000/api/v1";
const BASE_URL = "http://localhost:8000"; 

// --- UTILITY COMPONENTS ---
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "primary", disabled = false, className = "", type = "button" }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-400",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
    ghost: "text-gray-500 hover:bg-gray-100"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${disabled ? 'cursor-not-allowed opacity-70' : ''} ${className}`}>{children}</button>;
};

const InputGroup = ({ label, name, value, onChange, type = "text", placeholder, required = false, options = null, helper = null, error = null, min = null, step = null }) => (
  <div className="space-y-1">
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select name={name} value={value} onChange={onChange} className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'}`}>
        <option value="">Select...</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    ) : (
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        min={min}
        step={step}
        className={`w-full p-2.5 bg-gray-50 border rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'}`} 
      />
    )}
    {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle size={10} /> {error}</p>}
    {!error && helper && <p className="text-xs text-gray-400">{helper}</p>}
  </div>
);

// --- MAIN MODULES ---

// 1. CHAT INTERFACE
const ChatModule = () => {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null); 

  useEffect(() => {
    setSessionId(crypto.randomUUID());
    setMessages([{ role: "bot", text: "Hello! I'm your HR Assistant. I can help you generate Offer, Experience, or Relieving letters. Which one would you like to create today?" }]);
  }, []);

  // Auto-scroll
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!loading) setTimeout(() => inputRef.current?.focus(), 10); }, [loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const payload = { session_id: sessionId, message: userMsg.text };
      if (messages.length === 1) {
        const lowerMsg = userMsg.text.toLowerCase();
        if (lowerMsg.includes("offer")) payload.letter_type = "offer";
        else if (lowerMsg.includes("experience")) payload.letter_type = "experience";
        else if (lowerMsg.includes("relieving")) payload.letter_type = "relieving";
      }

      const res = await fetch(`${API_BASE_URL}/chat/message`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to connect to server");
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.message, result: data.result, isError: data.status === 'error' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", text: "⚠️ Error connecting to server.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([{ role: "bot", text: "Session reset. How can I help you?" }]);
  };

  // FIX: Use h-full to fill the parent flex container
  return (
    <Card className="h-full flex flex-col shadow-md">
      <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-gray-700">AI Assistant</span>
        </div>
        <Button variant="ghost" onClick={resetChat} className="text-xs py-1 px-2"><RefreshCw size={14} /> Reset</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : msg.isError ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
              {msg.result && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-green-700 font-medium text-xs flex items-center gap-2 mb-2"><Check size={14} /> Document Ready</div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`${BASE_URL}${msg.result.docx_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-xs font-medium no-underline shadow-sm">
                        <FileText size={14} /> Download DOCX
                    </a>
                    {msg.result.pdf_url && (
                        <a href={`${BASE_URL}${msg.result.pdf_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-xs font-medium no-underline shadow-sm">
                            <FileText size={14} /> Download PDF
                        </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2 shrink-0">
        <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your answer..." className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm" disabled={loading} />
        <Button onClick={sendMessage} disabled={loading || !input.trim()} className="px-3"><Send size={18} /></Button>
      </div>
    </Card>
  );
};

// 2. GENERATOR FORM (Same as before)
const GeneratorModule = () => {
  const [activeTab, setActiveTab] = useState("offer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});
  
  const initialOffer = { 
    ref_no: "", candidate_name: "", address_line1: "", address_line2: "", 
    city: "", state: "", pincode: "", designation: "", joining_date: "", 
    annual_ctc: "", holidays_count: 10, insurance_premium_monthly: 0, 
    medical_insurance_details: "", band: "I", has_bond: false, 
    letter_date: new Date().toISOString().split('T')[0] 
  };
  
  const initialExp = { candidate_name: "", job_title: "", joining_date: "", last_working_day: "" };
  const initialRel = { candidate_name: "", emp_id: "", job_title: "", department: "", joining_date: "", last_working_day: "" };
  const [formData, setFormData] = useState(initialOffer);

  const switchTab = (tab) => { 
    setActiveTab(tab); setResult(null); setErrors({});
    if(tab==='offer') setFormData(initialOffer); 
    if(tab==='experience') setFormData(initialExp); 
    if(tab==='relieving') setFormData(initialRel); 
  };

  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  const handleChange = (e) => { 
    const { name, value, type, checked } = e.target; 
    let finalValue = type === 'checkbox' ? checked : value;

    const titleCaseFields = ["candidate_name", "address_line1", "address_line2", "city", "state", "designation", "medical_insurance_details", "job_title", "department"];
    if (type === 'text' && titleCaseFields.includes(name) && value) {
      finalValue = value.replace(/\b\w/g, l => l.toUpperCase());
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if(errors[name]) setErrors(prev => ({...prev, [name]: null}));
  };

  const validate = () => {
    const newErrors = {};
    const alphaRegex = /^[a-zA-Z\s\.]+$/;
    const empIdRegex = /^[a-zA-Z0-9-_]+$/;
    const pincodeRegex = /^\d{6}$/;

    if (!formData.candidate_name || formData.candidate_name.length < 2 || !alphaRegex.test(formData.candidate_name)) newErrors.candidate_name = "Name must be 2+ alphabets only.";
    if (!formData.joining_date) newErrors.joining_date = "Joining Date is required.";

    if (activeTab !== 'offer') {
      if (!formData.job_title || formData.job_title.length < 2 || !alphaRegex.test(formData.job_title)) newErrors.job_title = "Job title must be 2+ alphabets.";
      if (!formData.last_working_day) {
        newErrors.last_working_day = "Last Working Day is required.";
      } else {
        const jd = new Date(formData.joining_date);
        const lwd = new Date(formData.last_working_day);
        const today = new Date();
        if (lwd <= jd) newErrors.last_working_day = "Last Working Day must be AFTER Joining Date.";
        if (jd > today) newErrors.joining_date = "Joining Date cannot be in the future.";
        if (lwd > today) newErrors.last_working_day = "Last Working Day cannot be in the future.";
      }
      if (activeTab === 'relieving') {
        if (!formData.emp_id || !empIdRegex.test(formData.emp_id)) newErrors.emp_id = "Invalid ID (Alphanumeric, - or _ only).";
        if (!formData.department || !alphaRegex.test(formData.department)) newErrors.department = "Department must be alphabets only.";
      }
    }

    if (activeTab === 'offer') {
      if (!formData.annual_ctc || formData.annual_ctc < 30000) {
        newErrors.annual_ctc = "CTC must be at least 30,000.";
      }
      if (!pincodeRegex.test(formData.pincode)) newErrors.pincode = "Pincode must be exactly 6 digits.";
      if (!formData.designation || !alphaRegex.test(formData.designation)) newErrors.designation = "Invalid Designation.";
      if (!formData.city || !alphaRegex.test(formData.city)) newErrors.city = "City must be alphabets only.";
      if (!formData.state || !alphaRegex.test(formData.state)) newErrors.state = "State must be alphabets only.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validate()) return; 

    setLoading(true); setResult(null);
    const payload = { ...formData, letter_type: activeTab };
    if (payload.annual_ctc) payload.annual_ctc = parseFloat(payload.annual_ctc);
    
    try {
      const res = await fetch(`${API_BASE_URL}/generation/generate-letter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || await res.text());
      }
      setResult(await res.json());
    } catch (err) { alert("Generation failed: " + err.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-gray-200 p-1 rounded-xl w-fit">
        {[{ id: "offer", label: "Offer Letter", icon: FilePlus }, { id: "experience", label: "Experience", icon: Briefcase }, { id: "relieving", label: "Relieving", icon: UserMinus }].map((tab) => (
          <button key={tab.id} onClick={() => switchTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}> <tab.icon size={16} /> {tab.label} </button>
        ))}
      </div>
      <Card className="p-6 border-t-4 border-t-blue-600">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2"><h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div>Candidate Details</h3></div>
          
          <InputGroup label="Candidate Name" name="candidate_name" value={formData.candidate_name} onChange={handleChange} required error={errors.candidate_name} />
          
          {activeTab === 'offer' && ( <>
              <InputGroup label="Reference No" name="ref_no" value={formData.ref_no} onChange={handleChange} required error={errors.ref_no} />
              <InputGroup label="Designation" name="designation" value={formData.designation} onChange={handleChange} required error={errors.designation} />
              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
              <h3 className="md:col-span-2 text-sm font-bold text-gray-900 mb-1 flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div> Address</h3>
              <InputGroup label="Address Line 1" name="address_line1" value={formData.address_line1} onChange={handleChange} error={errors.address_line1} />
              <InputGroup label="Address Line 2" name="address_line2" value={formData.address_line2} onChange={handleChange} error={errors.address_line2} />
              <InputGroup label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city} />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="State" name="state" value={formData.state} onChange={handleChange} error={errors.state} />
                <InputGroup label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} error={errors.pincode} />
              </div>
              <div className="md:col-span-2 border-t border-gray-100 my-2"></div>
              <h3 className="md:col-span-2 text-sm font-bold text-gray-900 mb-1 flex items-center gap-2"><div className="w-1 h-4 bg-blue-600 rounded-full"></div> Compensation & Terms</h3>
              
              <InputGroup label="Annual CTC" type="number" name="annual_ctc" value={formData.annual_ctc} onChange={handleChange} min="30000" step="5" required error={errors.annual_ctc} />
              
              <InputGroup label="Joining Date" type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required error={errors.joining_date} />
              <InputGroup label="Letter Date" type="date" name="letter_date" value={formData.letter_date} onChange={handleChange} />
              <InputGroup label="Band" name="band" value={formData.band} onChange={handleChange} options={['I', 'II', 'III', 'IV', 'V'].map(b => ({ value: b, label: `Band ${b}` }))} />
              <InputGroup label="Medical Insurance" name="medical_insurance_details" value={formData.medical_insurance_details} onChange={handleChange} />
              
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="has_bond" checked={formData.has_bond} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded" />
                  <label className="text-sm font-medium text-gray-700">Does this position include an employment bond?</label>
                </div>
              </div>
            </>
          )}
          {(activeTab === 'experience' || activeTab === 'relieving') && ( <>
               {activeTab === 'relieving' && ( <> 
                  <InputGroup label="Employee ID" name="emp_id" value={formData.emp_id} onChange={handleChange} required error={errors.emp_id} />
                  <InputGroup label="Department" name="department" value={formData.department} onChange={handleChange} required error={errors.department} />
               </> )}
               <InputGroup label="Job Title" name="job_title" value={formData.job_title} onChange={handleChange} required error={errors.job_title} />
               <InputGroup label="Joining Date" type="date" name="joining_date" value={formData.joining_date} onChange={handleChange} required error={errors.joining_date} />
               <InputGroup label="Last Working Day" type="date" name="last_working_day" value={formData.last_working_day} onChange={handleChange} required error={errors.last_working_day} />
            </>
          )}
          <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
             {result ? (
               <div className="bg-green-50 border border-green-200 p-4 rounded-lg w-full">
                 <div className="flex items-center gap-2 text-green-800 font-medium mb-3"><Check size={18} /> Letter Generated Successfully!</div>
                 <div className="flex gap-3">
                   <a href={`${BASE_URL}${result.docx_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"><FileText size={16} /> Download DOCX</a>
                   {result.pdf_url && <a href={`${BASE_URL}${result.pdf_url}`} target="_blank" rel="noreferrer" className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"><FileText size={16} /> Download PDF</a>}
                   <Button variant="secondary" onClick={() => setResult(null)} className="ml-2">New</Button>
                 </div>
               </div>
             ) : (
               <Button variant="primary" type="submit" disabled={loading} className="w-full md:w-auto md:px-8">{loading ? "Generating..." : `Generate ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Letter`}</Button>
             )}
          </div>
        </form>
      </Card>
    </div>
  );
};

// 3. TEMPLATE MANAGER MODULE
const TemplateModule = () => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [type, setType] = useState("offer");
  const [status, setStatus] = useState(null);
  const handleUpload = async (e) => {
    e.preventDefault(); if (!selectedFile) return;
    setUploading(true); const formData = new FormData(); formData.append("file", selectedFile);
    try { const res = await fetch(`${API_BASE_URL}/templates/upload/${type}`, { method: "POST", body: formData }); if (!res.ok) throw new Error(); setStatus({ success: true, msg: "Template updated successfully!" }); } catch (err) { setStatus({ success: false, msg: "Upload failed." }); } finally { setUploading(false); setSelectedFile(null); }
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6"><div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><Upload size={24} /></div><div><h2 className="text-lg font-bold text-gray-800">Update Templates</h2><p className="text-sm text-gray-500">Upload new .docx templates to update the system.</p></div></div>
        <form onSubmit={handleUpload} className="space-y-6">
           <InputGroup label="Letter Type" name="type" value={type} onChange={(e) => setType(e.target.value)} options={[{ value: 'offer', label: 'Offer Letter' }, { value: 'experience', label: 'Experience Letter' }, { value: 'relieving', label: 'Relieving Letter' }]} />
           <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input type="file" accept=".docx" onChange={(e) => setSelectedFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-2"><FileText size={32} className="text-gray-400" /><span className="text-sm font-medium text-gray-600">{selectedFile ? selectedFile.name : "Click to browse or drag .docx here"}</span><span className="text-xs text-gray-400">Only .docx files are supported</span></div>
           </div>
           {status && <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${status.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{status.success ? <Check size={16} /> : <AlertCircle size={16} />}{status.msg}</div>}
           <Button variant="primary" type="submit" disabled={!selectedFile || uploading} className="w-full">{uploading ? "Uploading..." : "Upload New Version"}</Button>
        </form>
      </Card>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState("chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [{ id: "chat", label: "AI Chat Assistant", icon: MessageSquare }, { id: "generate", label: "Quick Generate", icon: FileText }, { id: "templates", label: "Manage Templates", icon: Upload }];
  
  useEffect(() => { window.scrollTo(0, 0); }, [view]);

  return (
    // FIX: Added 'flex flex-col h-screen overflow-hidden' to the root div
    <div className="h-screen bg-slate-50 font-sans text-gray-800 flex flex-col overflow-hidden">
      
      {/* Navbar: Fixed height, doesn't shrink */}
      <nav className="bg-white border-b border-gray-200 h-16 shrink-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
               <span className="font-bold text-xl tracking-tight text-gray-900">HR Agent</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
               {navItems.map(item => (
                 <button
                   key={item.id}
                   onClick={() => setView(item.id)}
                   className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                     view === item.id ? "text-blue-600 bg-blue-50" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                   }`}
                 >
                   <item.icon size={18} />
                   {item.label}
                 </button>
               ))}
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 p-2">
                 {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 p-4 space-y-2">
             {navItems.map(item => (
               <button
                 key={item.id}
                 onClick={() => { setView(item.id); setMobileMenuOpen(false); }}
                 className={`flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg ${
                   view === item.id ? "bg-blue-50 text-blue-600" : "text-gray-600"
                 }`}
               >
                 <item.icon size={18} />
                 {item.label}
               </button>
             ))}
          </div>
        )}
      </nav>

      {/* Main Content: Takes remaining height (100vh - 64px), scrollable if needed */}
      <main className="flex-1 overflow-hidden w-full">
        <div className={`h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${view === 'chat' ? 'py-4' : 'py-8 overflow-y-auto'}`}>
          
          {/* Chat View: Uses fixed layout */}
          {view === 'chat' && (
            <div className="max-w-3xl mx-auto h-full flex flex-col">
              <div className="mb-4 text-center shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">How can I help you today?</h1>
                <p className="text-gray-500">Interact with the AI to generate documents step-by-step.</p>
              </div>
              <div className="flex-1 min-h-0 pb-2">
                <ChatModule />
              </div>
            </div>
          )}
          
          {/* Other Views: Allow natural scrolling */}
          {view === 'generate' && (
            <div className="max-w-4xl mx-auto pb-10">
               <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">Document Generator</h1>
                  <p className="text-gray-500">Fill in the details below to instantly create HR documents.</p>
               </div>
               <GeneratorModule />
            </div>
          )}

          {view === 'templates' && (
             <div className="max-w-3xl mx-auto pb-10">
                <div className="mb-6 text-center">
                   <h1 className="text-2xl font-bold text-gray-900">Template Management</h1>
                   <p className="text-gray-500">Ensure your documents use the latest authorized formats.</p>
                </div>
                <TemplateModule />
             </div>
          )}
        </div>
      </main>
    </div>
  );
}