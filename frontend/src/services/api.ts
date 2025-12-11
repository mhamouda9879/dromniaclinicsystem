import axios from 'axios';
import { Appointment, Patient, Visit, QueueDisplay, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Patients API
export const patientsApi = {
  getAll: async (): Promise<Patient[]> => {
    const response = await api.get('/patients');
    return response.data;
  },
  getById: async (id: string): Promise<Patient> => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },
  getByPhone: async (phoneNumber: string): Promise<Patient> => {
    try {
      const response = await api.get(`/patients/phone/${phoneNumber}`);
      return response.data;
    } catch (error: any) {
      // If 404, patient doesn't exist
      if (error.response?.status === 404) {
        throw error;
      }
      throw error;
    }
  },
  create: async (data: Partial<Patient>): Promise<Patient> => {
    const response = await api.post('/patients', data);
    return response.data;
  },
  update: async (id: string, data: Partial<Patient>): Promise<Patient> => {
    const response = await api.patch(`/patients/${id}`, data);
    return response.data;
  },
};

// Appointments API
export const appointmentsApi = {
  getAll: async (date?: string): Promise<Appointment[]> => {
    const params = date ? { date } : {};
    const response = await api.get('/appointments', { params });
    return response.data;
  },
  getToday: async (): Promise<Appointment[]> => {
    const response = await api.get('/appointments/today');
    return response.data;
  },
  getById: async (id: string): Promise<Appointment> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  create: async (data: Partial<Appointment>): Promise<Appointment> => {
    // Validate required fields
    if (!data.patientId) {
      throw new Error('patientId is required');
    }
    if (!data.visitType) {
      throw new Error('visitType is required');
    }
    if (!data.appointmentDate) {
      throw new Error('appointmentDate is required');
    }
    if (!data.appointmentTime) {
      throw new Error('appointmentTime is required');
    }
    
    // Ensure required fields are present
    const appointmentData: any = {
      patientId: data.patientId,
      visitType: data.visitType,
      appointmentDate: data.appointmentDate,
      appointmentTime: data.appointmentTime,
    };
    
    // Add optional fields if provided
    if (data.source) appointmentData.source = data.source;
    if (data.status) appointmentData.status = data.status;
    if (data.queueNumber) appointmentData.queueNumber = data.queueNumber;
    if (data.emergencyFlag !== undefined) appointmentData.emergencyFlag = data.emergencyFlag;
    if (data.notes) appointmentData.notes = data.notes;
    
    console.log('Sending appointment data:', appointmentData);
    const response = await api.post('/appointments', appointmentData);
    console.log('Appointment created:', response.data);
    return response.data;
  },
  update: async (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: string, status: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },
  cancel: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/appointments/${id}/cancel`);
    return response.data;
  },
  getAvailableSlots: async (date: string): Promise<string[]> => {
    const response = await api.get('/appointments/available-slots', { params: { date } });
    return response.data;
  },
  getAvailableDates: async (): Promise<string[]> => {
    const response = await api.get('/appointments/available-dates');
    return response.data;
  },
};

// Queue API
export const queueApi = {
  getToday: async (): Promise<Appointment[]> => {
    const response = await api.get('/queue/today');
    return response.data;
  },
  getCurrent: async (): Promise<Appointment | null> => {
    const response = await api.get('/queue/current');
    return response.data;
  },
  getNext: async (): Promise<Appointment | null> => {
    const response = await api.get('/queue/next');
    return response.data;
  },
  getPosition: async (patientId: string): Promise<number | null> => {
    const response = await api.get(`/queue/position/${patientId}`);
    return response.data;
  },
  getWaitingRoomDisplay: async (): Promise<QueueDisplay> => {
    const response = await api.get('/queue/waiting-room');
    return response.data;
  },
  markArrived: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/queue/${id}/arrived`);
    return response.data;
  },
  startConsultation: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/queue/${id}/start`);
    return response.data;
  },
  finishConsultation: async (id: string): Promise<Appointment> => {
    const response = await api.patch(`/queue/${id}/finish`);
    return response.data;
  },
  reorder: async (id: string, queueNumber: number): Promise<Appointment> => {
    const response = await api.patch(`/queue/${id}/reorder`, { queueNumber });
    return response.data;
  },
};

// Visits API
export const visitsApi = {
  create: async (data: Partial<Visit>): Promise<Visit> => {
    const response = await api.post('/visits', data);
    return response.data;
  },
  getByAppointment: async (appointmentId: string): Promise<Visit | null> => {
    const response = await api.get(`/visits/appointment/${appointmentId}`);
    return response.data;
  },
  getByPatient: async (patientId: string): Promise<Visit[]> => {
    const response = await api.get(`/visits/patient/${patientId}`);
    return response.data;
  },
  update: async (id: string, data: Partial<Visit>): Promise<Visit> => {
    const response = await api.patch(`/visits/${id}`, data);
    return response.data;
  },
};

export default api;

