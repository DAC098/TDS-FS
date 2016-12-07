var React = require('react');

function contentData(content) {
    let rtn = {
        size: 0,
        files: 0,
        dirs: 0,
        Kb: 0,
        Mb: 0
    };
    if (Array.isArray(content)) {
        for (let item of content) {
            rtn.size += item.size;
            rtn.files += item.type === 'file' ? 1 : 0;
            rtn.dirs += item.type === 'dir' ? 1 : 0;
        }
    } else {
        rtn.size = content.size;
    }
    rtn.KiB = Math.floor(rtn.size / 1024);
    rtn.MiB = Math.floor(rtn.size / 1048576);
    return rtn;
}

var ItemInfo = React.createClass({
    displayName: 'ItemInfo',

    render: function () {
        let { nav } = this.props;
        let meta = contentData(this.props.info);
        return React.createElement(
            'section',
            { id: 'dir-info', className: 'row' },
            React.createElement(
                'ul',
                { className: 'horizontal' },
                React.createElement(
                    'li',
                    null,
                    'size: ',
                    meta.MiB,
                    'MiB | ',
                    meta.KiB,
                    'KiB'
                ),
                nav.type.dir ? React.createElement(
                    'li',
                    null,
                    'files: ',
                    meta.files,
                    ', folders: ',
                    meta.dirs
                ) : null
            )
        );
    }
});

module.exports = ItemInfo;