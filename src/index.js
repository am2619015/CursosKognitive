import React from 'react';
import ReactDOM from 'react-dom';
/* agrega animaciones a mdb */ 
import "mdbreact/dist/css/mdb.css";

/* boostrap */
import 'bootstrap/dist/css/bootstrap.min.css';
/*import $ from 'jquery';
import Popper from 'popper.js';*/
import 'bootstrap/dist/js/bootstrap.bundle.min';

import App from './components/App';
import * as serviceWorker from './serviceWorker';

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
    ReactDOM.hydrate(<App />, rootElement);
  } else {
    ReactDOM.render(<App />, rootElement);
  }

//ReactDOM.render(<App />,root);

serviceWorker.unregister();
