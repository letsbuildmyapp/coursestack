import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Tour } from '@/components/tour/Tour';

import { Landing } from '@/pages/marketing/Landing';
import { Instructors } from '@/pages/marketing/Instructors';
import { Login } from '@/pages/auth/Login';
import { Signup } from '@/pages/auth/Signup';
import { Forgot } from '@/pages/auth/Forgot';
import { MemberDashboard } from '@/pages/member/Dashboard';
import { Catalog } from '@/pages/member/Catalog';
import { CourseDetail } from '@/pages/member/CourseDetail';
import { LessonPlayer } from '@/pages/lesson/LessonPlayer';
import { InstructorHome } from '@/pages/instructor/InstructorHome';
import { CourseEditor } from '@/pages/instructor/CourseEditor';
import { NewCourse } from '@/pages/instructor/NewCourse';
import { AdminUsers } from '@/pages/admin/Users';
import { AdminCourses } from '@/pages/admin/Courses';
import { AdminRevenue } from '@/pages/admin/Revenue';
import { Account } from '@/pages/member/Account';
import { Library } from '@/pages/member/Library';
import { NotFound } from '@/pages/NotFound';
import { ServerError } from '@/pages/ServerError';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } } });

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />

            {/* Public catalog */}
            <Route path="/catalog" element={<ProtectedRoute><Catalog /></ProtectedRoute>} />
            <Route path="/courses/:slug" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />

            {/* Member */}
            <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/account/billing" element={<ProtectedRoute><Account section="billing" /></ProtectedRoute>} />

            {/* Lesson player */}
            <Route path="/learn/:slug/:lessonId" element={<ProtectedRoute><LessonPlayer /></ProtectedRoute>} />

            {/* Instructor */}
            <Route path="/instructor" element={<ProtectedRoute requireRole="instructor"><InstructorHome /></ProtectedRoute>} />
            <Route path="/instructor/new" element={<ProtectedRoute requireRole="instructor"><NewCourse /></ProtectedRoute>} />
            <Route path="/instructor/:courseId" element={<ProtectedRoute requireRole="instructor"><CourseEditor /></ProtectedRoute>} />

            {/* Admin */}
            <Route path="/admin/users" element={<ProtectedRoute requireRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute requireRole="admin"><AdminCourses /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute requireRole="admin"><AdminRevenue /></ProtectedRoute>} />

            <Route path="/500" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Tour />
          <Toaster richColors closeButton position="bottom-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
