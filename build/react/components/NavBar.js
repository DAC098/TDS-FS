var React = require('react');

var {joinPath} = require('../../lib/misc.js');

var NavBar = React.createClass({
	render: function() {
		let {nav} = this.props;
		return (
			<section id='nav-bar' className='row'>
				<form>
					<input className='small'
						onClick={() => this.props.logout()}
						type='button' value='Logout'
					/>
					<input className='small'
						onClick={() => this.props.fetchDirection('refresh')}
						type='button' value='Refresh'
					/>
					<input disabled={nav.path.length === 0} className='small'
						onClick={() => this.props.fetchDirection('previous')}
						type='button' value='Back'
					/>
				</form>
				<span>directory: {joinPath(nav.path)}</span>
			</section>
		);
	}
});

module.exports = NavBar;
