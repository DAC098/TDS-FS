var React = require('react');

var self = null;

var UploadBar = React.createClass({
    displayName: 'UploadBar',

    componentDidMount: function () {
        self = this;
    },
    statics: {
        clearFiles: function () {
            console.log('clearing files');
            self.refs['file'].value = '';
        }
    },
    handleChange: function (key) {
        switch (key) {
            case 'dir':
                this.props.setUploadState(key, this.refs[key].value);
                break;
            case 'file':
                let files = this.refs[key].files;
                console.log('files:', files);
                this.props.setUploadState(key, files);
                break;
            default:

        }
    },
    render: function () {
        return React.createElement(
            'section',
            { className: 'row' },
            React.createElement(
                'form',
                null,
                React.createElement('input', { type: 'file', ref: 'file', multiple: true,
                    onChange: () => this.handleChange('file')
                }),
                React.createElement('input', { type: 'button', className: 'small',
                    onClick: () => this.props.uploadFiles(),
                    value: 'upload'
                })
            ),
            React.createElement(
                'form',
                null,
                React.createElement('input', { type: 'text', ref: 'dir',
                    className: 'inline',
                    onChange: () => this.handleChange('dir'),
                    value: this.props.upload.dir
                }),
                React.createElement('input', { type: 'button', className: 'small',
                    onClick: () => this.props.uploadDir(),
                    value: 'create'
                })
            )
        );
    }
});

module.exports = UploadBar;