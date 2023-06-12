import { createStore } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const initialState = {
  userAddress: null,
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "CONNECT_KAIKAS":
      return { ...state, userAddress: action.payload };
    case "DISCONNECT_KAIKAS":
      return { ...state, userAddress: null };
    default:
      return state;
  }
}

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = createStore(persistedReducer);
const persistor = persistStore(store);

export default store;
export { persistor };
