import { useEffect, useState } from 'react';
import { request } from '../api/client';
import { Category, Note, Subject, User } from '../types';

const AdminDashboardPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const loadData = async () => {
    const [pendingNotes, userList, categoryList, subjectList] = await Promise.all([
      request<Note[]>('/notes?status=pending'),
      request<User[]>('/users'),
      request<Category[]>('/categories'),
      request<Subject[]>('/subjects')
    ]);

    setNotes(pendingNotes);
    setUsers(userList);
    setCategories(categoryList);
    setSubjects(subjectList);
  };

  useEffect(() => {
    loadData();
  }, []);

  const reviewNote = async (id: string, status: 'approved' | 'rejected') => {
    await request(`/notes/${id}/review`, { method: 'PATCH', body: JSON.stringify({ status }) });
    loadData();
  };

  const removeNote = async (id: string) => {
    await request(`/notes/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <section className="rounded bg-white p-5 shadow">
        <h2 className="mb-3 text-xl font-bold">Pending Notes Approval</h2>
        {notes.map((note) => (
          <div key={note._id} className="mb-2 flex items-center justify-between border-b pb-2">
            <span>{note.title}</span>
            <div className="flex gap-2">
              <button className="rounded bg-green-600 px-3 py-1 text-white" onClick={() => reviewNote(note._id, 'approved')}>Approve</button>
              <button className="rounded bg-yellow-600 px-3 py-1 text-white" onClick={() => reviewNote(note._id, 'rejected')}>Reject</button>
              <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={() => removeNote(note._id)}>Delete</button>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded bg-white p-5 shadow">
        <h2 className="mb-2 text-xl font-bold">Manage Users</h2>
        <ul className="space-y-1 text-sm">
          {users.map((user) => (
            <li key={user.id}>{user.name} ({user.email}) - {user.role}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded bg-white p-5 shadow">
          <h2 className="mb-2 text-xl font-bold">Categories</h2>
          <ul>{categories.map((category) => <li key={category._id}>{category.name}</li>)}</ul>
        </div>
        <div className="rounded bg-white p-5 shadow">
          <h2 className="mb-2 text-xl font-bold">Subjects</h2>
          <ul>{subjects.map((subject) => <li key={subject._id}>{subject.name}</li>)}</ul>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
