import {Button, Card, Checkbox, Col, Icon, Input, InputNumber, message, Row, Select, Spin, Tooltip} from "antd";
import React, {useEffect, useState} from "react";
import Service from "../service";
import Form from "antd/es/form";
import {FormComponentProps} from "antd/lib/form";
import Section from './section';

interface Props extends FormComponentProps {
  loading: boolean
}

interface State {
  item: any;
  loading: boolean;
}

const Save: React.FC<Props> = props => {

  const initState: State = {
    item: {},
    loading: props.loading
  };

  const {form: {getFieldDecorator}, form} = props;
  const service = new Service('media/server');

  const [item, setItem] = useState(initState.item);
  const [providersList, setProvidersList] = useState<any[]>([]);
  const [providerType, setProviderType] = useState<string>('');

  const id = 'gb28181_MediaServer';
  const [loading, setLoading] = useState<boolean>(initState.loading);

  const initValue = () => {
    service.mediaServerInfo(id).subscribe(data => {
      setProviderType(data.provider);
      data.configuration.playerConfig = data.configuration.playerConfig ?
        data.configuration.playerConfig : [
          {format: 'flv', enabled: false, port: data.configuration.apiPort}, {
            format: 'mp4',
            enabled: false,
            port: data.configuration.apiPort
          }, {
            format: 'hls',
            enabled: false, port: data.configuration.apiPort
          }, {format: 'rtc', enabled: false}];
      setItem(data);
    }, () => {
      setItem({
        configuration: {
          playerConfig: [
            {format: 'flv', enabled: false}, {
              format: 'mp4',
              enabled: false
            }, {
              format: 'hls',
              enabled: false
            }, {format: 'rtc', enabled: false}]
        }
      })
    }, () => setLoading(false));

    service.providersList().subscribe(data => {
      setProvidersList(data);
    }, () => {
      setLoading(false)
    }, () => setLoading(false));
  };

  useEffect(() => {
    initValue();
  }, [props.loading]);

  const saveData = () => {

    form.validateFields((err, fileValue) => {
      if (err) {
        setLoading(false);
        return;
      }

      //todo ??????????????????????????????????????????????????????????????????
      fileValue.id = id;
      service.saveMediaServer(fileValue).subscribe(() => {
          message.success('????????????');
        },
        () => {
          message.error('????????????');
        },
        () => {
          initValue();
        });
    });
  };

  const dynamic = () => {
    const configuration = item.configuration ?
      (typeof item.configuration === "string" ? JSON.parse(item.configuration) : item.configuration)
      : {};
    switch (configuration.dynamicRtpPort) {
      case true:
        return <Col span={8}>
          {getFieldDecorator('configuration.dynamicRtpPortRange', {
            rules: [
              {required: true, message: '?????????RTP??????'}
            ],
            initialValue: configuration.dynamicRtpPortRange,
          })(<Section/>)}
        </Col>;
      case false :
        return <Col span={3}>
          {getFieldDecorator('configuration.rtpPort', {
            rules: [
              {required: true, message: '?????????RTP??????'}
            ],
            initialValue: configuration.rtpPort,
          })(<InputNumber style={{width: '100%'}} placeholder='?????????RTP??????'/>)}
        </Col>;
      case undefined :
        return <Col span={3}>
          {getFieldDecorator('configuration.rtpPort', {
            rules: [
              {required: true, message: '?????????RTP??????'}
            ],
            initialValue: configuration.rtpPort,
          })(<InputNumber style={{width: '100%'}} placeholder='?????????RTP??????'/>)}
        </Col>;
      default:
        return null;
    }
  };

  const renderConfig = () => {
    const configuration = item.configuration ?
      (typeof item.configuration === "string" ? JSON.parse(item.configuration) : item.configuration)
      : {
        playerConfig: [
          {format: 'flv', enabled: false}, {
            format: 'mp4',
            enabled: false
          }, {
            format: 'hls',
            enabled: false
          }, {format: 'rtc', enabled: false}]
      };
    switch (providerType) {
      case 'srs-media':
        return (
          <div>
            <Row>
              <Col span={12}>
                <Form.Item label="?????? Host" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.publicHost', {
                    rules: [
                      {required: true, message: '??????????????? Host'}
                    ],
                    initialValue: configuration.publicHost,
                  })(<Input placeholder='??????????????? Host'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="API Host" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.apiHost', {
                    rules: [
                      {required: true, message: '?????????API Host'}
                    ],
                    initialValue: configuration.apiHost,
                  })(<Input placeholder='?????????API Host'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="API??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.apiPort', {
                    rules: [
                      {required: true, message: '?????????API??????'}
                    ],
                    initialValue: configuration.apiPort,
                  })(<InputNumber style={{width: '100%'}} placeholder='?????????API??????'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="RTP??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.rtpPort', {
                    rules: [
                      {required: true, message: '?????????RTP??????'}
                    ],
                    initialValue: configuration.rtpPort,
                  })(<InputNumber style={{width: '100%'}} placeholder='?????????RTP??????'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="HTTP??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.httpPort', {
                    rules: [
                      {required: true, message: '?????????HTTP??????'}
                    ],
                    initialValue: configuration.httpPort,
                  })(<InputNumber style={{width: '100%'}} placeholder='?????????HTTP??????'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="RTMP??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.rtmpPort', {
                    rules: [
                      {required: true, message: '?????????RTMP??????'}
                    ],
                    initialValue: configuration.rtmpPort,
                  })(<InputNumber style={{width: '100%'}} placeholder='?????????RTMP??????'/>)}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label="???????????????">
              {getFieldDecorator('configuration.formats', {
                rules: [
                  {required: true, message: '????????????????????????'}
                ],
                initialValue: configuration.formats,
              })(<Select placeholder="?????????????????????????????????" mode='multiple'>
                <Select.Option value='flv'>FLV</Select.Option>
                <Select.Option value='mp4'>MP4</Select.Option>
                <Select.Option value='hls'>HLS</Select.Option>
                <Select.Option value='ts'>TS</Select.Option>
                <Select.Option value='rtc'>RTC</Select.Option>
              </Select>)}
            </Form.Item>
            <Form.Item label="???ID??????">
              {getFieldDecorator('configuration.streamIdPrefix', {
                initialValue: configuration.streamIdPrefix,
              })(<Input/>)}
            </Form.Item>
          </div>
        );
      case 'zlmedia':
        return (
          <div>
            <Row>
              <Col span={12}>
                <Form.Item label={
                  <span> ?????? Host&nbsp;
                    <Tooltip title={'??????????????????????????????????????????????????????IP????????????????????????????????????h2????????????????????????????????????'}>
                      <Icon type="question-circle-o"/>
                    </Tooltip>
                  </span>
                } labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.publicHost', {
                    rules: [
                      {required: true, message: '??????????????? Host'}
                    ],
                    initialValue: configuration.publicHost,
                  })(<Input placeholder='??????????????? Host'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={
                  <span> API Host&nbsp;
                    <Tooltip title={'?????????????????????????????????????????????'}>
                      <Icon type="question-circle-o"/>
                    </Tooltip>
                  </span>
                } labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  <Col span={16}>
                    {getFieldDecorator('configuration.apiHost', {
                      rules: [
                        {required: true, message: '?????????API Host'}
                      ],
                      initialValue: configuration.apiHost,
                    })(<Input placeholder='?????????API Host'/>)}
                  </Col>
                  <Col span={8}>
                    {getFieldDecorator('configuration.apiPort', {
                      rules: [
                        {required: true, message: '?????????API??????'}
                      ],
                      initialValue: configuration.apiPort,
                    })(<InputNumber style={{width: '100%'}} placeholder='?????????API??????'/>)}
                  </Col>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.secret', {
                    initialValue: configuration.secret,
                  })(<Input.Password placeholder='???????????????'/>)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="???ID??????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
                  {getFieldDecorator('configuration.streamIdPrefix', {
                    initialValue: configuration.streamIdPrefix,
                  })(<Input/>)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Form.Item label={
                <span> RTP IP&nbsp;
                  <Tooltip title={'??????????????????????????????IP?????????????????????????????????IP????????????????????????IP??????'}>
                    <Icon type="question-circle-o"/>
                  </Tooltip>
                </span>
              } labelCol={{span: 5}} wrapperCol={{span: 19}}>
                <Col span={6} style={{paddingRight: 5}}>
                  {getFieldDecorator('configuration.rtpIp', {
                    rules: [
                      {required: true, message: '?????????RTP IP'}
                    ],
                    initialValue: configuration.apiHost,
                  })(<Input placeholder='?????????RTP IP'/>)}
                </Col>
                {dynamic()}
                <Col span={6} style={{paddingLeft: 10}}>
                  {getFieldDecorator('configuration.dynamicRtpPort', {
                    initialValue: configuration.dynamicRtpPort,
                    valuePropName: "checked"
                  })(
                    <Checkbox onChange={(data: any) => {
                      item.configuration.dynamicRtpPort = data.target.checked;
                      setItem({...item});
                    }}>????????????</Checkbox>
                  )}
                </Col>
              </Form.Item>
            </Row>
            <Row>
              <Form.Item label='???????????????'>
                <Card style={{padding: '5px 24px 5px 5px'}} bodyStyle={{padding: 0}}>
                  {
                    configuration.playerConfig?.map((val: any, index: number) => {
                      return (
                        <div key={index}>
                          <Row>
                            <Col span={1}>
                              <Form.Item style={{marginBottom: 5}}>
                                {getFieldDecorator(`configuration.playerConfig[${index}].enabled`, {
                                  initialValue: val.enabled || false,
                                  valuePropName: "checked"
                                })(
                                  <Checkbox onChange={(data: any) => {
                                    item.configuration.playerConfig[index].enabled = data.target.checked;
                                    setItem({...item})
                                  }}/>
                                )}
                              </Form.Item>
                            </Col>
                            <Col span={3}>
                              <Form.Item style={{marginBottom: 5}}>
                                {getFieldDecorator(`configuration.playerConfig[${index}].format`, {
                                  initialValue: val.format || undefined,
                                })(
                                  <Input placeholder="???????????????" readOnly style={{border: 'none'}}/>
                                )}
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item label="??????" labelCol={{span: 7}} wrapperCol={{span: 14}}
                                         style={{marginBottom: 5}}>
                                {getFieldDecorator(`configuration.playerConfig[${index}].port`, {
                                  initialValue: val.port || undefined,
                                })(
                                  <InputNumber style={{width: '100%'}} placeholder="???????????????"
                                               disabled={!configuration.playerConfig[index].enabled}/>
                                )}
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <Form.Item style={{marginBottom: 5}}>
                                {getFieldDecorator(`configuration.playerConfig[${index}].tls`, {
                                  initialValue: val.tls || false,
                                  valuePropName: "checked"
                                })(
                                  <Checkbox disabled={!configuration.playerConfig[index].enabled}>??????TLS</Checkbox>
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                        </div>
                      )
                    })
                  }
                </Card>
              </Form.Item>
            </Row>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Spin spinning={loading}>
      <Form labelCol={{span: 5}} wrapperCol={{span: 19}} style={{paddingRight: 20}}>
        <Row>
          <Col span={12}>
            <Form.Item key="name" label="???????????????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
              {getFieldDecorator('name', {
                rules: [
                  {required: true, message: '????????????????????????'},
                  {max: 200, message: '????????????????????????200?????????'}
                ],
                initialValue: item?.name,
              })(<Input placeholder="????????????????????????"/>)}
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item key="provider" label="?????????" labelCol={{span: 10}} wrapperCol={{span: 14}}>
              {getFieldDecorator('provider', {
                rules: [{required: true, message: '??????????????????'}],
                initialValue: item?.provider,
              })(
                <Select placeholder="?????????" onChange={(e: string) => {
                  setProviderType(e)
                }}>
                  {(providersList || []).map(item => (
                    <Select.Option
                      key={JSON.stringify({providerId: item.id, providerName: item.name})}
                      value={item.id}
                    >
                      {`${item.name}(${item.id})`}
                    </Select.Option>
                  ))}
                </Select>,
              )}
            </Form.Item>
          </Col>
        </Row>
        {renderConfig()}
      </Form>
      <div
        style={{
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid #e9e9e9',
          padding: '16px',
          background: '#fff',
          textAlign: 'right',
        }}
      >
        <Button
          onClick={() => {
            setLoading(true);
            saveData();
          }}
          type="primary"
        >
          ??????
        </Button>
      </div>
    </Spin>
  )
};

export default Form.create<Props>()(Save);
