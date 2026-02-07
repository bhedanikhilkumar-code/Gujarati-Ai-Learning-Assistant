import { FormEvent, useEffect, useState } from 'react';
import { request } from '../api/client';
import { Category, Subject } from '../types';

const UploadNotePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [semester, setSemester] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [pdf, setPdf] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    Promise.all([request<Category[]>('/categories'), request<Subject[]>('/subjects')]).then(([cats, subs]) => {
      setCategories(cats);
      setSubjects(subs);
    });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!pdf) {
      setError('Please choose a PDF file');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('semester', semester);
    formData.append('category', category);
    formData.append('subject', subject);
    formData.append('pdf', pdf);

    try {
      const data = await request<{ message: string }>('/notes', { method: 'POST', body: formData });
      setMessage(data.message);
      setTitle('');
      setDescription('');
      setSemester('');
      setCategory('');
      setSubject('');
      setPdf(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold">Upload Notes (PDF only)</h2>
      <form onSubmit={onSubmit} className="space-y-3 rounded bg-white p-6 shadow">
        {error && <p className="text-red-700">{error}</p>}
        {message && <p className="text-green-700">{message}</p>}
        <input className="w-full rounded border p-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea className="w-full rounded border p-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input className="w-full rounded border p-2" placeholder="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} required />
        <select className="w-full rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value)} required>
          <option value="">Select Category</option>
          {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <select className="w-full rounded border p-2" value={subject} onChange={(e) => setSubject(e.target.value)} required>
          <option value="">Select Subject</option>
          {subjects.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <input className="w-full rounded border p-2" type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] || null)} required />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white">Submit for Approval</button>
      </form>
    </div>
  );
};

export default UploadNotePage;
