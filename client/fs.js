var React = require('react');
var {render} = require('react-dom');

var socket = require('./socket.js');

var App = require('../ui/containers/App.js');

render(React.createElement(App),document.getElementById('render'));
