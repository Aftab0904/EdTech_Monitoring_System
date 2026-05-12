"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, LineChart, Line, Histogram, Legend
} from "recharts";
import { Database, Search, Terminal, Table as TableIcon, BarChart2, Sparkles } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

const QueryDashboard = () => {
  const [dataset, setDataset] = useState<any[]>([]);
  const [query, setQuery] = useState("SELECT * FROM edtech_users LIMIT 10");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // AI State
  const [aiQuestion, setAiQuestion] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const suggestedQueries = [
    { label: "Signups by Traffic Source", sql: "SELECT traffic_source, COUNT(*) as count FROM edtech_users GROUP BY traffic_source" },
    { label: "Average Revenue per Source", sql: "SELECT traffic_source, ROUND(AVG(revenue_generated), 2) as avg_revenue FROM edtech_users GROUP BY traffic_source" },
    { label: "Enrollment Rate (%)", sql: "SELECT traffic_source, ROUND(SUM(is_enrolled) * 100.0 / COUNT(*), 2) as enrollment_rate FROM edtech_users GROUP BY traffic_source" },
    { label: "Top 10 High Engagement Users", sql: "SELECT user_id, time_on_platform, courses_viewed FROM edtech_users ORDER BY time_on_platform DESC LIMIT 10" },
  ];

  const fetchDataset = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dataset`);
      setDataset(response.data);
    } catch (err) {
      console.error("Error fetching dataset:", err);
    }
  };

  const executeQuery = async (sqlOverride?: string) => {
    const sqlToRun = sqlOverride || query;
    if (sqlOverride) setQuery(sqlOverride);
    
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/query`, { query: sqlToRun });
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to execute query");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const askAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion) return;
    setLoadingAi(true);
    setError("");
    try {
      const response = await axios.post(`${API_BASE_URL}/ask-sql`, { question: aiQuestion });
      setResults(response.data);
      // We don't necessarily know the SQL generated without returning it from backend, 
      // but the results will be displayed.
    } catch (err: any) {
      setError(err.response?.data?.detail || "AI failed to generate query");
    } finally {
      setLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchDataset();
    executeQuery();
  }, []);

  // Determine chart type based on results
  const renderVisualization = () => {
    if (results.length === 0) return null;
    
    const keys = Object.keys(results[0]);
    const numericKeys = keys.filter(k => typeof results[0][k] === 'number');
    const stringKeys = keys.filter(k => typeof results[0][k] === 'string');

    if (numericKeys.length > 0 && stringKeys.length > 0) {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={results}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey={stringKeys[0]} axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569', fontWeight: 600}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#475569', fontWeight: 600}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Bar dataKey={numericKeys[0]} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    return <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">No suitable data for automatic visualization.</div>;
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SQL Query Dashboard</h1>
        <p className="text-slate-500 mt-1">Directly interact with the EdTech dataset using standard SQL or Natural Language.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Sidebar: Dataset Preview & Suggestions */}
        <aside className="xl:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 mb-4">
              <TableIcon className="text-blue-600" size={18} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dataset Preview (Top 50)</h2>
            </div>
            <div className="overflow-x-auto max-h-[300px] border rounded-lg">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-600 uppercase">Source</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-600 uppercase">Time</th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold text-slate-600 uppercase">Rev</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {dataset.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-[10px] text-slate-700 font-medium">{row.traffic_source}</td>
                      <td className="px-3 py-2 text-[10px] font-mono text-slate-600">{row.time_on_platform}</td>
                      <td className="px-3 py-2 text-[10px] font-mono text-slate-900 font-bold">${row.revenue_generated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center space-x-2 mb-4">
              <Search className="text-blue-600" size={18} />
              <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Suggested Queries</h2>
            </div>
            <div className="space-y-2">
              {suggestedQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => executeQuery(q.sql)}
                  className="w-full text-left p-3 text-xs bg-slate-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg border border-slate-100 transition-all font-semibold text-slate-700"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main: Query Editor & Results */}
        <section className="xl:col-span-2 space-y-6">
          {/* AI Query Input */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-white" size={20} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Ask AI anything about the data</h2>
            </div>
            <form onSubmit={askAi} className="flex gap-2">
              <input 
                type="text"
                placeholder="e.g., 'What is the average revenue for Google Ads users?'"
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white/30"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
              />
              <button 
                type="submit"
                disabled={loadingAi}
                className="bg-white text-blue-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                {loadingAi ? "Thinking..." : "Ask"}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Terminal className="text-green-400" size={18} />
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">SQL Terminal</span>
              </div>
              <button 
                onClick={() => executeQuery()}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50 border border-slate-700"
              >
                {loading ? "Running..." : "Run Custom SQL"}
              </button>
            </div>
            <textarea
              className="w-full h-24 p-6 bg-slate-900 text-blue-100 font-mono text-sm focus:outline-none resize-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-700">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart2 className="text-blue-600" size={18} />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Visualization</h2>
                </div>
                <div className="h-[250px]">
                  {renderVisualization()}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-2 mb-4">
                  <TableIcon className="text-blue-600" size={18} />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Result Set</h2>
                </div>
                <div className="overflow-auto max-h-[250px] border rounded-lg">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {Object.keys(results[0]).map(k => (
                          <th key={k} className="px-3 py-2 text-left text-[10px] font-bold text-slate-600 uppercase">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {results.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          {Object.values(row).map((v: any, j) => (
                            <td key={j} className="px-3 py-2 text-[10px] text-slate-700 font-mono font-medium">{String(v)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QueryDashboard;
