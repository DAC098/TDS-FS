var React = require('react');

var { joinPath } = require('../../lib/misc.js');

var NavBar = React.createClass({
	displayName: 'NavBar',

	render: function () {
		let { nav } = this.props;
		return React.createElement(
			'section',
			{ id: 'nav-bar', className: 'col-12' },
			React.createElement(
				'form',
				null,
				React.createElement('input', { className: 'md-button flat dense',
					onClick: () => this.props.logout(),
					type: 'button', value: 'LOGOUT'
				}),
				React.createElement('input', { className: 'md-button flat dense',
					onClick: () => this.props.fetchDirection('refresh'),
					type: 'button', value: 'REFRESH'
				}),
				React.createElement('input', { disabled: nav.path.length === 0, className: 'md-button flat dense',
					onClick: () => this.props.fetchDirection('previous'),
					type: 'button', value: 'BACK'
				})
			),
			React.createElement(
				'span',
				null,
				'directory: ',
				joinPath(nav.path)
			)
		);
	}
});

module.exports = NavBar;