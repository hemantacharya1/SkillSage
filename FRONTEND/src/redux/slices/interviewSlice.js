import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interviewService } from '../../services/interview.service';

// Async thunks
export const fetchInterviews = createAsyncThunk(
  'interview/fetchInterviews',
  async () => {
    const response = await interviewService.getInterviews();
    return Array.isArray(response) ? response : [];
  }
);

export const createInterview = createAsyncThunk(
  'interview/createInterview',
  async (interviewData) => {
    const response = await interviewService.createInterview(interviewData);
    return response;
  }
);

export const updateInterview = createAsyncThunk(
  'interview/updateInterview',
  async ({ id, interviewData }) => {
    const response = await interviewService.updateInterview(id, interviewData);
    return response;
  }
);

export const deleteInterview = createAsyncThunk(
  'interview/deleteInterview',
  async (id) => {
    await interviewService.deleteInterview(id);
    return id;
  }
);

const initialState = {
  interviews: [],
  selectedInterview: null,
  loading: false,
  error: null
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setSelectedInterview: (state, action) => {
      state.selectedInterview = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch interviews
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Create interview
      .addCase(createInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews.push(action.payload);
      })
      .addCase(createInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Update interview
      .addCase(updateInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.interviews.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.interviews[index] = action.payload;
        }
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Delete interview
      .addCase(deleteInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = state.interviews.filter(i => i.id !== action.payload);
      })
      .addCase(deleteInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSelectedInterview, clearError } = interviewSlice.actions;
export default interviewSlice.reducer; 