import React from 'react';
import ReactDOM from 'react-dom';
import { uniq } from 'lodash';

const root = document.createElement('div');

// const App = () => <h1>hello, webpack</h1>;

// ReactDOM.render(<App />, document.body.appendChild(root));

const App = () => React.createElement('h1', null, 'hello, webpack');

ReactDOM.render(React.createElement(App), document.body.appendChild(root));

console.log(uniq([1, 1, 1, 2, 2, 3]));
