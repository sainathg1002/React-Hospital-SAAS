import { create } from 'zustand';
import type { User, Hospital, UserRole } from '@/types';

// Mock credentials mapping for easy testing
export const MOCK_USERS: Record<string, { name: string; role: UserRole; avatarUrl: string }> = {
  'admin@hospital.com': {
    name: 'Dr. Rajesh Sharma',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  'doctor@hospital.com': {
    name: 'Dr. Priya Patel',
    role: 'doctor',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=80',
  },
  'nurse@hospital.com': {
    name: 'Nurse Sunita Rao',
    role: 'nurse',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  'receptionist@hospital.com': {
    name: 'Amit Kumar',
    role: 'receptionist',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  'patient@hospital.com': {
    name: 'Aarav Mehta',
    role: 'patient',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
};

const MOCK_HOSPITALS: Hospital[] = [
  { id: 'hosp-1', name: "WeCare General Hospital, Bangalore", address: "98, HAL Old Airport Road, Kodihalli, Bengaluru" },
  { id: 'hosp-2', name: "WeCare Super Specialty Clinic, Whitefield", address: "12, ITPL Main Road, Whitefield, Bengaluru" },
  { id: 'hosp-3', name: "WeCare Women & Children Hospital, Indiranagar", address: "450, 100 Feet Road, Indiranagar, Bengaluru" },
];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hospitals: Hospital[];
  activeHospital: Hospital | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchHospital: (hospitalId: string) => void;
  clearError: () => void;
}

// Restore state from LocalStorage if available
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem('hms_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user,
        isAuthenticated: !!parsed.user,
        activeHospital: parsed.activeHospital || MOCK_HOSPITALS[0],
      };
    }
  } catch (e) {
    console.error('Failed to parse stored auth', e);
  }
  return {
    user: null,
    isAuthenticated: false,
    activeHospital: MOCK_HOSPITALS[0],
  };
};

const initialAuth = getStoredAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  isAuthenticated: initialAuth.isAuthenticated,
  hospitals: MOCK_HOSPITALS,
  activeHospital: initialAuth.activeHospital,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowercaseEmail = email.toLowerCase().trim();
    const mockUser = MOCK_USERS[lowercaseEmail];

    if (mockUser && password.length >= 6) {
      const loggedUser: User = {
        id: `usr-${mockUser.role}-${Date.now().toString().slice(-4)}`,
        email: lowercaseEmail,
        name: mockUser.name,
        role: mockUser.role,
        avatarUrl: mockUser.avatarUrl,
        hospitalId: MOCK_HOSPITALS[0].id,
      };

      set({
        user: loggedUser,
        isAuthenticated: true,
        activeHospital: MOCK_HOSPITALS[0],
        isLoading: false,
        error: null,
      });

      localStorage.setItem(
        'hms_auth',
        JSON.stringify({ user: loggedUser, activeHospital: MOCK_HOSPITALS[0] })
      );
      return true;
    } else {
      set({
        isLoading: false,
        error: 'Invalid credentials. Password must be at least 6 characters.',
      });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
    localStorage.removeItem('hms_auth');
  },

  switchHospital: (hospitalId) => {
    set((state) => {
      const match = state.hospitals.find((h) => h.id === hospitalId) || state.activeHospital;
      if (state.user) {
        const updatedUser = { ...state.user, hospitalId: match?.id || '' };
        localStorage.setItem(
          'hms_auth',
          JSON.stringify({ user: updatedUser, activeHospital: match })
        );
        return { activeHospital: match, user: updatedUser };
      }
      return { activeHospital: match };
    });
  },

  clearError: () => set({ error: null }),
}));
