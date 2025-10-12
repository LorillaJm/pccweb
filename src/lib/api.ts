import axios, { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pccweb.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to include credentials for session-based auth
api.interceptors.request.use(
  (config) => {
    // Include credentials for session-based authentication
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      console.log('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.log('API Network Error:', {
        message: error.message,
        url: error.config?.url
      });
    } else {
      console.log('API Error:', error.message);
    }
    
    // Do not globally redirect on 401 here to avoid navigation loops.
    // Let views handle unauthorized states explicitly.
    return Promise.reject(error);
  }
);

// API response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: any[];
}

// User types
export interface User {
  id: number;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: number;
  userId: number;
  program?: string;
  yearLevel?: number;
  semester?: number;
  enrollmentDate?: string;
  graduationDate?: string;
  gpa?: number;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
}

export interface FacultyProfile {
  id: number;
  userId: number;
  department?: string;
  position?: string;
  hireDate?: string;
  education?: string;
  specialization?: string;
  officeLocation?: string;
  officeHours?: string;
}

export interface LoginResponse {
  user: User;
}

export interface ProfileResponse {
  user: User;
  profile: StudentProfile | FacultyProfile | null;
}

// Authentication API calls
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    role: 'student' | 'faculty' | 'admin' | 'super_admin';
    studentId?: string;
    employeeId?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
  }): Promise<ApiResponse<LoginResponse>> => {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<ProfileResponse>> => {
    const response: AxiosResponse<ApiResponse<ProfileResponse>> = await api.get('/auth/me');
    return response.data;
  },

};

// Announcements API
export interface Announcement {
  id: number;
  title: string;
  content: string;
  category?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'faculty';
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
}

export const announcementsApi = {
  getAnnouncements: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
  }): Promise<ApiResponse<{
    announcements: Announcement[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>> => {
    const response = await api.get('/announcements', { params });
    return response.data;
  },

  createAnnouncement: async (data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    targetAudience?: string;
    isPublished?: boolean;
  }): Promise<ApiResponse<{ announcement: Announcement }>> => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
};

// Subjects API
export interface Subject {
  id: number;
  subjectCode: string;
  subjectName: string;
  description?: string;
  units: number;
  semester?: number;
  yearLevel?: number;
  department?: string;
  prerequisites?: string;
  isActive: boolean;
}

export interface ClassSection {
  sectionId: number;
  sectionName: string;
  schedule?: string;
  room?: string;
  maxStudents: number;
  enrolledStudents: number;
  academicYear: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
  description?: string;
  units: number;
  facultyName?: string;
  isEnrolled?: boolean;
  materialCount?: number;
}

export const subjectsApi = {
  getAvailableSubjects: async (): Promise<ApiResponse<{
    subjects: ClassSection[];
    studentInfo: { yearLevel: number; program: string; semester: number };
  }>> => {
    const response = await api.get('/subjects/available');
    return response.data;
  },

  getEnrolledSubjects: async (): Promise<ApiResponse<{
    enrolledSubjects: ClassSection[];
  }>> => {
    const response = await api.get('/subjects/enrolled');
    return response.data;
  },

  getAssignedSubjects: async (): Promise<ApiResponse<{
    assignedSubjects: ClassSection[];
  }>> => {
    const response = await api.get('/subjects/assigned');
    return response.data;
  },
};

// Materials API
export interface ClassMaterial {
  id: number;
  title: string;
  description?: string;
  materialType: 'document' | 'video' | 'link' | 'assignment';
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  externalUrl?: string;
  dueDate?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

export const materialsApi = {
  getSectionMaterials: async (sectionId: number): Promise<ApiResponse<{
    materials: ClassMaterial[];
  }>> => {
    const response = await api.get(`/materials/section/${sectionId}`);
    return response.data;
  },

  uploadMaterial: async (sectionId: number, formData: FormData): Promise<ApiResponse<{
    material: ClassMaterial;
  }>> => {
    const response = await api.post(`/materials/section/${sectionId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadMaterial: async (materialId: number): Promise<Blob> => {
    const response = await api.get(`/materials/download/${materialId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Users API
export const usersApi = {
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    gender?: string;
  }): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  updateStudentProfile: async (data: {
    program?: string;
    yearLevel?: number;
    semester?: number;
  }): Promise<ApiResponse<{ profile: StudentProfile }>> => {
    const response = await api.put('/users/student-profile', data);
    return response.data;
  },

  updateFacultyProfile: async (data: {
    department?: string;
    position?: string;
    education?: string;
    specialization?: string;
    officeLocation?: string;
    officeHours?: string;
  }): Promise<ApiResponse<{ profile: FacultyProfile }>> => {
    const response = await api.put('/users/faculty-profile', data);
    return response.data;
  },
};

// Export both named and default
export { api };
export default api;