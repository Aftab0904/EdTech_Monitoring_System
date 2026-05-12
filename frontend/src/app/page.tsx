"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, Legend, PieChart, Pie
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const Dashboard = () => {
  // Prediction State
  const [behavior, setBehavior] = useState({
    traffic_source: "Google Ads",
    time_on_platform: 25.0,
    courses_viewed: 3,
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);

  // Leakage State
  const [leakageData, setLeakageData] = useState<any[]>([]);
  const [loadingLeakage, setLoadingLeakage] = useState(false);

  const trafficSources = ['Google Ads', 'Direct', 'Organic Search', 'Referral', 'Social Media', 'Email Campaign'];

  const fetchLeakage = async () => {
    setLoadingLeakage(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/revenue-leakage`);
      setLeakageData(response.data);
    } catch (error) {
      console.error("Error fetching leakage data:", error);
    } finally {
      setLoadingLeakage(false);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPredict(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, behavior);
      setPrediction(response.data);
    } catch (error) {
      console.error("Error predicting:", error);
    } finally {
      setLoadingPredict(false);
    }
  };

  const [aiSummary, setAiSummary] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const generateAiSummary = async () => {
    if (leakageData.length === 0) return;
    setLoadingAi(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze-leakage`, { data: leakageData });
      setAiSummary(response.data.summary);
    } catch (error) {
      console.error("Error generating AI summary:", error);
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchLeakage();
  }, []);

  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Growth Intelligence Dashboard</h1>
        <p className="text-slate-500 mt-1">Monitor real-time predictions and revenue leakage metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prediction Form Section */}
        <section className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center space-x-2 mb-6">
            <Activity className="text-blue-600" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Real-Time Prediction</h2>
          </div>
          <form onSubmit={handlePredict} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Traffic Source</label>
              <select 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                value={behavior.traffic_source}
                onChange={(e) => setBehavior({...behavior, traffic_source: e.target.value})}
              >
                {trafficSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Time on Platform (mins)</label>
              <input 
                type="range" min="0" max="200" step="1"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={behavior.time_on_platform}
                onChange={(e) => setBehavior({...behavior, time_on_platform: parseFloat(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>0</span>
                <span className="text-blue-600 font-bold">{behavior.time_on_platform}m</span>
                <span>200</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Courses Viewed</label>
              <input 
                type="range" min="0" max="10" step="1"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                value={behavior.courses_viewed}
                onChange={(e) => setBehavior({...behavior, courses_viewed: parseInt(e.target.value)})}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>0</span>
                <span className="text-blue-600 font-bold">{behavior.courses_viewed}</span>
                <span>10</span>
              </div>
            </div>
            <button 
              type="submit"
              disabled={loadingPredict}
              className="w-full bg-slate-900 text-white py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loadingPredict ? "Analyzing..." : "Calculate Probabilities"}
            </button>
          </form>

          {prediction && (
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Enrollment</p>
                  <p className="text-2xl font-black text-blue-700 font-mono">{(prediction.enrollment_probability * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Churn Risk</p>
                  <p className="text-2xl font-black text-red-700 font-mono">{(prediction.churn_probability * 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`p-2 rounded-lg ${prediction.recommendation === "High Priority" ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-600"}`}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strategy Recommendation</p>
                  <p className="text-sm font-bold text-slate-800">{prediction.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Visualizations Section */}
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-blue-600" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Revenue Leakage by Source</h2>
              </div>
              <button 
                onClick={fetchLeakage}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
              >
                Refresh Data
              </button>
            </div>
            <div className="h-[300px] w-full">
              {loadingLeakage ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-slate-400 animate-pulse">Loading visualization...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leakageData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="traffic_source" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 500}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#475569', fontSize: 10, fontWeight: 500}}
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Bar dataKey="leakage_count" radius={[4, 4, 0, 0]}>
                      {leakageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="text-amber-500" size={20} />
                  <h3 className="text-sm font-bold text-slate-800">Leakage Distribution</h3>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leakageData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="leakage_count"
                      >
                        {leakageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-widest text-slate-400">AI Business Insights</h3>
                <div className="space-y-4">
                  {!aiSummary ? (
                    <button 
                      onClick={generateAiSummary}
                      disabled={loadingAi || leakageData.length === 0}
                      className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl border border-blue-100 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      {loadingAi ? "Analyzing Data..." : "Generate AI Analyst Summary"}
                    </button>
                  ) : (
                    <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-line animate-in fade-in duration-700">
                      {aiSummary}
                      <button 
                        onClick={() => setAiSummary("")}
                        className="block mt-4 text-blue-600 font-bold hover:underline"
                      >
                        Clear Summary
                      </button>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
