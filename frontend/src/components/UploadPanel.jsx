import React, { useState } from 'react';
import { uploadFile } from '../api/api';
import "../Stylesheets/Dashboard.css";

export default function UploadPanel({ onUploaded }){
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if(!file) return alert('Select file');
    const fd = new FormData();
    fd.append('file', file);
    try {
      setLoading(true);
      const res = await uploadFile(fd);
      // server returns upload object
      onUploaded && onUploaded(res.upload);
      alert('Uploaded successfully');
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="upload-panel">
      <form onSubmit={submit}>
        <input type="file" accept=".xls,.xlsx" onChange={e=>setFile(e.target.files[0])} />
        <button type="submit" disabled={loading}>{loading ? 'Uploading...' : 'Upload Excel'}</button>
      </form>
    </div>
  );
}
