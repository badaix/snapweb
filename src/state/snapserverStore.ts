import { createStore} from '@reduxjs/toolkit'
import counterReducer, {CounterState} from './snapserverSlice'
import { persistStore, persistReducer, PersistConfig } from 'redux-persist'
import localforage from 'localforage'



const persistConfig: PersistConfig<CounterState> = {
  key: 'root',
  storage: localforage,
  keyPrefix: 'snapweb_',
  blacklist: [
    "server_id", // Blacklisting this allows the server connection to connect after hydration
    "stream_id" // Blacklisting this allows the server connection to connect after hydration
  ],
  'whitelist': [
    'serverUrl',
    'streamUrl',
    'customUrl',
    'details',
    'myClientId',
    'showOfflineClients',
  ]
}

const persistedReducer = persistReducer(persistConfig, counterReducer)

let store = createStore(persistedReducer)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export default () => {
  let persistor = persistStore(store)
  return { store, persistor }
}