import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch project' });
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create project' });
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response.data;
    } catch (error) {
      console.error('❌ Update project error:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error message:', error.message);
      
      // Better error handling
      if (error.response) {
        // Server responded with error status
        return rejectWithValue({
          message: error.response.data?.message || 'Failed to update project',
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        // Request was made but no response received
        return rejectWithValue({
          message: 'Network error - no response from server',
          status: 0,
          data: null
        });
      } else {
        // Something else happened
        return rejectWithValue({
          message: error.message || 'Failed to update project',
          status: 0,
          data: null
        });
      }
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`);
      return projectId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete project' });
    }
  }
);

export const joinProject = createAsyncThunk(
  'projects/joinProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/join`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to join project' });
    }
  }
);

export const leaveProject = createAsyncThunk(
  'projects/leaveProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/leave`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to leave project' });
    }
  }
);

export const requestCollaboration = createAsyncThunk(
  'projects/requestCollaboration',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/collaborate`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to request collaboration' });
    }
  }
);

export const handleCollaborationRequest = createAsyncThunk(
  'projects/handleCollaborationRequest',
  async ({ projectId, userId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/collaborate/${userId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to handle collaboration request' });
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch projects';
      })
      // Fetch Project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch project';
      })
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create project';
      })
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update project';
      })
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter(p => p._id !== action.payload);
        if (state.currentProject && state.currentProject._id === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete project';
      })
      // Join Project
      .addCase(joinProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(joinProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to join project';
      })
      // Leave Project
      .addCase(leaveProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject && state.currentProject._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(leaveProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to leave project';
      })
      // Request Collaboration
      .addCase(requestCollaboration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCollaboration.fulfilled, (state, action) => {
        state.loading = false;
        // No direct state update for collaboration requests, they are handled by backend
      })
      .addCase(requestCollaboration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to request collaboration';
      })
      // Handle Collaboration Request
      .addCase(handleCollaborationRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleCollaborationRequest.fulfilled, (state, action) => {
        state.loading = false;
        // No direct state update for collaboration requests, they are handled by backend
      })
      .addCase(handleCollaborationRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to handle collaboration request';
      });
  },
});

export const { clearError, clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;