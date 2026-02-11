'use client';

import { FormEvent, useMemo, useState } from 'react';

type Status = 'idle' | 'uploading' | 'processing' | 'downloading' | 'success' | 'error';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

function statusLabel(status: Status): string {
  switch (status) {
    case 'uploading':
      return 'Uploading PDF...';
    case 'processing':
      return 'PDF uploaded. Generating notes and export...';
    case 'downloading':
      return 'Downloading export.zip...';
    case 'success':
      return 'Done! export.zip downloaded.';
    case 'error':
      return 'Something went wrong.';
    default:
      return 'Select a PDF file and start upload.';
  }
}

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string>('');
  const [jobId, setJobId] = useState<string>('');

  const canSubmit = useMemo(() => status !== 'uploading' && status !== 'processing' && status !== 'downloading', [status]);

  const handleUploadAndDownload = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!file) {
      setStatus('error');
      setError('Please select a PDF file first.');
      return;
    }

    try {
      setStatus('uploading');

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const payload = await uploadResponse.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(payload.detail || 'Upload failed');
      }

      const uploadPayload: { job_id: string } = await uploadResponse.json();
      const uploadedJobId = uploadPayload.job_id;
      setJobId(uploadedJobId);

      setStatus('processing');

      const exportResponse = await fetch(`${API_BASE}/export/${uploadedJobId}`);

      if (!exportResponse.ok) {
        const payload = await exportResponse.json().catch(() => ({ detail: 'Export failed' }));
        throw new Error(payload.detail || 'Export failed');
      }

      setStatus('downloading');

      const blob = await exportResponse.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'export.zip';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unexpected error occurred');
    }
  };

  return (
    <main className="container">
      <section className="card">
        <h1>PDF Upload & Export</h1>
        <p className="subtitle">Upload a PDF, wait for processing, and download the generated export.zip.</p>

        <form onSubmit={handleUploadAndDownload}>
          <label htmlFor="pdf">PDF file</label>
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            disabled={!canSubmit}
          />

          <button type="submit" disabled={!file || !canSubmit}>
            {status === 'uploading' || status === 'processing' || status === 'downloading'
              ? 'Please wait...'
              : 'Upload and Download Export'}
          </button>
        </form>

        <div className={`status status-${status}`}>
          <strong>Status:</strong> {statusLabel(status)}
        </div>

        {jobId && (
          <p className="job">Job ID: <code>{jobId}</code></p>
        )}

        {error && (
          <div className="error">
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>
    </main>
  );
}
