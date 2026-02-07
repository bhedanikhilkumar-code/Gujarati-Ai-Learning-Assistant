import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API_BASE_URL, { request } from '../api/client';
import { Note } from '../types';

const NoteDetailsPage = () => {
  const [note, setNote] = useState<Note | null>(null);
  const [error, setError] = useState('');
  const { id } = useParams();

  useEffect(() => {
    request<Note>(`/notes/${id}`)
      .then(setNote)
      .catch((err) => setError((err as Error).message));
  }, [id]);

  if (error) return <div className="p-6 text-red-700">{error}</div>;
  if (!note) return <div className="p-6">Loading note...</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded bg-white p-6 shadow">
        <h2 className="text-2xl font-bold">{note.title}</h2>
        <p className="my-3 text-slate-700">{note.description}</p>
        <p className="text-sm">Category: {note.category?.name}</p>
        <p className="text-sm">Subject: {note.subject?.name}</p>
        <p className="text-sm">Semester: {note.semester}</p>
        <a href={`${API_BASE_URL}/notes/${note._id}/download`} className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white">Download PDF</a>
      </div>
    </div>
  );
};

export default NoteDetailsPage;
