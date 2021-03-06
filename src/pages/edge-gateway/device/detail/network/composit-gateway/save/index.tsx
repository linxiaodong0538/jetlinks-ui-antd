import encodeQueryParam from "@/utils/encodeParam";
import { Button, Card, Col, Divider, Form, Icon, Input, Modal, Row, Select, Tooltip } from "antd";
import { FormComponentProps } from "antd/es/form";
import React, { Fragment, useEffect, useState } from "react";
import Service from '../../service';
import { randomString } from '@/utils/utils';
import Add from './addNetwork';

interface Props extends FormComponentProps {
    data: any;
    deviceId: string;
    close: Function;
    save: Function;
}

const Save: React.FC<Props> = props => {
    const service = new Service('device-network');
    const {
        form: { getFieldDecorator },
        form,
        data
    } = props;

    const [addVisible, setAddVisible] = useState(false);
    const [productList, setProductList] = useState<any[]>([]);
    const [product, setProduct] = useState<any>({});
    const [network, setNetwork] = useState<any>({});
    const [protocol, setProtocol] = useState<any>({});
    const [gateTypeList, setGatetypeList] = useState<any[]>([]);
    const [dataType, setDataType] = useState('');
    // const [supportList, setSupportList] = useState([]);
    const [protocolList, setProtocolList] = useState([]);
    const [networkConfigList, setNetworkConfigList] = useState<any[]>([]);
    const [routesData, setRoutesData] = useState<{ id: string, url: string, protocol: string }[]>([{
        id: '1001',
        url: '',
        protocol: ''
    }]);

    const getProductList = (value: string) => {
        service.getProductList(encodeQueryParam({
            terms: {
                messageProtocol: value
            }
        })).subscribe(
            (res) => {
                setProductList([...res]);
            },
            () => {
            },
            () => { })
    }
    const getGatetypeList = (transportProtocol: string) => {
        service.getGatewaytypeList(props.deviceId, transportProtocol).subscribe(
            (res) => {
                setGatetypeList([...res]);
            }
        )
    }
    const getNetworkConfigList = (id: string) => {
        service.getNetworkConfigList(props.deviceId, { where: `type=${id}` }).subscribe(
            (res) => {
                setNetworkConfigList([...res]);
                if (data.id) {
                    let type: any = [...res].filter(item => item.id === data.networkId);
                    setNetwork(type[0])
                }
            },
            () => {
            },
            () => { })
    }

    const getProcotolInfo = (id: string) => {
        service.getProtocolInfo(id).subscribe(
            (res) => {
                if (res) {
                    setProtocol(res);
                } else {
                    setProtocol(undefined);
                }
            }
        )
    }
    // const getSupportList = () => {
    //     service.getSupportList().subscribe(
    //         (res) => {
    //             setSupportList(res);
    //         }
    //     )
    // }

    const getProtocolList = () => {
        service.getProtocolList(props.deviceId, { paging: false }).subscribe(
            (res) => {
                setProtocolList(res);
            }
        )
    }
    //????????????
    const syncPlatform = () => {
        service.getPlatformProtocolList().subscribe(
            (res) => {
                if (res.status === 200) {
                    let data = res.result || [];
                    if (data.length > 0) {
                        service.addProtocol(props.deviceId, { entities: data }).subscribe(
                            (resp) => {
                                if (resp.status === 200) {
                                    getProtocolList();
                                }
                            }
                        )
                    }
                }
            }
        )
    }

    useEffect(() => {
        if (data.id) {
            service.getProductList({}).subscribe(
                (res) => {
                    setProductList([...res]);
                    let pro: any = [...res].filter(item => item.id === data.productId);
                    setProduct(pro[0]);
                    getProcotolInfo(pro[0].messageProtocol);
                    service.getGatewaytypeList(props.deviceId, pro[0].transportProtocol).subscribe(
                        (response) => {
                            setGatetypeList([...response]);
                            let type: any = [...response].filter(item => item.id === data.gatewayProvider);
                            getNetworkConfigList(type[0].networkType?.value);
                            setDataType(type[0].networkType?.value);
                        }
                    )
                })
        }else{
            getProtocolList();
        }
    }, []);

    const renderForm = () => {
        switch (dataType) {
            case 'MQTT_CLIENT':
                return (
                    <div>
                        <Form.Item label="????????????">
                            {getFieldDecorator('configuration.protocol', {
                                initialValue: data.configuration?.protocol,
                            })(
                                <Select>
                                    {protocolList.map((item: any) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}
                        </Form.Item>

                        <Form.Item label="Topics">
                            {getFieldDecorator('configuration.topics', {
                                initialValue: data.configuration?.topics,
                            })(<Input.TextArea rows={3} placeholder="???MQTT????????????Topic.????????????,??????" />)}
                        </Form.Item>
                    </div>
                );
            case 'UDP':
            case 'COAP_SERVER':
            case 'TCP_SERVER':
                return (
                    <div>
                        <Form.Item label="????????????">
                            {getFieldDecorator('configuration.protocol', {
                                initialValue: data.configuration?.protocol,
                            })(
                                <Select>
                                    {protocolList.map((item: any) => (
                                        <Select.Option key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}
                        </Form.Item>
                    </div>
                );
            case 'WEB_SOCKET_SERVER':
            case 'HTTP_SERVER':
                return (
                    <Fragment>
                        <Form.Item label="????????????">
                            <Card>
                                {(routesData.length > 0 ? routesData : [{ id: '1001', url: '', protocol: '' }]).map((i, index) => {
                                    return (
                                        <Row key={i.id} style={{ marginBottom: 5 }}>
                                            <Col span={9}>
                                                <Input
                                                    value={i.url}
                                                    onChange={e => {
                                                        routesData[index].url = e.target.value;
                                                        setRoutesData([...routesData]);
                                                    }}
                                                    placeholder="/**"
                                                />
                                            </Col>
                                            <Col span={2} style={{ textAlign: 'center' }}>
                                                <Icon type="right" />
                                            </Col>
                                            <Col span={9}>
                                                <Select
                                                    value={routesData[index]?.protocol}
                                                    onChange={(e: string) => {
                                                        routesData[index].protocol = e;
                                                        setRoutesData([...routesData]);
                                                    }}
                                                >
                                                    {protocolList.map((item: any) => (
                                                        <Select.Option key={item.id} value={item.id}>
                                                            {item.name}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Col>

                                            <Col span={4} style={{ textAlign: 'center' }}>
                                                {index === 0 ? (
                                                    <>
                                                        <Icon
                                                            type="minus"
                                                            onClick={() => {
                                                                const tempData = routesData.filter(temp => temp.id !== i.id);
                                                                setRoutesData([...tempData]);
                                                            }}
                                                        />
                                                        <Divider type="vertical" />
                                                        <Icon
                                                            type="plus"
                                                            onClick={() => {
                                                                routesData.push({
                                                                    id: randomString(8),
                                                                    url: '',
                                                                    protocol: '',
                                                                });
                                                                setRoutesData([...routesData]);
                                                            }}
                                                        />
                                                    </>
                                                ) : (
                                                    <Icon
                                                        type="minus"
                                                        onClick={() => {
                                                            const tempData = routesData.filter(temp => temp.id !== i.id);
                                                            setRoutesData([...tempData]);
                                                        }}
                                                    />
                                                )}
                                            </Col>
                                        </Row>
                                    )
                                })}
                            </Card>
                        </Form.Item>
                    </Fragment>
                );
            case 'MQTT_SERVER':
                return (
                    <div>
                        <Form.Item label={
                            <span>
                                ????????????
                    <Tooltip title='???????????????????????????MQTT??????'>
                                    <Icon type="question-circle-o" style={{ paddingLeft: 5 }} />
                                </Tooltip>
                            </span>
                        }>
                            {getFieldDecorator('configuration.protocol', {
                                initialValue: data.configuration?.protocol,
                            })(
                                <Select placeholder="??????clientId???????????????????????????????????????" allowClear>
                                    {protocolList.map((item: any) => (
                                        <Select.Option
                                            key={item.id} value={item.id}>
                                            {item.name}
                                        </Select.Option>
                                    ))}
                                </Select>,
                            )}
                        </Form.Item>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Modal
            title={data.id ? '??????????????????' : '??????????????????'}
            visible
            width={800}
            onCancel={() => { props.close() }}
            onOk={() => {
                form.validateFields((err, fileValue) => {
                    if (err) return;
                    let params = {
                        id: fileValue.id,
                        name: fileValue.name,
                        product: product,
                        network: network,
                        protocol: protocol,
                        gatewayProvider: fileValue.gatewayProvider,
                        configuration: fileValue.configuration,
                        description: fileValue.description,
                    }
                    props.save(params);
                });
            }}
        >
            <Form
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
            >
                <Form.Item label="ID">
                    {getFieldDecorator('id', {
                        rules: [{ required: true }],
                        initialValue: data.id
                    })(
                        <Input readOnly={!!data.id} />
                    )}
                </Form.Item>
                <Form.Item label="??????">
                    {getFieldDecorator('name', {
                        rules: [{ required: true }],
                        initialValue: data.name
                    })(
                        <Input />
                    )}
                </Form.Item>
                {!!!data.id && <Form.Item label="??????">
                    {getFieldDecorator('procotol', {
                        rules: [{ required: true }],
                        initialValue: data.name
                    })(
                        <Row gutter={24}>
                            <Col span={18}>
                                <Select onChange={(value: string) => {
                                    getProductList(value);
                                    form.setFieldsValue({'procotol': value});
                                }} allowClear>
                                    {
                                        protocolList.map((item: any, index: number) => (
                                            <Select.Option key={index} value={item.id}>{item.name}</Select.Option>
                                        ))
                                    }
                                </Select>
                            </Col>
                            <Col span={6}>
                                <Button icon="sync" onClick={() => {
                                    syncPlatform()
                                }}>????????????</Button>
                            </Col>
                        </Row>
                    )}
                </Form.Item>}
                <Form.Item label="??????">
                    {getFieldDecorator('productId', {
                        rules: [{ required: true }],
                        initialValue: data.productId
                    })(
                        <Select allowClear onChange={(value: string) => {
                            if(value !== ''){
                                let pro: any = productList.filter(item => item.id === value);
                                setProduct(pro[0]);
                                getGatetypeList(pro[0].transportProtocol);
                                getProcotolInfo(pro[0].messageProtocol);
                            }
                        }} disabled={!!data.id}>
                            {
                                productList.map((item, index) => (
                                    <Select.Option key={index} value={item.id}>{item.name}</Select.Option>
                                ))
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label="????????????">
                    {getFieldDecorator('gatewayProvider', {
                        rules: [{ required: true }],
                        initialValue: data.gatewayProvider
                    })(
                        <Select onChange={(value: string) => {
                            let pro: any = gateTypeList.filter(item => item.id === value);
                            setDataType(pro[0].networkType?.value);
                            getNetworkConfigList(pro[0].networkType?.value);
                        }}
                        >
                            {
                                gateTypeList.map((item, index) => (
                                    <Select.Option key={index} value={item.id}>{item.name}</Select.Option>
                                ))
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label="????????????">
                    {getFieldDecorator('networkId', {
                        rules: [{ required: true }],
                        initialValue: data.networkId
                    })(
                        <Select onChange={(value: string) => {
                            let pro: any = networkConfigList.filter(item => item.id === value);
                            setNetwork(pro[0]);
                        }}>
                            {
                                networkConfigList.map((item, index) => (
                                    <Select.Option key={index} value={item.id}>{`${item.name}/(${item.configuration?.host}:${item.configuration?.port})`}</Select.Option>
                                ))
                            }
                        </Select>
                    )}
                </Form.Item>
                {dataType !== '' && (
                    <div style={{ margin: '0px 125px 18px' }}>
                        <Button
                            type="dashed"
                            onClick={() => {
                                setAddVisible(true);
                            }}
                        >
                            <Icon type="plus" />??????????????????
                    </Button>
                    </div>
                )}
                {renderForm()}
                <Form.Item key="description" label="??????">
                    {getFieldDecorator('description', {
                    })(<Input.TextArea rows={4} placeholder="?????????" />)}
                </Form.Item>
            </Form>
            {addVisible && (
                <Add save={(data: any) => {
                    setNetwork(data);
                    form.setFieldsValue({ networkId: data.name });
                    setAddVisible(false);
                }} close={() => {
                    setAddVisible(false);
                }} data={dataType} />
            )}
        </Modal>
    )
}
export default Form.create<Props>()(Save);