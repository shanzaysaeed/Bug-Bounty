export interface Opportunity {
  id: string;
  title: string;
  company: string;
  datePosted: Date;
  previewDescription: string;
  detailedDescription: string;
  logo: string;
  tags: string[];
  responsibleDisclosureUrl: string;
  state?: string;
}

import axios from "axios";

// API service for opportunities
export const opportunityService = {
  // Get all opportunities
  getAll: async (): Promise<Opportunity[]> => {
    try {
      const response = await axios.get('/api/requests/get-all');
      
      if (response.status === 200 && response.data.requests) {
        // Convert the datePosted string to Date objects
        return response.data.requests.map((opp: any) => ({
          ...opp,
          datePosted: new Date(opp.datePosted),
          tags: Array.isArray(opp.tags) ? opp.tags : [],
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }
  },
  
  // Get opportunity by ID
  getById: async (id: string): Promise<Opportunity | undefined> => {
    try {
      const response = await axios.get(`/api/requests/get-by-id?request_id=${id}`);
      
      if (response.status === 200 && response.data.request) {
        const opp = response.data.request;
        return {
          ...opp,
          datePosted: new Date(opp.datePosted),
          tags: Array.isArray(opp.tags) ? opp.tags : [],
        };
      }
      return undefined;
    } catch (error) {
      console.error(`Error fetching opportunity with ID ${id}:`, error);
      return undefined;
    }
  }
};
