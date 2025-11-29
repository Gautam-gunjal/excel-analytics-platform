import React, { useEffect, useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import ChartBuilder from '../components/ChartBuilder';
import { getHistory } from '../api/api';
import "../Stylesheets/Dashboard.css"; 

export default function Dashboard({ user }) {
  const [history, setHistory] = useState([]);
  const [currentData, setCurrentData] = useState(null);

  const loadHistory = async () => {
    try {
      const res = await getHistory();
      setHistory(res.uploads || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  useEffect(() => {
    if (user) loadHistory();
  }, [user]);

  return (
    <div className="dashboard-page">
       <h1 className="dashboard-title">Dashboard</h1>   
      <div className="dashboard">

        <div className="left">
          <UploadPanel onUploaded={loadHistory} />
          <h3>Upload History</h3>

          <ul className="history-list">
            {history.map(h => (
              <li key={h._id}>
                <button onClick={() => setCurrentData(h.dataJson)}>
                  {h.originalName} — {new Date(h.createdAt).toLocaleString()}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="right">
          <h2>Chart Builder</h2>
          <ChartBuilder data={currentData} />
        </div>

      </div>
    </div>
  );
}
