"use client";

const ExplanationPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Project Explanation
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          EdUplift AI is an end-to-end growth intelligence system designed to optimize revenue and engagement for EdTech platforms.
        </p>
      </header>

      <section className="space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">Core Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Backend (FastAPI)</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                <li>Predictive endpoint serving ML models via Joblib.</li>
                <li>Revenue leakage analysis module using Pandas.</li>
                <li>SQL query engine powered by DuckDB for direct data interaction.</li>
                <li>CORS-enabled for secure cross-origin frontend communication.</li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Frontend (Next.js)</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                <li>React-based Single Page Application with App Router.</li>
                <li>Tailwind CSS for professional, utility-first styling.</li>
                <li>Recharts for dynamic data visualization.</li>
                <li>Axios for efficient API interaction.</li>
              </ul>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">Machine Learning Models</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Lead Scoring Model</h3>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">XGBoost</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Predicts the probability of a user enrolling based on their behavior on the platform.
              </p>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {['Time on Platform', 'Courses Viewed', 'Traffic Source'].map((feat) => (
                  <span key={feat} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                    {feat}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Churn Prediction Model</h3>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">Random Forest</span>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Identifies users at high risk of dropping out by analyzing engagement patterns.
              </p>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Key Features</h4>
              <div className="flex flex-wrap gap-2">
                {['Wasted Time', 'Engagement Depth', 'Acquisition Channel'].map((feat) => (
                  <span key={feat} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded border border-slate-200">
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-900 border-b pb-2 mb-4">Data Processing Functions</h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Function</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">generate_edtech_data</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Creates synthetic datasets using Faker and NumPy gamma distributions.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">identify_revenue_leakage</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Flags segments with high engagement but zero revenue generation.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">execute_sql_query</td>
                  <td className="px-6 py-4 text-sm text-slate-600">Executes arbitrary SQL against CSV data using the DuckDB engine.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ExplanationPage;
