var React = require('react');

var {joinPath} = require('../../lib/misc.js');

var NavBar = React.createClass({
	render: function() {
		let {nav} = this.props;
		return (
			<section id='nav-bar' className='col-12'>
				<form>
					<input className='md-button flat dense'
						onClick={() => this.props.logout()}
						type='button' value='LOGOUT'
					/>
					<input className='md-button flat dense'
						onClick={() => this.props.fetchDirection('refresh')}
						type='button' value='REFRESH'
					/>
					<input disabled={nav.path.length === 0} className='md-button flat dense'
						onClick={() => this.props.fetchDirection('previous')}
						type='button' value='BACK'
					/>
				</form>
				<span>directory: {joinPath(nav.path)}</span>
			</section>
		);
	}
});

module.exports = NavBar;
