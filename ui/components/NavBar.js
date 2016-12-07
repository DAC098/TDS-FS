var React = require('react');

var { joinPath } = require('../../lib/misc.js');

var NavBar = React.createClass({
	displayName: 'NavBar',

	render: function () {
		let { nav } = this.props;
		return React.createElement(
			'section',
			{ id: 'nav-bar', className: 'row' },
			React.createElement(
				'form',
				null,
				React.createElement('input', { className: 'small',
					onClick: () => this.props.logout(),
					type: 'button', value: 'Logout'
				}),
				React.createElement('input', { className: 'small',
					onClick: () => this.props.fetchDirection('refresh'),
					type: 'button', value: 'Refresh'
				}),
				React.createElement('input', { disabled: nav.path.length === 0, className: 'small',
					onClick: () => this.props.fetchDirection('previous'),
					type: 'button', value: 'Back'
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