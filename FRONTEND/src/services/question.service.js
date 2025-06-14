import apiHandler from '@/functions/apiHandler';

const API_URL = '/api/questions';

export const questionService = {
  // Get all questions
  getQuestions: async () => {
    const response = await apiHandler({
      url: API_URL,
      method: 'GET'
    });
    return response.data; // Return only the array from the data key
  }
}; 