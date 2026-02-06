import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBranch: '강남4호점'
};

const branchSlice = createSlice({
  name: 'branch',
  initialState,
  reducers: {}
});

export default branchSlice.reducer;
