const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');

const createSubject = asyncHandler(async (req, res) => {
  const { name, category } = req.body;
  const subject = await Subject.create({ name, category });
  res.status(201).json(subject);
});

const getSubjects = asyncHandler(async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  const subjects = await Subject.find(filter).populate('category', 'name').sort({ name: 1 });
  res.json(subjects);
});

const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json(subject);
});

const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted successfully' });
});

module.exports = { createSubject, getSubjects, updateSubject, deleteSubject };
