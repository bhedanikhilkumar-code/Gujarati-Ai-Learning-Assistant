import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-4xl font-bold">Student Notes Sharing Platform</h1>
      <p className="mb-6 text-slate-700">Upload, discover, and download semester-wise notes with admin moderation for quality and safety.</p>
      <div className="flex gap-3">
        <Link to="/notes" className="rounded bg-blue-600 px-4 py-2 font-medium text-white">Browse Notes</Link>
        <Link to="/upload" className="rounded border border-slate-400 px-4 py-2 font-medium">Upload Notes</Link>
      </div>
    </div>
  );
};

export default HomePage;
