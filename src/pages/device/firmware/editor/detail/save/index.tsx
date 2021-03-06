import React, { useEffect, useState } from 'react';
import Form from 'antd/es/form';
import { FormComponentProps } from 'antd/lib/form';
import { Button, Card, Descriptions, Input, message, Modal, Result, Select, Spin, Steps } from 'antd';
import { UpgradeTaskData } from '../../../data';
import styles from './style.less';
import apis from '@/services';
import ChoiceDevice from '@/pages/device/firmware/editor/detail/upgrade/ChoiceDevice';
import { getWebsocket } from '@/layouts/GlobalWebSocket';
import encodeQueryParam from '@/utils/encodeParam';

interface Props extends FormComponentProps {
  close: Function;
  data: Partial<UpgradeTaskData>;
  productId?: string;
  firmwareId?: string;
}

interface State {
  currentStep: number;
  upgradeData: Partial<UpgradeTaskData>;
  releaseType: string;
  deviceId: any[];
  speedProgress: any;
}

const Save: React.FC<Props> = props => {

  const {
    form: { getFieldDecorator },
    form,
  } = props;

  const initState: State = {
    currentStep: 0,
    upgradeData: props.data,
    releaseType: '',
    deviceId: [],
    speedProgress: {
      waiting: 0,
      processing: 0,
    },
  };

  const [currentStep, setCurrentStep] = useState<number>(initState.currentStep);
  const [upgradeData, setUpgradeData] = useState(initState.upgradeData);
  const [releaseType, setReleaseType] = useState(initState.releaseType);
  const [deviceId, setDeviceId] = useState(initState.deviceId);
  const [speedProgress, setSpeedProgress] = useState(initState.speedProgress);
  const [progressConditions, setProgressConditions] = useState(false);
  const [resultSpinning, setResultSpinning] = useState(false);

  let taskByIdPush: any;

  const historyCount = () => {
    apis.firmware._count(
      encodeQueryParam({ terms: { taskId: upgradeData.id, state: 'waiting' } }),
    ).then((response: any) => {
      if (response.status === 200) {
        speedProgress.waiting = response.result;
        setSpeedProgress({ ...speedProgress });
        apis.firmware._count(
          encodeQueryParam({ terms: { taskId: upgradeData.id, state: 'processing' } }),
        ).then((response: any) => {
          if (response.status === 200) {
            speedProgress.processing = response.result;
            setSpeedProgress({ ...speedProgress });
            setProgressConditions(true);
            taskPush();
          } else {
            setResultSpinning(false);
          }
        }).catch(() => {
        });
      } else {
        setResultSpinning(false);
      }
    }).catch(() => {
    });
  };

  useEffect(() => {
    return () => {
      taskByIdPush && taskByIdPush.unsubscribe();
    };
  }, []);

  const submitData = () => {
    form.validateFields((err, fileValue) => {
      if (err) return;

      let params = {
        ...fileValue,
        id: props.data.id,
        productId: props.productId,
        firmwareId: props.firmwareId,
      };
      if (upgradeData.id) {
        apis.firmware.updateUpgrade(params)
          .then((response: any) => {
            if (response.status === 200) {
              message.success('????????????');
              if (props.data.id) {
                setCurrentStep(2);
              } else {
                setCurrentStep(Number(currentStep + 1));
              }
            }
          }).catch(() => {
        });
      } else {
        apis.firmware.saveUpgrade(params)
          .then((response: any) => {
            if (response.status === 200) {
              message.success('????????????');
              setUpgradeData(response.result);
              setCurrentStep(Number(currentStep + 1));
            }
          }).catch(() => {
        });
      }
    });
  };

  const taskRelease = () => {

    if (releaseType === '' || releaseType === null) {
      message.error('?????????????????????');
      return;
    }
    if (releaseType === 'all') {
      apis.firmware._deployAll(upgradeData.id)
        .then((response: any) => {
          if (response.status === 200) {
            message.success('??????????????????');
            setCurrentStep(Number(currentStep + 1));
          }
        }).catch(() => {
      });
    } else {
      apis.firmware._deploy(deviceId, upgradeData.id)
        .then((response: any) => {
          if (response.status === 200) {
            message.success('??????????????????');
            setCurrentStep(Number(currentStep + 1));
          }
        }).catch(() => {
      });
    }
  };

  const taskPush = () => {
    if (taskByIdPush) {
      taskByIdPush.unsubscribe();
    }
    setResultSpinning(false);
    taskByIdPush = getWebsocket(
      `firmware-push-upgrade-by-taskId`,
      `/device-firmware/publish`,
      {
        taskId: upgradeData.id,
      },
    ).subscribe((resp: any) => {
      const { payload } = resp;
      if (payload.success) {
        speedProgress.processing = (speedProgress.processing + 1);
        speedProgress.waiting = (speedProgress.waiting - 1);
        setSpeedProgress({ ...speedProgress });
      }
    });
  };

  const extra = (
    <>
      {upgradeData.mode?.value === 'push' && (
        <Button type="primary" onClick={() => {
          setResultSpinning(false);
          historyCount();
        }}>
          ????????????
        </Button>
      )}
    </>
  );

  const progressDisplay = (
    <div className={styles.information} style={{ textAlign: 'center' }}>
      <Descriptions column={1}>
        <Descriptions.Item label="????????????">{speedProgress.waiting}</Descriptions.Item>
        <Descriptions.Item label="?????????"> {speedProgress.processing}</Descriptions.Item>
      </Descriptions>
    </div>
  );

  return (
    <Modal
      title={`${props.data?.id ? '??????' : '??????'}????????????`}
      visible
      okText={currentStep === 2 ? '??????' : '?????????'}
      cancelText={currentStep === 0 ? '??????' : '?????????'}
      onOk={() => {
        if (currentStep === 2) {
          props.close();
        } else if (currentStep === 1) {
          taskRelease();
        } else {
          submitData();
        }
      }}
      /*cancelButtonProps={currentStep === 2 ? { disabled: true } : { disabled: false }}*/
      width='60%'
      onCancel={(event) => {
        if (event.target.tagName === 'BUTTON') {
          if (currentStep === 0) {
            props.close();
          } else {
            setCurrentStep(Number(currentStep - 1));
          }
        } else {
          props.close();
        }
      }}
    >
      <Steps current={currentStep} className={styles.steps}>
        <Steps.Step title="????????????"/>
        <Steps.Step title="????????????"/>
        <Steps.Step title="??????"/>
      </Steps>
      {currentStep === 0 && (
        <Form labelCol={{ span: 3 }} wrapperCol={{ span: 20 }} key="firmwareForm">
          <Form.Item key="name" label="????????????">
            {getFieldDecorator('name', {
              rules: [{ required: true, message: '??????????????????' }],
              initialValue: props.data.name,
            })(<Input placeholder="??????????????????"/>)}
          </Form.Item>
          <Form.Item key="timeoutSeconds" label="????????????">
            {getFieldDecorator('timeoutSeconds', {
              rules: [{ required: true, message: '??????????????????' }],
              initialValue: props.data.timeoutSeconds,
            })(<Input placeholder="??????????????????/???"/>)}
          </Form.Item>
          <Form.Item key="mode" label="????????????">
            {getFieldDecorator('mode', {
              rules: [{ required: true, message: '??????????????????' }],
              initialValue: props.data.mode?.value,
            })(<Select placeholder="??????????????????">
              <Select.Option value='push'>????????????</Select.Option>
              <Select.Option value='pull'>????????????</Select.Option>
            </Select>)}
          </Form.Item>
          <Form.Item label="??????">
            {getFieldDecorator('description', {
              initialValue: props.data.description,
            })(<Input.TextArea rows={4}/>)}
          </Form.Item>
        </Form>
      )}

      {currentStep === 1 && (
        <div>
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 20 }} key="releaseForm">
            <Form.Item key="releaseType" label="????????????">
              {getFieldDecorator('releaseType', {
                rules: [{ required: true, message: '??????????????????' }],
              })(<Select placeholder="??????????????????" onChange={(value: string) => {
                setReleaseType(value);
              }}>
                <Select.Option value='all'>????????????</Select.Option>
                <Select.Option value='part'>????????????</Select.Option>
              </Select>)}
            </Form.Item>
          </Form>
          {releaseType === 'part' && (
            <Form.Item wrapperCol={{ span: 20 }} labelCol={{ span: 3 }} label='????????????'>
              <Card style={{ maxHeight: 500, overflowY: 'auto', overflowX: 'hidden' }}>
                <ChoiceDevice productId={props.productId} save={(item: any[]) => {
                  setDeviceId(item);
                }}/>
              </Card>
            </Form.Item>
          )}
        </div>
      )}
      {currentStep === 2 && (
        <Spin spinning={resultSpinning} tip="?????????...">
          <Result status="success" title="????????????" extra={extra} className={styles.result}>
            {progressConditions && (progressDisplay)}
          </Result>
        </Spin>
      )}
    </Modal>
  );
};

export default Form.create<Props>()(Save);
