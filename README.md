# Student Notes Sharing Platform (MERN)

A complete **MERN stack** project with two roles:
- **Student/User**
- **Admin**

---

## 1) Project overview

Student Notes Sharing Platform allows students to upload and discover semester-wise academic notes in PDF format. Uploaded notes are moderated by admins before becoming publicly available.

### Key features
- JWT Authentication (Register/Login/Profile)
- Role-based authorization (user/admin)
- PDF-only upload with size limit via Multer
- Filter notes by category, subject, and semester
- Admin moderation (approve/reject notes)
- Admin management for categories, subjects, users, and notes

---

## 2) Folder structure (frontend + backend)

```txt
student-notes-sharing-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── categoryController.js
│   │   │   ├── noteController.js
│   │   │   ├── subjectController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   ├── models/
│   │   │   ├── Category.js
│   │   │   ├── Note.js
│   │   │   ├── Subject.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── noteRoutes.js
│   │   │   ├── subjectRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── uploads/
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   └── generateToken.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/client.ts
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NoteDetailsPage.tsx
│   │   │   ├── NotesPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── UploadNotePage.tsx
│   │   │   └── UserDashboardPage.tsx
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite config files
└── README.md
```

---

## 3) Database schema

### User
- `name: String`
- `email: String (unique)`
- `password: String (hashed)`
- `role: enum('user','admin')`

### Category
- `name: String (unique)`
- `description: String`

### Subject
- `name: String`
- `category: ObjectId -> Category`

### Note
- `title: String`
- `description: String`
- `semester: Number`
- `fileName: String`
- `filePath: String`
- `status: enum('pending','approved','rejected')`
- `rejectionReason: String`
- `category: ObjectId -> Category`
- `subject: ObjectId -> Subject`
- `uploader: ObjectId -> User`
- `timestamps`

---

## 4) Backend code (step-by-step)

1. Initialize Express server and MongoDB connection.
2. Add models for User, Category, Subject, and Note.
3. Add JWT auth and role authorization middleware.
4. Add Multer middleware for strict PDF upload and file-size limit.
5. Implement controllers for:
   - Auth
   - Categories
   - Subjects
   - Notes (upload, list, review, download, delete)
   - Users (admin management)
6. Register all routes under `/api/*`.
7. Add centralized not-found + error handlers.

---

## 5) Frontend code (page-wise)

### Implemented pages
- **Home page**: Platform intro and CTA buttons.
- **Login page**: JWT login form.
- **Register page**: New user signup.
- **Notes listing page**: Filter by category, subject, semester.
- **Note details page**: Details + download link.
- **Upload notes page**: PDF upload form (admin approval flow).
- **User dashboard**: View own uploaded notes and status.
- **Admin dashboard**: Moderate pending notes, inspect users/categories/subjects.

### Frontend architecture
- `AuthContext` manages login/register/logout/profile bootstrap.
- `ProtectedRoute` secures routes and supports role checks.
- `api/client.ts` centralizes fetch calls with bearer token handling.

---

## 6) API documentation

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (protected)

### Categories
- `GET /api/categories`
- `POST /api/categories` (admin)
- `PUT /api/categories/:id` (admin)
- `DELETE /api/categories/:id` (admin)

### Subjects
- `GET /api/subjects?category=<categoryId>`
- `POST /api/subjects` (admin)
- `PUT /api/subjects/:id` (admin)
- `DELETE /api/subjects/:id` (admin)

### Notes
- `POST /api/notes` (protected, multipart, field: `pdf`)
- `GET /api/notes?category=&subject=&semester=&status=` (protected)
- `GET /api/notes/my-uploads` (protected)
- `GET /api/notes/:id` (protected)
- `PATCH /api/notes/:id/review` (admin)
- `GET /api/notes/:id/download` (protected)
- `DELETE /api/notes/:id` (admin/uploader)

### Users (admin)
- `GET /api/users`
- `PATCH /api/users/:id/role`
- `DELETE /api/users/:id`

---

## 7) How to run project locally

### Prerequisites
- Node.js 18+
- MongoDB running locally (or Atlas URI)

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Default:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 8) Future scope

- Search + pagination for notes
- Email notifications on approval/rejection
- Rich admin analytics dashboard
- Tags and bookmarking/favorites
- Rate/review notes
- Cloud storage integration (S3/Cloudinary)
- Audit logs and activity timeline

---

## Submission Notes
- Clean architecture with clear separation of concerns.
- PDF upload validation + file size control implemented.
- Role-protected routes on frontend and backend.
- Production-oriented error handling and middleware setup.
