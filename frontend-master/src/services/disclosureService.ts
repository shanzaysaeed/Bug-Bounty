import axios from "axios";
import { getCsrfToken } from "../utils/csrf";

export type ThreadMessage = {
  senderName: string;
  senderAvatar?: string | null;
  message: string;
  timestamp: Date;
};

export type Disclosure = {
  id: number;
  unread: boolean;
  status: string; // Status of the disclosure (SUBMITTED, ACCEPTED, REJECTED)
  content: string; // The report content
  commentCount: number;
  comments?: ThreadMessage[]; // Only loaded in detailed view
  organization?: string; // Only for researchers
  jobRequestTitle: string;
  logo: string | null;
  user: string; // The username who created the report
};

export type UserRole = 'RESEARCHER' | 'ORGANIZATION' | 'ADMIN';

// Service implementation
export const disclosureService = {
  // Get all disclosures - accessible by RESEARCHER role
  getAll: async (): Promise<Disclosure[]> => {
    try {
      const response = await axios.get('/api/reports/get-all');
      
      if (response.status === 200 && response.data.reports) {
        // Map API response to the Disclosure type
        return response.data.reports.map((report: any) => ({
          id: report.id,
          unread: report.unread,
          status: report.status,
          content: report.content,
          commentCount: report.commentCount,
          organization: report.organization,
          jobRequestTitle: report.jobRequestTitle,
          logo: report.logo || null,
          user: report.user
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching disclosures:', error);
      return [];
    }
  },

  // Get a single disclosure by ID - accessible by RESEARCHER role
  getById: async (id: number): Promise<Disclosure | null> => {
    try {
      const response = await axios.get(`/api/reports/get-by-id?report_id=${id}`);
      
      if (response.status === 200 && response.data.report) {
        const report = response.data.report;
        
        // Map comments to ThreadMessage format
        const comments: ThreadMessage[] = report.comments ? 
          report.comments.map((comment: any) => ({
            senderName: comment.senderName,
            message: comment.message,
            timestamp: new Date(comment.timestamp)
          })) : [];
          
        return {
          id: report.id,
          unread: report.unread,
          status: report.status,
          content: report.content,
          commentCount: report.commentCount,
          comments: comments,
          organization: report.organization,
          jobRequestTitle: report.jobRequestTitle,
          logo: report.logo || null,
          user: report.user
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching disclosure with ID ${id}:`, error);
      return null;
    }
  },

  // Send a new message to a disclosure thread - accessible by RESEARCHER role
  sendMessage: async (disclosureId: number, messageData: { content: string }): Promise<boolean> => {
    try {
      const response = await axios.post('/api/reports/comment', {
        report_id: disclosureId,
        content: messageData.content,
        csrf_token: await getCsrfToken(),
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  // Submit a new disclosure/report for an opportunity - accessible by RESEARCHER role
  submitDisclosure: async (opportunityId: string, content: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/reports/create-report', {
        request_id: opportunityId,
        content: content,
        csrf_token: await getCsrfToken(),
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error submitting disclosure:', error);
      throw error; // Re-throw to allow modal to show error message
    }
  }
};
