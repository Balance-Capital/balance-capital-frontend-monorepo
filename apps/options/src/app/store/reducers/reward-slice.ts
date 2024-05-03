import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getCurrentSeason,
  getRewardLeaderboard,
  getTaskProgress,
  getTaskTiers,
  getTasks,
  getUserPoint,
} from "../../helpers/axios";

interface ITask {
  id: number;
  title: string;
  description: string;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskProgress {
  id: string;
  user: string;
  task: number;
  tier: number;
  current_data: string;
  createdAt: string;
  updatedAt: string;
  signature: string;
}

interface ITaskTier {
  id: string;
  task: number;
  tier: number;
  point: number;
  criteria: number;
  createdAt: string;
  updatedAt: string;
  signature: string;
}

interface ICurrentSeason {
  id: number;
  start_time: string;
  end_time: string;
  last_updated_time: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IUserPoint {
  claimable_point: number;
  current_point: number;
  rank: number;
  completed_tasks: Array<number>;
}

interface IRewardLeaderboard {
  data: Array<{ user: string; point: number; boost: number; rank: number }>;
  length: number;
}

interface IReward {
  tasks: Array<ITask>;
  taskProgress: Array<ITaskProgress>;
  taskTiers: Array<ITaskTier>;
  currentSeason: ICurrentSeason;
  userPoint: IUserPoint;
  leaderboard: IRewardLeaderboard;
}

export const loadTasksThunk = createAsyncThunk(
  "reward/loadTasks",
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await getTasks();
      return tasks;
    } catch (error) {
      return rejectWithValue([]);
    }
  }
);

export const loadTaskProgressThunk = createAsyncThunk(
  "reward/loadTaskProgress",
  async ({ address }: { address: string }, { rejectWithValue }) => {
    try {
      const taskProgress = await getTaskProgress(address);
      return taskProgress;
    } catch (error) {
      return rejectWithValue([]);
    }
  }
);

export const loadTaskTiersThunk = createAsyncThunk(
  "reward/loadTaskTiers",
  async (_, { rejectWithValue }) => {
    try {
      const taskTiers = await getTaskTiers();
      return taskTiers;
    } catch (error) {
      return rejectWithValue([]);
    }
  }
);

export const loadCurrentSeasonThunk = createAsyncThunk(
  "reward/loadCurrentSeason",
  async (_, { rejectWithValue }) => {
    try {
      const currentSeason = await getCurrentSeason();
      return currentSeason;
    } catch (error) {
      return rejectWithValue({});
    }
  }
);

export const loadUserPointThunk = createAsyncThunk(
  "reward/loadUserPoint",
  async ({ address }: { address: string }, { rejectWithValue }) => {
    try {
      const userPoint = await getUserPoint(address);
      return userPoint;
    } catch (error) {
      return rejectWithValue({});
    }
  }
);

export const loadRewardLeaderboardThunk = createAsyncThunk(
  "reward/loadRewardLeaderboard",
  async (
    { skip, take, address }: { skip: number; take: number; address: string },
    { rejectWithValue }
  ) => {
    try {
      const leaderboard = await getRewardLeaderboard(skip, take, address);
      return leaderboard;
    } catch (error) {
      return rejectWithValue([]);
    }
  }
);

const initialState: IReward = {
  tasks: [],
  taskProgress: [],
  taskTiers: [],
  currentSeason: {} as ICurrentSeason,
  userPoint: {
    claimable_point: -1,
    current_point: -1,
    rank: -1,
    completed_tasks: [],
  },
  leaderboard: {
    data: [],
    length: 0,
  },
};

const rewardSlice = createSlice({
  name: "reward",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(loadTasksThunk.rejected, (state) => {
      state.tasks = [];
    });
    builder.addCase(loadTasksThunk.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
    builder.addCase(loadTaskProgressThunk.rejected, (state) => {
      state.taskProgress = [];
    });
    builder.addCase(loadTaskProgressThunk.fulfilled, (state, action) => {
      state.taskProgress = action.payload;
    });
    builder.addCase(loadTaskTiersThunk.rejected, (state) => {
      state.taskTiers = [];
    });
    builder.addCase(loadTaskTiersThunk.fulfilled, (state, action) => {
      state.taskTiers = action.payload;
    });
    builder.addCase(loadCurrentSeasonThunk.rejected, (state) => {
      state.currentSeason = {} as ICurrentSeason;
    });
    builder.addCase(loadCurrentSeasonThunk.fulfilled, (state, action) => {
      state.currentSeason = action.payload;
    });
    builder.addCase(loadUserPointThunk.rejected, (state) => {
      state.userPoint = {
        claimable_point: 0,
        current_point: 0,
        rank: 0,
        completed_tasks: [],
      };
    });
    builder.addCase(loadUserPointThunk.fulfilled, (state, action) => {
      state.userPoint = action.payload;
    });
    builder.addCase(loadRewardLeaderboardThunk.rejected, (state) => {
      state.leaderboard = {
        data: [],
        length: 0,
      };
    });
    builder.addCase(loadRewardLeaderboardThunk.fulfilled, (state, action) => {
      state.leaderboard = action.payload;
    });
  },
});

// export const {} = rewardSlice.actions;

export const rewardReducer = rewardSlice.reducer;
