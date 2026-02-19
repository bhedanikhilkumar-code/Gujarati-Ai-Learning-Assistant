const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const asyncHandler = require('../utils/asyncHandler');

const uploadNote = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'PDF file is required' });
  }

  const { title, description, semester, category, subject } = req.body;

  const note = await Note.create({
    title,
    description,
    semester,
    category,
    subject,
    fileName: req.file.originalname,
    filePath: req.file.filename,
    uploader: req.user._id,
    status: 'pending'
  });

  res.status(201).json({ message: 'Note uploaded and submitted for approval', note });
});

const getNotes = asyncHandler(async (req, res) => {
  const { category, subject, semester, status } = req.query;
  const filters = {};

  if (category) filters.category = category;
  if (subject) filters.subject = subject;
  if (semester) filters.semester = Number(semester);

  if (req.user?.role === 'admin') {
    if (status) filters.status = status;
  } else {
    filters.status = 'approved';
  }

  const notes = await Note.find(filters)
    .populate('category', 'name')
    .populate('subject', 'name')
    .populate('uploader', 'name email')
    .sort({ createdAt: -1 });

  res.json(notes);
});

const getMyUploads = asyncHandler(async (req, res) => {
  const notes = await Note.find({ uploader: req.user._id })
    .populate('category', 'name')
    .populate('subject', 'name')
    .sort({ createdAt: -1 });

  res.json(notes);
});

const getNoteById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate('category', 'name')
    .populate('subject', 'name')
    .populate('uploader', 'name email');

  if (!note) return res.status(404).json({ message: 'Note not found' });

  if (req.user.role !== 'admin' && note.status !== 'approved' && String(note.uploader._id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(note);
});

const reviewNote = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Status must be approved or rejected' });
  }

  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  note.status = status;
  note.rejectionReason = status === 'rejected' ? rejectionReason || 'Not specified' : '';
  await note.save();

  res.json({ message: `Note ${status} successfully`, note });
});

const downloadNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  const canAccess = req.user.role === 'admin' || note.status === 'approved' || String(note.uploader) === String(req.user._id);
  if (!canAccess) return res.status(403).json({ message: 'Access denied' });

  const absoluteFilePath = path.join(__dirname, '..', 'uploads', note.filePath);
  if (!fs.existsSync(absoluteFilePath)) {
    return res.status(404).json({ message: 'PDF file missing on server' });
  }

  res.download(absoluteFilePath, note.fileName);
});

const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  const canDelete = req.user.role === 'admin' || String(note.uploader) === String(req.user._id);
  if (!canDelete) return res.status(403).json({ message: 'Access denied' });

  const absoluteFilePath = path.join(__dirname, '..', 'uploads', note.filePath);
  if (fs.existsSync(absoluteFilePath)) fs.unlinkSync(absoluteFilePath);

  await note.deleteOne();
  res.json({ message: 'Note deleted successfully' });
});

module.exports = {
  uploadNote,
  getNotes,
  getMyUploads,
  getNoteById,
  reviewNote,
  downloadNote,
  deleteNote
};
