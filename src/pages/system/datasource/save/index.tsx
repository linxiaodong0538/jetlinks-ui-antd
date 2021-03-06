import SchemaForm, { createFormActions, FormEffectHooks, ISchema } from '@formily/antd';
import { message, Modal } from 'antd';
import React from 'react';
import { Select, Input, ArrayTable } from '@formily/antd-components';
import { useEffect } from 'react';
import { service } from '..';
import { useState } from 'react';
import { map, mergeMap, toArray } from 'rxjs/operators';
import { from } from 'rxjs';
import styles from '../index.less';

interface Props {
  close: () => void;
  data: any;
}

type Type = {
  label: string;
  value: string;
  id: string;
  name: string;
};

const actions = createFormActions();

const Save = (props: Props) => {
  const {  close, data } = props;

  const [types, setTypes] = useState<Type[]>([]);

  const queryType = () => {
    service
      .type()
      .pipe(
        mergeMap((data: Type[]) => from(data)),
        map((i: Type) => ({ label: i.name, value: i.id })),
        toArray(),
      )
      .subscribe((data: any) => {
        setTypes([...data])
      });
  };
  useEffect(() => {
    queryType();
  }, [data]);

  const { onFieldValueChange$ } = FormEffectHooks;

  const effects = () => {
    const { setFieldState } = actions;

    onFieldValueChange$('typeId').subscribe(({ value }) => {
      setFieldState(
        `*(shareConfig.adminUrl,shareConfig.addresses,shareConfig.virtualHost,shareConfig.username,shareConfig.password)`,
        state => {
          state.visible = value === 'rabbitmq';
          state.value = undefined;
        },
      );
      setFieldState(
        `*(shareConfig.url,shareConfig.username,shareConfig.password, button)`,
        state => {
          state.visible = value === 'rdb';
          state.value = undefined;
        },
      );
      setFieldState(`*(shareConfig.bootstrapServers)`, state => {
        state.visible = value === 'kafka';
        state.value = undefined;
      });
    });
  };

  const schema: ISchema = {
    type: 'object',
    properties: {
      NO_NAME_FIELD_$0: {
        type: 'object',
        'x-component': 'mega-layout',
        'x-component-props': {
          grid: true,
          autoRow: true,
          full: true,
          responsive: {
            lg: 4,
            m: 2,
            s: 1,
          },
        },
        properties: {
          name: {
            title: '??????',
            'x-component': 'Input',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            'x-rules': [{ required: true, message: '???????????????' }],
          },
          typeId: {
            title: '??????',
            'x-component': 'Select',
            'x-component-props': {
              disabled: !!data.typeId
            },
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            enum: types
          },
          'shareConfig.adminUrl': {
            title: '????????????',
            'x-mega-props': {
              span: 4,
              labelCol: 3,
            },
            required: true,
            default: 'http://localhost:15672',
            visible: false,
            'x-component': 'Input',
          },
          'shareConfig.addresses': {
            title: '????????????',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            required: true,
            default: 'localhost:5672',
            visible: false,
            'x-component': 'Input',
          },
          'shareConfig.virtualHost': {
            title: '?????????',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            required: true,
            visible: false,
            default: '/',
            'x-component': 'Input',
          },
          'shareConfig.url': {
            title: 'URL',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            visible: false,
            'x-rules': [
              {
                required: true,
                message: 'URL??????',
              },
            ],
            'x-component': 'Input',
            "x-component-props": {
              placeholder: '?????????r2dbc??????jdbc????????????'
            }
          },
          'shareConfig.username': {
            title: '?????????',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            visible: false,
            'x-rules': [
              {
                required: true,
                message: '???????????????',
              },
            ],
            'x-component': 'Input',
          },
          'shareConfig.password': {
            title: '??????',
            'x-mega-props': {
              span: 2,
              labelCol: 6,
            },
            visible: false,
            'x-rules': [
              {
                required: true,
                message: '????????????',
              },
            ],
            'x-component': 'Input',
          },
          'shareConfig.bootstrapServers': {
            title: '??????',
            'x-mega-props': {
              span: 4,
              labelCol: 3,
            },
            'x-rules': [
              {
                required: true,
                message: '????????????',
              },
            ],
            visible: false,
            'x-component': 'Select',
            'x-component-props': {
              mode: 'tags',
            },
          },
          description: {
            title: '??????',
            'x-mega-props': {
              span: 4,
              labelCol: 3,
            },
            'x-component': 'TextArea',
            'x-component-props': {
              rows: 4,
            },
          },
        },
      },
    },
  };

  const save = (data: any) => {
    service.saveOrUpdate(data).subscribe(() => {
      message.success('????????????');
      close();
    });
  };

  return (
    <Modal title="??????" onCancel={close} visible={true} width={1000} onOk={() => actions.submit()}>
      <SchemaForm
        initialValues={data}
        className={styles.save}
        onSubmit={save}
        actions={actions}
        effects={effects}
        schema={schema}
        components={{
          Input,
          Select,
          ArrayTable,
          TextArea: Input.TextArea
        }}
      />
    </Modal>
  );
};

export default Save;
