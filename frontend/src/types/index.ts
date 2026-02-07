export type Role = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
}

export interface Subject {
  _id: string;
  name: string;
  category: Category;
}

export interface Note {
  _id: string;
  title: string;
  description: string;
  semester: number;
  fileName: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  category: Category;
  subject: Subject;
  uploader: User;
  createdAt: string;
}
