import { Alert } from 'antd';
import React, { Component } from 'react';
// import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
// import Link from 'umi/link';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import LoginComponents from './components/Login';
import styles from './style.less';
// import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
// import PubSub from 'pubsub-js';

const { UserName, Password, Submit } = LoginComponents;
interface LoginProps {
  dispatch: Dispatch<AnyAction>;
  userLogin: StateType;
  submitting?: boolean;
}
interface LoginState {
  type: string;
  // autoLogin: boolean;
  tokenType: 'default';
}

class Login extends Component<LoginProps, LoginState> {
  loginForm: FormComponentProps['form'] | undefined | null = undefined;

  state: LoginState = {
    type: 'account',
    // autoLogin: true,
    tokenType: 'default',
  };

  // changeAutoLogin = (e: CheckboxChangeEvent) => {
  //   this.setState({
  //     autoLogin: e.target.checked,
  //   });
  // };

  handleSubmit = (err: unknown, values: any) => {
    const { tokenType } = this.state;

    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: { ...values, tokenType },
        // callback: (response: string) => {
        // if (response === 'loginSuccess') {
        // PubSub.publish('login-success', 'login-success');
        // }
        // },
      });
    }
  };

  onTabChange = (type: string) => {
    this.setState({
      type,
    });
  };

  onGetCaptcha = () =>
    new Promise<boolean>((resolve, reject) => {
      if (!this.loginForm) {
        return;
      }

      this.loginForm.validateFields(['mobile'], {}, async (err: unknown, values: any) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;

          try {
            const success = await ((dispatch({
              type: 'login/getCaptcha',
              payload: values.mobile,
            }) as unknown) as Promise<unknown>);
            resolve(!!success);
          } catch (error) {
            reject(error);
          }
        }
      });
    });

  renderMessage = (content: string) => (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );

  render() {
    const { userLogin = {}, submitting } = this.props;
    const { status } = userLogin;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <LoginComponents
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          onCreate={(form?: FormComponentProps['form']) => {
            this.loginForm = form;
          }}
        >
          {/* <Tab key="account" tab="??????????????????"> */}
          {status === 400 &&
            // loginType === 'account' &&
            !submitting &&
            this.renderMessage('?????????????????????')}
          <UserName
            name="username"
            placeholder="?????????"
            rules={[
              {
                required: true,
                message: '??????????????????!',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="??????"
            rules={[
              {
                required: true,
                message: '??????????????????',
              },
            ]}
            onPressEnter={e => {
              e.preventDefault();

              if (this.loginForm) {
                this.loginForm.validateFields(this.handleSubmit);
              }
            }}
          />
          {/* </Tab>
          <Tab key="mobile" tab="???????????????">
            {status === 'error' &&
              loginType === 'mobile' &&
              !submitting &&
              this.renderMessage('???????????????')}
            <Mobile
              name="mobile"
              placeholder="?????????"
              rules={[
                {
                  required: true,
                  message: '?????????????????????',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '????????????????????????',
                },
              ]}
            />
            <Captcha
              name="captcha"
              placeholder="?????????"
              countDown={120}
              onGetCaptcha={this.onGetCaptcha}
              getCaptchaButtonText="???????????????"
              getCaptchaSecondText="???"
              rules={[
                {
                  required: true,
                  message: '?????????????????????',
                },
              ]}
            />
          </Tab> */}
          {/* <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              ????????????
            </Checkbox>
            <a
              style={{
                float: 'right',
              }}
              href=""
            >
              ????????????
            </a>
          </div> */}
          <Submit loading={submitting}>??????</Submit>
          {/* <div className={styles.other}>
            ??????????????????
            <Icon type="alipay-circle" className={styles.icon} theme="outlined" />
            <Icon type="taobao-circle" className={styles.icon} theme="outlined" />
            <Icon type="weibo-circle" className={styles.icon} theme="outlined" />
            <Link className={styles.register} to="/user/register">
              ????????????
            </Link>
          </div> */}
        </LoginComponents>
      </div>
    );
  }
}

export default connect(({ login, loading }: ConnectState) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
