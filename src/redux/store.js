import {
  createStore, applyMiddleware, // compose,
} from 'redux';
import createSagaMiddleware from 'redux-saga';

import {
  persistStore, persistReducer,
} from 'redux-persist';
import {
  persistConfig,
} from './persistence/config';

import rootReducer from './rootReducer';
import rootSaga from './rootSaga';

const persistedReducer = persistReducer(persistConfig, rootReducer);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(persistedReducer, applyMiddleware(sagaMiddleware));
// const store = createStore(
//   persistedReducer,
//   compose(
//     applyMiddleware(sagaMiddleware),
//     // eslint-disable-next-line no-underscore-dangle
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
//   ),
// );
const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

// Expore store for Cypress tests
if (window.Cypress) {
  window.store = store;
}

export { store, persistor };
