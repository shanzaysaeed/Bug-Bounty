import axios from "axios";
import { getCsrfToken } from "../utils/csrf";

export type User = {
  name: string;
  email: string;
  role: string;
  auth_stage: string;
  metadata: {
    approved?: boolean;
    logo_url?: string | null;
  };
};

// Service implementation
export const userService = {
  // Get current user info
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const response = await axios.get('/api/users/me');
      
      if (response.status === 200) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  },

  // Log out the current user
  logout: async (): Promise<boolean> => {
    try {
      const response = await axios.post('/api/users/logout', {
        csrf_token: await getCsrfToken(),
      });
      return response.status === 200;
    } catch (error) {
      console.error('Error logging out:', error);
      return false;
    }
  }
};