import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { request } from '../api/client';
import { Category, Note, Subject } from '../types';

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filters, setFilters] = useState({ category: '', subject: '', semester: '' });

  const loadOptions = async () => {
    const [cats, subs] = await Promise.all([request<Category[]>('/categories'), request<Subject[]>('/subjects')]);
    setCategories(cats);
    setSubjects(subs);
  };

  const loadNotes = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => value && params.append(key, value));
    const data = await request<Note[]>(`/notes?${params.toString()}`);
    setNotes(data);
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    loadNotes();
  }, [filters]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold">Notes Listing</h2>
      <div className="mb-5 grid gap-3 rounded bg-white p-4 shadow md:grid-cols-3">
        <select className="rounded border p-2" value={filters.category} onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}>
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
        </select>
        <select className="rounded border p-2" value={filters.subject} onChange={(e) => setFilters((prev) => ({ ...prev, subject: e.target.value }))}>
          <option value="">All Subjects</option>
          {subjects.map((sub) => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
        </select>
        <input className="rounded border p-2" placeholder="Semester (e.g. 3)" value={filters.semester} onChange={(e) => setFilters((prev) => ({ ...prev, semester: e.target.value }))} />
      </div>

      <div className="grid gap-3">
        {notes.map((note) => (
          <div key={note._id} className="rounded bg-white p-4 shadow">
            <h3 className="font-semibold">{note.title}</h3>
            <p className="text-sm text-slate-700">{note.subject?.name} • Semester {note.semester}</p>
            <Link to={`/notes/${note._id}`} className="mt-2 inline-block text-blue-600">View details</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPage;
