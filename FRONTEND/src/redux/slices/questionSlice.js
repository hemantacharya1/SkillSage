import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { questionService } from '@/services/question.service';

export const fetchQuestions = createAsyncThunk(
  'question/fetchQuestions',
  async () => {
    const questionsArray = await questionService.getQuestions();
    return questionsArray.data;
  }
);

console.log('hhhhhhhhhhhhhhhhh', fetchQuestions);

const questionSlice = createSlice({
  name: 'question',
  initialState: {
    questions: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.questions = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default questionSlice.reducer; 