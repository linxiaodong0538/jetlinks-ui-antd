import React, {Fragment, useEffect, useState} from 'react';
import {ColumnProps, PaginationConfig, SorterResult} from 'antd/es/table';
import {Button, Card, Divider, message, Popconfirm, Table} from 'antd';
import {PageHeaderWrapper} from '@ant-design/pro-layout';
import styles from '@/utils/table.less';
import {connect} from 'dva';
import {ConnectState, Dispatch} from '@/models/connect';
import encodeQueryParam from '@/utils/encodeParam';
import apis from '@/services';
import SearchForm from '@/components/SearchForm';
import {RuleInstanceItem} from './data.d';
import Save from './save';
import moment from "moment";

interface Props {
  ruleInstance: any;
  dispatch: Dispatch;
  location: Location;
  loading: boolean;
}

interface State {
  data: any;
  searchParam: any;
  saveVisible: boolean;
  current: Partial<RuleInstanceItem>;
}

const RuleInstanceList: React.FC<Props> = props => {
  const {dispatch} = props;

  const {result} = props.ruleInstance;

  const initState: State = {
    data: result,
    searchParam: {
      pageSize: 10, sorts: {
        order: "descend",
        field: "createTime"
      }
    },
    saveVisible: false,
    current: {},
  };

  const [searchParam, setSearchParam] = useState(initState.searchParam);
  const [saveVisible, setSaveVisible] = useState(initState.saveVisible);
  const [current, setCurrent] = useState(initState.current);

  const createModel = (record: any) => {
    apis.ruleInstance
      .createModel(record)
      .then(response => {
        if (response.status === 200) {
          message.success('εε»Ίζε');
        }
      })
      .catch(() => {
      });
  };

  const handleSearch = (params?: any) => {
    setSearchParam(params);
    dispatch({
      type: 'ruleInstance/query',
      payload: encodeQueryParam(params),
    });
  };

  useEffect(() => {
    handleSearch(searchParam);
  }, []);

  const startInstance = (record: any) => {
    apis.ruleInstance
      .start(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('ζδ½ζε');
          handleSearch(searchParam);
        }
      })
      .catch(() => {
      });
  };

  const stopInstance = (record: any) => {
    apis.ruleInstance
      .stop(record.id)
      .then(response => {
        if (response.status === 200) {
          message.success('ζδ½ζε');
          handleSearch(searchParam);
        }
      })
      .catch(() => {
      });
  };
  // const saveOrUpdate = (item: RuleInstanceItem) => {
  //     dispatch({
  //         type: 'ruleInstance/insert',
  //         payload: encodeQueryParam(item),
  //         callback: () => {
  //             setSaveVisible(false);
  //             handleSearch(searchParam);
  //         }
  //     })
  // }
  const handleDelete = (params: any) => {
    dispatch({
      type: 'ruleInstance/remove',
      payload: params.id,
      callback: () => {
        message.success('ε ι€ζε');
        handleSearch(searchParam);
      },
    });
  };

  const onTableChange = (
    pagination: PaginationConfig,
    filters: any,
    sorter: SorterResult<RuleInstanceItem>,
  ) => {
    handleSearch({
      pageIndex: Number(pagination.current) - 1,
      pageSize: pagination.pageSize,
      terms: searchParam,
      sorts: sorter,
    });
  };

  const columns: ColumnProps<RuleInstanceItem>[] = [
    {
      title: 'id',
      dataIndex: 'id',
    },

    {
      title: 'εη§°',
      dataIndex: 'name',
    },
    {
      title: 'ζ¨‘εηζ¬',
      dataIndex: 'modelVersion',
    },
    {
      title: 'εε»ΊζΆι΄',
      dataIndex: 'createTime',
      render: (text: any) => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '/',
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: 'θ―΄ζ',
      dataIndex: 'description',
      ellipsis: true
    },

    {
      title: 'ηΆζ',
      dataIndex: 'state',
      render: text => text.text,
    },
    {
      title: 'ζδ½',
      width: '20%',
      render: (text, record) => (
        <Fragment>

          {
            record.modelType === 'node-red' ?
              <>
                <a
                  onClick={() => {
                    window.open(`/jetlinks/rule-editor/index.html#flow/${record.id}`)
                  }}
                >
                  θ―¦ζ
                </a>< Divider type="vertical"/>
              </> : <></>
          }


          <Popconfirm title="η‘?θ?€ε ι€οΌ" onConfirm={() => handleDelete(record)}>
            <a>ε ι€</a>
          </Popconfirm>
          <Divider type="vertical"/>
          {
            record.state?.value === 'stopped' && (
              <Popconfirm title="η‘?θ?€ε―ε¨οΌ" onConfirm={() => startInstance(record)}>
                <a>ε―ε¨</a>
              </Popconfirm>
            )
          }
          {
            record.state?.value === 'started' && (
              <Popconfirm title="η‘?θ?€ε―ε¨οΌ" onConfirm={() => stopInstance(record)}>
                <a>εζ­’</a>
              </Popconfirm>
            )
          }
          {/* <Divider type="vertical" />
          <Popconfirm title="η‘?θ?€ηζζ¨‘εοΌ" onConfirm={() => createModel(record)}>
            <a>ηζζ¨‘ε</a>
          </Popconfirm> */}
        </Fragment>
      ),
    },
  ];

  return (
    <PageHeaderWrapper title="θ§εε?δΎ">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              formItems={[
                {
                  label: 'εη§°',
                  key: 'name$LIKE',
                  type: 'string',
                },
                {
                  label: 'ηΆζ',
                  key: 'state$IN',
                  type: 'list',
                  props: {
                    data: [
                      {id: 'stopped', name: 'ε·²εζ­’'},
                      {id: 'started', name: 'θΏθ‘δΈ­'},
                      {id: 'disable', name: 'ε·²η¦η¨'},
                    ]
                  }
                },
              ]}
              search={(params: any) => {
                setSearchParam(params);
                handleSearch({
                  terms: params, pageSize: 10, sorts: searchParam.sorts || {
                    order: "descend",
                    field: "createTime"
                  }
                });
              }}
            />
          </div>
          <div className={styles.tableListOperator}>
            <Button
              icon="plus"
              type="primary"
              onClick={() => {
                setSaveVisible(true)
              }}>
              εε»Ίθ§ε
            </Button>
          </div>
          <div className={styles.StandardTable}>
            <Table
              loading={props.loading}
              dataSource={result?.data}
              columns={columns}
              rowKey="id"
              onChange={onTableChange}
              pagination={{
                current: result.pageIndex + 1,
                total: result.total,
                pageSize: result.pageSize,
                showQuickJumper: true,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                showTotal: (total: number) =>
                  `ε± ${total} ζ‘θ?°ε½ η¬¬  ${result.pageIndex + 1}/${Math.ceil(
                    result.total / result.pageSize,
                  )}ι‘΅`,
              }}
            />
          </div>
        </div>
      </Card>
      {saveVisible && (
        <Save
          save={() => {
            // tod
          }}
          // data={current}
          close={() => {
            setSaveVisible(false);
            setCurrent({});
          }}
        />
      )}
    </PageHeaderWrapper>
  );
};
export default connect(({ruleInstance, loading}: ConnectState) => ({
  ruleInstance,
  loading: loading.models.ruleInstance,
}))(RuleInstanceList);
