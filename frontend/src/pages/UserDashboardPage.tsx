import { useEffect, useState } from 'react';
import { request } from '../api/client';
import { Note } from '../types';

const UserDashboardPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    request<Note[]>('/notes/my-uploads').then(setNotes);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="mb-4 text-2xl font-bold">My Uploaded Notes</h2>
      <div className="space-y-3">
        {notes.map((note) => (
          <div key={note._id} className="rounded bg-white p-4 shadow">
            <p className="font-semibold">{note.title}</p>
            <p className="text-sm">Status: <span className="font-medium">{note.status}</span></p>
            {note.status === 'rejected' && note.rejectionReason && <p className="text-sm text-red-600">Reason: {note.rejectionReason}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserDashboardPage;
