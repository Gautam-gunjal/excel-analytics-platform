import React, { useEffect, useState } from 'react';
import { getAllUploads, deleteUser, deleteUpload } from '../api/api';
import '../Stylesheets/admindashboard.css'; // ⬅️ changed from styles.css

export default function AdminDashboard() {
  const [uploads, setUploads] = useState([]);
  const [stats, setStats] = useState({ totalUploads: 0, totalUsers: 0, userUsage: [] });

  useEffect(() => {
    async function load() {
      try {
        const res = await getAllUploads();
        setUploads(res.uploads);

        // build stats
        const usageMap = {};
        res.uploads.forEach(u => {
          const userId = u.user?._id;
          if (!userId) return;
          if (!usageMap[userId]) {
            usageMap[userId] = { _id: userId, name: u.user.name, email: u.user.email, count: 0 };
          }
          usageMap[userId].count += 1;
        });

        setStats({
          totalUploads: res.uploads.length,
          totalUsers: Object.keys(usageMap).length,
          userUsage: Object.values(usageMap),
        });
      } catch (err) {
        console.error("Error loading uploads:", err);
      }
    }
    load();
  }, []);

  function recomputeStats(uploadArr) {
    const usageMap = {};
    uploadArr.forEach(u => {
      const userId = u.user?._id;
      if (!userId) return;
      if (!usageMap[userId]) {
        usageMap[userId] = { _id: userId, name: u.user.name, email: u.user.email, count: 0 };
      }
      usageMap[userId].count += 1;
    });

    setStats({
      totalUploads: uploadArr.length,
      totalUsers: Object.keys(usageMap).length,
      userUsage: Object.values(usageMap),
    });
  }

  async function handleDeleteUser(id) {
    if (!window.confirm("Delete this user and all their uploads?")) return;

    try {
      await deleteUser(id);
      const filtered = uploads.filter(u => u.user?._id !== id);
      setUploads(filtered);
      recomputeStats(filtered);
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    }
  }

  async function handleDeleteUpload(id) {
    if (!window.confirm("Delete this upload?")) return;

    try {
      await deleteUpload(id);
      const filtered = uploads.filter(u => u._id !== id);
      setUploads(filtered);
      recomputeStats(filtered);
    } catch (err) {
      console.error(err);
      alert("Failed to delete upload");
    }
  }

  return (
    <div className="admin">
      <h2>Admin Dashboard</h2>

      {/* Summary */}
      <div className="admin-summary">
        <p><strong>Total Uploads:</strong> {stats.totalUploads}</p>
        <p><strong>Total Users:</strong> {stats.totalUsers}</p>
      </div>

      {/* User usage */}
      <h3>User Data Usage</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Files Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stats.userUsage.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.count}</td>
              <td>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => handleDeleteUser(u._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* All uploads */}
      <h3>All Uploads</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>File</th>
            <th>Uploaded</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {uploads.map(u => (
            <tr key={u._id}>
              <td>{u.user?.name} ({u.user?.email})</td>
              <td>{u.originalName}</td>
              <td>{new Date(u.createdAt).toLocaleString()}</td>
              <td>
                <button
                  className="admin-action-btn admin-action-btn--danger"
                  onClick={() => handleDeleteUpload(u._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
