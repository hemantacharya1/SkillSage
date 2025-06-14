import apiHandler from '@/functions/apiHandler';

const API_URL = '/api/interviews';

export const interviewService = {
  // Get all interviews
  getInterviews: async () => {
    const response = await apiHandler({
      url: API_URL,
      method: 'GET'
    });
    // Ensure we're returning an array from the response
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // Get interview by ID
  getInterviewById: async (id) => {
    const response = await apiHandler({
      url: `${API_URL}/${id}`,
      method: 'GET'
    });
    return response.data;
  },

  // Create new interview
  createInterview: async (interviewData) => {
    const response = await apiHandler({
      url: API_URL,
      method: 'POST',
      data: interviewData
    });
    return response.data;
  },

  // Update interview
  updateInterview: async (id, interviewData) => {
    const response = await apiHandler({
      url: `${API_URL}/${id}`,
      method: 'PUT',
      data: interviewData
    });
    return response.data;
  },

  // Delete interview
  deleteInterview: async (id) => {
    const response = await apiHandler({
      url: `${API_URL}/${id}`,
      method: 'DELETE'
    });
    return response.data;
  }
}; 