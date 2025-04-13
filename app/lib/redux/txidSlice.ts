import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TxidState {
  txid: string | null;
  buttonVisible: boolean;
}

const initialState: TxidState = {
  txid: null,
  buttonVisible: false,
};

const txidSlice = createSlice({
  name: 'txid',
  initialState,
  reducers: {
    setTxid(state, action: PayloadAction<string | null>) {
      state.txid = action.payload;
      state.buttonVisible = action.payload !== null;
    },
    hideButton(state) {
      state.buttonVisible = false;
    },
  },
});

export const { setTxid, hideButton } = txidSlice.actions;
export const selectTxid = (state: { txid: TxidState }) => state.txid;
export default txidSlice.reducer;