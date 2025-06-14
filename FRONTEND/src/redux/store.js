import { configureStore } from "@reduxjs/toolkit";
import { userSlice } from "./features/user/userSlice";
import interviewReducer from "./slices/interviewSlice";
import questionReducer from "./slices/questionSlice";
import logger from "redux-logger";
import { reduxLocalStorage } from "../imports/localStorage";

function saveToLocalStorage(state) {
  try {
    const storage = JSON.stringify(state);
    localStorage.setItem(reduxLocalStorage, storage);
  } catch (e) {
    console.warn(e);
  }
}

function loadFromLocalStorage() {
  try {
    const serialState = localStorage.getItem(reduxLocalStorage);
    if (serialState === null) return undefined;
    return JSON.parse(serialState);
  } catch (e) {
    console.warn(e);
    return undefined;
  }
}

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
    interview: interviewReducer,
    question: questionReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
  preloadedState: loadFromLocalStorage(),
});

store.subscribe(() => saveToLocalStorage(store.getState()));

export default store;
