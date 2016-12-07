var React = require('react');
var { isoDate } = require('../../lib/misc.js');

var FileContents = React.createClass({
	displayName: 'FileContents',

	render: function () {
		var { file } = this.props;
		return React.createElement(
			'section',
			null,
			React.createElement(
				'section',
				null,
				React.createElement(
					'a',
					{ href: file.download, download: true },
					'Download'
				),
				React.createElement('input', { type: 'button', onClick: () => this.props.removeFile(), value: 'delete' })
			),
			React.createElement(
				'ul',
				null,
				React.createElement(
					'li',
					null,
					'name: ',
					file.name
				),
				React.createElement(
					'li',
					null,
					'extension: ',
					file.ext
				),
				React.createElement(
					'li',
					null,
					'full name: ',
					file.base
				),
				React.createElement(
					'li',
					null,
					'size (bytes): ',
					file.size
				),
				React.createElement(
					'li',
					null,
					'created: ',
					isoDate(file.birthtime)
				),
				React.createElement(
					'li',
					null,
					'modified: ',
					isoDate(file.mtime)
				)
			)
		);
	}
});

module.exports = FileContents;