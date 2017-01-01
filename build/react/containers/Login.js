var React = require('react');

var logger = logger || require('../../client/CLogs.js');
var log = logger.makeLog('cout',{name:'Login'});
var error = logger.makeLog('cout',{name:'Login',prefix:'ERROR'});
var {sendJSON} = require('../../client/xhr.js');

var Login = React.createClass({
    getInitialState: function() {
        return {
            input: {
                username: '',
                password: '',
                confirm_password: ''
            },
            valid: {
                username: true,
                password: true,
                confirm_password: true
            },
            new_user: false
        };
    },
    componentDidMount: function() {
		log('login mounted');
	},
    // ------------------------------------------------------------------------
    // state mutators
    // ------------------------------------------------------------------------
    handleInput: function(key) {
        let {input} = this.state;
        input[key] = this.refs[key].value;
        this.setState({input});
    },
    enableSignUp: function(event) {
        event.preventDefault();
        this.setState({
            new_user: !this.state.new_user
        });
    },
    sendUserData: function(event) {
        event.preventDefault();
        let {input,valid,new_user} = this.state;
        let {username,password,confirm_password} = input;
        if(new_user) {
            let promise = sendJSON('/user/create',input);
            promise.then((data) => {
                if(data.status === 200) {
                    log('redirecting');
                    let url = JSON.parse(data.response).url;
                    let redirect = window.location.origin + url;
                    window.location = redirect;
                } else {
                    log('status code',data.status,'\nresponse:',data.response);
                }
            });
        } else {
            let promise = sendJSON('/user/login',{username,password});
            promise.then((data) => {
                if(data.status >= 400) {
                    let obj = JSON.parse(data.response);
                    valid.username = obj.username;
                    valid.password = !obj.username;
                    log((!valid.username) ? 'invalid username' : 'invalid password');
                    this.setState({valid});
                } else if(data.status === 200) {
                    log('redirecting');
                    let url = JSON.parse(data.response).url;
                    let redirect = window.location.origin + url;
                    window.location = redirect;
                } else {
                    log('status code',data.status,'\nresponse:',data.response);
                }
            });
        }
    },
    // ------------------------------------------------------------------------
    // render
    // ------------------------------------------------------------------------
    render: function() {
        let {input,display} = this.state;
		log('rendering login');
        return (
            <main>
                <div id='login' ref='login'>
                    <section>
						<div/ >
                    </section>
                    <section>
                        <form>
                            <input ref='username'
                                onChange={() => this.handleInput('username')}
                                name='username' type='text'
                                placeholder='Username'
                                value={input.username}
                            />
                            <input ref='password'
                                onChange={() => this.handleInput('password')}
                                name='password' type='text'
                                placeholder='Password'
                                value={input.password}
                            />
                            {this.state.new_user ?
                                <input ref='confirm_password'
                                    onChange={() => this.handleInput('confirm_password')}
                                    name='confirm_password' type='password'
                                    placeholder='Confrim Password'
                                    value={input.confirm_password}
                                />
                                :
                                null
                            }
                            <input type='button' className='inline'
                                onClick={(event) => this.sendUserData(event)}
                                value={(this.state.new_user) ? 'Sign Up' : 'Login'}
                            />
                            <input type='button' className='inline'
                                onClick={(event) => this.enableSignUp(event)}
                                value={(this.state.new_user) ? 'Cancel' : 'Sign Up'}
                            />
                        </form>
                    </section>
                </div>
            </main>
        );
    }
});

module.exports = Login;
