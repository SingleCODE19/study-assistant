
import React, { useState } from 'react';
import { UserPersona } from '../types';
import { generateStudyPlan, solveDoubt, searchResources } from '../services/geminiService';
import { BookOpen, Search, Calendar, MessageSquare, Camera, Sparkles, Send, Loader2, Link as LinkIcon, ExternalLink, GraduationCap, FileText, CheckCircle2, ChevronRight, Info, LayoutDashboard } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [persona, setPersona] = useState<UserPersona>(UserPersona.JEE_NEET);
  const [activeTab, setActiveTab] = useState<'planner' | 'doubts' | 'resources'>('planner');
  const [loading, setLoading] = useState(false);
  
  const [targetExam, setTargetExam] = useState('');
  const [hours, setHours] = useState(10);
  const [plan, setPlan] = useState<any>(null);

  const [query, setQuery] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const [resourceTopic, setResourceTopic] = useState('');
  const [resources, setResources] = useState<any>(null);

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await generateStudyPlan(persona, targetExam, hours);
      setPlan(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSolveDoubt = async () => {
    if (!query && !image) return;
    setLoading(true);
    try {
      const result = await solveDoubt(query, image || undefined);
      setDoubtResponse(result || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResources = async () => {
    if (!resourceTopic) return;
    setLoading(true);
    try {
      const result = await searchResources(resourceTopic);
      setResources(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('###')) {
        return (
          <div key={i} className="mt-8 mb-4 relative inline-block w-full">
            <h3 className="text-2xl font-bold handwritten text-slate-800 flex items-center gap-2 pb-1">
              <span className="text-indigo-500 font-bold">»</span>
              {trimmed.replace('###', '').trim()}
            </h3>
            <div className="h-0.5 w-full bg-slate-100 mt-1" />
          </div>
        );
      }

      if (trimmed.startsWith('#### Final Result')) {
        return (
          <div key={i} className="my-10 p-8 rounded-2xl border-2 border-indigo-400 bg-indigo-50/50 shadow-lg shadow-indigo-100/50 flex flex-col items-center text-center">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-4 bg-white px-4 py-1 rounded-full border border-indigo-100">Final Conclusion</h4>
            <div className="math-scribble text-4xl md:text-5xl text-indigo-800 font-bold leading-tight">
              {trimmed.replace('#### Final Result', '').replace(':', '').trim()}
            </div>
          </div>
        );
      }

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return (
          <div key={i} className="flex gap-3 ml-2 mb-3 items-start">
            <span className="handwritten text-indigo-500 font-bold text-xl">•</span>
            <span className="handwritten text-slate-700 text-lg">{trimmed.replace(/^[*-]/, '').trim()}</span>
          </div>
        );
      }

      const mathOperators = /[=+\-*/^θπΣ∫√∞|λΔ]/.test(trimmed);
      const isEquation = (mathOperators || /^[A-Z] =/.test(trimmed)) && !trimmed.includes('http') && trimmed.length > 1;

      if (isEquation && trimmed.length < 300) {
        return (
          <div key={i} className="my-6 mx-auto w-full max-w-[95%] notebook-paper border border-slate-100 rounded-xl shadow-sm flex justify-center items-center py-6 px-10 overflow-x-auto min-h-[4rem]">
            <div className="math-scribble text-2xl md:text-3xl text-slate-800 tracking-widest whitespace-nowrap text-center font-bold">
              {trimmed}
            </div>
          </div>
        );
      }

      if (trimmed === '') return <div key={i} className="h-2" />;
      
      return <p key={i} className="mb-3 handwritten text-xl text-slate-600 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none tracking-tight">EduVantage</h1>
            <p className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-widest">AI Notebook</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${activeTab === 'planner' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Calendar className="w-5 h-5" /> Study Planner
          </button>
          <button 
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${activeTab === 'doubts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MessageSquare className="w-5 h-5" /> Doubt Solver
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-3 p-3.5 rounded-xl font-bold transition-all ${activeTab === 'resources' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Search className="w-5 h-5" /> Resource Finder
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Learning Path</p>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setPersona(UserPersona.JEE_NEET)}
              className={`flex-1 text-[11px] py-2 rounded-lg font-black transition-all ${persona === UserPersona.JEE_NEET ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              JEE/NEET
            </button>
            <button 
              onClick={() => setPersona(UserPersona.COLLEGE)}
              className={`flex-1 text-[11px] py-2 rounded-lg font-black transition-all ${persona === UserPersona.COLLEGE ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
            >
              COLLEGE
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-12 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'planner' && (
            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Smart Planner</h2>
                <p className="text-slate-500 mt-2 text-lg">Optimized schedule for your academic goals.</p>
              </header>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Topic / Subject</label>
                  <input 
                    type="text" 
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    placeholder="e.g. JEE Mains Physics" 
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest">Hrs/Wk</label>
                  <input 
                    type="number" 
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
                  />
                </div>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={loading || !targetExam}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  GENERATE
                </button>
              </div>

              {plan && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 p-8 text-white">
                    <h3 className="text-2xl font-black">{plan.subject}</h3>
                    <p className="text-indigo-400 font-medium mt-1">AI-Curated Roadmap</p>
                  </div>
                  <div className="p-8 grid gap-5">
                    {plan.topics.map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-indigo-500 transition-all group">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-lg">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-xl tracking-tight">{t.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest bg-white border border-slate-200 mt-2 inline-block ${
                            t.priority === 'High' ? 'text-rose-600' : 'text-slate-500'
                          }`}>
                            {t.priority} Priority
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-800">{t.estimatedHours}<span className="text-sm text-slate-400 ml-1">h</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'doubts' && (
            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Doubt Solver</h2>
                <p className="text-slate-500 mt-2 text-lg">Get clean algebraic proofs scribbled on a notebook.</p>
              </header>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 space-y-6">
                <textarea 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter equation (e.g. solve for x in 2x^2 + 5x - 3 = 0)..."
                  className="w-full min-h-[160px] p-6 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none resize-none transition-all text-lg font-medium"
                />
                <div className="flex flex-wrap items-center justify-between gap-6">
                  <label className="cursor-pointer flex items-center gap-3 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-sm font-black text-slate-700 transition-all border border-slate-200">
                    <Camera className="w-5 h-5" />
                    {image ? 'IMAGE ATTACHED' : 'SCAN PROBLEM'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <button 
                    onClick={handleSolveDoubt}
                    disabled={loading || (!query && !image)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-4 rounded-2xl font-black flex items-center gap-3 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    SOLVE
                  </button>
                </div>
              </div>

              {doubtResponse && (
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in slide-in-from-top-6 duration-700 overflow-hidden">
                  <div className="flex items-center gap-3 mb-10 pb-4 border-b border-slate-50">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-black text-slate-800">Notebook Breakdown</span>
                  </div>
                  <div className="space-y-2">
                    {formatText(doubtResponse)}
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'resources' && (
            <section className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <header>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Resource Finder</h2>
                <p className="text-slate-500 mt-2 text-lg">Discovery of premium open-source study material.</p>
              </header>

              <div className="relative">
                <input 
                  type="text"
                  value={resourceTopic}
                  onChange={(e) => setResourceTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchResources()}
                  placeholder="Topic: e.g. 'Operating Systems' or 'Atomic Physics'..."
                  className="w-full p-6 pl-16 bg-white border-2 border-slate-100 rounded-3xl shadow-xl shadow-slate-100 focus:border-indigo-500 outline-none transition-all text-xl font-medium"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-7 h-7" />
                <button 
                  onClick={handleSearchResources}
                  disabled={loading || !resourceTopic}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black transition-all disabled:opacity-50 shadow-lg shadow-indigo-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SEARCH'}
                </button>
              </div>

              {resources && (
                <div className="space-y-12">
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">Resource Map</h3>
                    </div>
                    <div>
                      {formatText(resources.text)}
                    </div>
                  </div>

                  {resources.sources.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {resources.sources.map((src: any, i: number) => (
                        <a 
                          key={i} 
                          href={src.web?.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group bg-white p-6 rounded-3xl border border-slate-100 hover:border-indigo-500 transition-all flex flex-col justify-between gap-6"
                        >
                          <div className="w-10 h-10 bg-slate-50 group-hover:bg-indigo-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                            <ExternalLink className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 text-lg line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
                              {src.web?.title || 'External Link'}
                            </h5>
                            <p className="text-[10px] text-indigo-500 mt-3 font-black uppercase tracking-widest bg-indigo-50 w-fit px-2 py-1 rounded">
                              {src.web?.uri ? new URL(src.web.uri).hostname : 'WEBSITE'}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
