import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Dropdown,
  Icon,
  List,
  Menu,
  message,
  Modal,
  Tooltip,
  Upload,
} from 'antd';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import api from '@/services';
import styles from './index.less';
import { getAccessToken } from '@/utils/authority';
import {
  EditOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SwitcherOutlined,
} from '@ant-design/icons';
import productImg from '@/pages/data-screen/visConfiguration/img/1-4.png';
import Save from './save';
import Edit from './edit';
import Copy from './copy';
import AutoHide from '@/pages/analysis/components/Hide/autoHide';
import encodeQueryParam from '@/utils/encodeParam';
import SearchForm from '@/components/SearchForm';
import { downloadObject } from '@/utils/utils';
import { CategoryItem } from '@/pages/data-screen/category/data';
import { PaginationConfig } from 'antd/lib/pagination';
import { SorterResult } from 'antd/lib/table';

const { confirm } = Modal;

interface Props {
  location: Location;
}

export const TenantContext = React.createContext({});

const Screen = (props: Props) => {
  // const [categoryList, setCategoryList] = useState([]);
  const [dataList, setDataList] = useState({
    data: [],
    pageIndex: 0,
    total: 0,
    pageSize: 0,
  });
  const [id, setId] = useState('');
  const [url, setUrl] = useState('');
  const [saveVisible, setSaveVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);
  const [param, setParam] = useState({});
  const [searchParam, setSearchParam] = useState({
    pageSize: 8,
    pageIndex: 0,
    terms: { type: 'vis_configuration' },
  });
  const token = getAccessToken();

  const handleSearch = (params: any) => {
    setSearchParam(params);
    api.screen.query(encodeQueryParam(params)).then(res => {
      if (res.status === 200) {
        setDataList(res.result);
      }
    });
  };

  let delConfirm = (id: string) => {
    confirm({
      title: '????????????',
      icon: <ExclamationCircleOutlined />,
      content: '????????????????????????',
      onOk() {
        api.screen.remove(id).then(res => {
          if (res.status === 200) {
            handleSearch(searchParam);
          }
        });
      },
      onCancel() {
        message.info('?????????');
      },
    });
  };
  let updateState = (state: string, id: string) => {
    confirm({
      title: `${state === 'enabled' ? '??????' : '??????'}??????`,
      icon: <ExclamationCircleOutlined />,
      content: `??????${state === 'enabled' ? '??????' : '??????'}?????????`,
      onOk() {
        api.screen
          .update(id, {
            state: {
              value: state === 'enabled' ? 'disabled' : 'enabled',
            },
          })
          .then(res => {
            if (res.status === 200) {
              handleSearch(searchParam);
            }
          });
      },
      onCancel() {
        message.info('?????????');
      },
    });
  };
  const uploadProps = (item: any) => {
    api.screen.save(item).then(res => {
      if (res.status === 200) {
        message.success('????????????');
        handleSearch(searchParam);
      }
    });
  };

  const onListChange = (page: number, pageSize: number) => {
    console.log(page, pageSize, 'jahaha');
    handleSearch({
      pageIndex: page - 1,
      pageSize,
      terms: searchParam.terms,
    });
  };
  let getView = (view: any) => {
    let children = [];
    if (view.children && view.children.length > 0) {
      children = view.children.map((i: any) => {
        return getView(i);
      });
      return {
        id: view.id,
        children: children,
        pId: view.parentId,
        value: view.id,
        title: view.name,
      };
    } else {
      return {
        id: view.id,
        pId: view.parentId,
        value: view.id,
        title: view.name,
      };
    }
  };
  useEffect(() => {
    //????????????url
    api.screen.getUrl().then(res => {
      if (res.status === 200) {
        if (
          res.result.urls['vis-configuration'] !== '' &&
          res.result.urls['vis-configuration'] !== undefined
        ) {
          setUrl(res.result.urls['vis-configuration']);
        } else {
          message.error('????????????,??????????????????');
          // setUrl('http://localhost:8000/')
        }
      }
    });

    // api.categoty.queryNoPaging({}).then(res => {
    //   if (res.status === 200) {
    //     setCategoryList(res.result);
    //   }
    // });

    handleSearch(searchParam);
  }, []);

  // const findCategory = (id:string)=>{

  //   const category: Partial<CategoryItem> =
  //     categoryList.find((i:any) => i.id === id) || {};

  //   return category.name;
  // };

  return (
    <PageHeaderWrapper title="????????????">
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div>
            <SearchForm
              search={(params: any) => {
                handleSearch({
                  terms: { ...params, type: 'vis_configuration' },
                  pageSize: 8,
                });
              }}
              formItems={[
                {
                  label: '????????????',
                  key: 'name$LIKE',
                  type: 'string',
                },
                // {
                //   label: '????????????',
                //   key: 'classifiedId$LIKE',
                //   type: 'list',
                //   props: {
                //     data: categoryList,
                //     mode: 'default'
                //   }
                // }
              ]}
            />
          </div>

          <div className={styles.tableListOperator}>
            <Button icon="plus" type="primary" onClick={() => setSaveVisible(true)}>
              ????????????
            </Button>
            <Divider type="vertical" />
            <Upload
              action="/jetlinks/file/static"
              headers={{
                'X-Access-Token': getAccessToken(),
              }}
              showUploadList={false}
              accept=".json"
              beforeUpload={file => {
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = result => {
                  try {
                    uploadProps(JSON.parse(result.target.result));
                  } catch (error) {
                    message.error('??????????????????');
                  }
                };
              }}
            >
              <Button>
                <Icon type="upload" />
                ????????????
              </Button>
            </Upload>
          </div>
        </div>
      </Card>
      <div style={{ marginBottom: '30px' }}>
        <div className={styles.cardList}>
          <List<any>
            rowKey="id"
            grid={{ gutter: 24, xl: 4, lg: 3, md: 2, sm: 2, xs: 1 }}
            dataSource={dataList.data || []}
            pagination={{
              current: dataList.pageIndex + 1,
              total: dataList.total,
              pageSize: dataList.pageSize,
              onChange: (page, pageSize) => {
                onListChange(page, pageSize || 8);
              },
              onShowSizeChange: (page, size) => {
                onListChange(page, size);
              },
              showQuickJumper: true,
              showSizeChanger: true,
              // hideOnSinglePage: true,
              pageSizeOptions: ['8', '16', '40', '80'],
              style: { marginTop: -20 },
              showTotal: (total: number) =>
                `??? ${total} ????????? ???  ${dataList.pageIndex + 1}/${Math.ceil(
                  dataList.total / dataList.pageSize,
                )}???`,
            }}
            renderItem={item => {
              if (item && item.id) {
                let metadata =
                  item.metadata != undefined && item.metadata != ''
                    ? JSON.parse(item.metadata)
                    : {};
                return (
                  <List.Item key={item.id}>
                    <Card
                      hoverable
                      bodyStyle={{ paddingBottom: 20 }}
                      onMouseEnter={() => setId(item.id)}
                      onMouseLeave={() => setId('')}
                      actions={[
                        <Tooltip placement="bottom" title="??????">
                          <EditOutlined
                            onClick={() => {
                              setEditVisible(true);
                              setParam({
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                catalogId: item.catalogId,
                                url: url,
                              });
                            }}
                          />
                        </Tooltip>,
                        <Tooltip placement="bottom" title="??????">
                          <EyeOutlined
                            onClick={() => {
                              url != ''
                                ? window.open(url + `#/?id=${id}&token=${token}`, '_blank')
                                : message.error('????????????,??????????????????');
                            }}
                          />
                        </Tooltip>,
                        <Tooltip placement="bottom" title="??????">
                          <SwitcherOutlined
                            onClick={() => {
                              setCopyVisible(true);
                              setParam({ url: url, metadata: item.metadata });
                            }}
                          />
                        </Tooltip>,
                        <Tooltip placement="bottom" title="??????">
                          <Icon
                            type="download"
                            onClick={() => {
                              downloadObject(item, '??????');
                            }}
                          />
                        </Tooltip>,
                        <Tooltip key="more_actions" title="">
                          <Dropdown
                            overlay={
                              <Menu>
                                <Menu.Item key="1">
                                  <Button
                                    onClick={() => {
                                      updateState(item.state.value, item.id);
                                    }}
                                    icon={item.state.value === 'enabled' ? 'close' : 'check'}
                                    type="link"
                                  >
                                    {item.state.value === 'enabled' ? '??????' : '??????'}
                                  </Button>
                                </Menu.Item>
                                {item.state.value === 'disabled' && (
                                  <Menu.Item key="2">
                                    <Button
                                      icon="delete"
                                      type="link"
                                      onClick={() => {
                                        delConfirm(item.id);
                                      }}
                                    >
                                      ??????
                                    </Button>
                                  </Menu.Item>
                                )}
                              </Menu>
                            }
                          >
                            <Icon type="ellipsis" />
                          </Dropdown>
                        </Tooltip>,
                      ]}
                    >
                      <Card.Meta
                        avatar={
                          <Avatar
                            size={60}
                            src={productImg}
                            // src={
                            //   metadata.visual != undefined &&
                            //   metadata.visual.backgroundUrl != undefined
                            //     ? metadata.visual.backgroundUrl
                            //     : false
                            // }
                          />
                        }
                        title={
                          <AutoHide title={item.name} style={{ width: '95%', fontWeight: 600 }} />
                        }
                        description={<AutoHide title={item.id} style={{ width: '95%' }} />}
                      />
                      <div className={styles.status}>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <p>
                            ??????: <span style={{ fontWeight: 600 }}>???{item.state.text}</span>
                          </p>
                        </div>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          {/* <p>??????: <span style={{fontWeight:600}}>{findCategory(item.catalogId)}</span></p> */}
                        </div>
                      </div>
                      <div
                        className={styles.edit}
                        style={{ display: item.id == id ? 'block' : 'none' }}
                      >
                        <div className={styles.editBtn}>
                          <a
                            onClick={() => {
                              url != ''
                                ? window.open(url + `#/?id=${id}&token=${token}`, '_blank')
                                : message.error('????????????,??????????????????');
                            }}
                          >
                            ??????
                          </a>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                );
              }
              return;
            }}
          />
        </div>
        {saveVisible && (
          <Save
            data={url}
            close={() => {
              setSaveVisible(false);
            }}
            save={() => {
              setSaveVisible(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {copyVisible && (
          <Copy
            data={param}
            close={() => {
              setCopyVisible(false);
            }}
            save={() => {
              setCopyVisible(false);
              handleSearch(searchParam);
            }}
          />
        )}
        {editVisible && (
          <Edit
            data={param}
            close={() => {
              setEditVisible(false);
            }}
            save={() => {
              setEditVisible(false);
              handleSearch(searchParam);
            }}
          />
        )}
      </div>
    </PageHeaderWrapper>
  );
};

export default Screen;
