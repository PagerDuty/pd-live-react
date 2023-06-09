// you can use this to debug why did you render
// import './wdyr';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';

import {
  ColorModeScript,
  ChakraProvider,
} from '@chakra-ui/react';

import {
  DndProvider,
} from 'react-dnd';
import {
  HTML5Backend,
} from 'react-dnd-html5-backend';

import {
  Provider,
} from 'react-redux';
import {
  PersistGate,
} from 'redux-persist/integration/react';
import {
  store, persistor,
} from 'redux/store';

import App from 'App';
import reportWebVitals from 'reportWebVitals';

import theme from './theme';
import 'index.scss';
import 'react-datepicker/dist/react-datepicker.css';

const toastOptions = {
  defaultOptions: {
    position: 'top',
    duration: 5000,
    isClosable: true,
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider toastOptions={toastOptions}>
        <DndProvider backend={HTML5Backend}>
          <App />
        </DndProvider>
      </ChakraProvider>
      {/* <React.StrictMode>
        <App />
      </React.StrictMode> */}
    </PersistGate>
  </Provider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
