<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
          <vxe-button status="success" @click="edit">编辑</vxe-button>
          <vxe-button status="danger" @click="remove">删除</vxe-button>
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
          <vxe-button status="info" @click="info">日志</vxe-button>
        </template>
        <template v-slot:operate="{ row }">
          <vxe-button type="text" status="primary" content="执行" @click="execute(row)"></vxe-button>
          <vxe-button type="text" status="primary" content="启用" @click="resume(row)"></vxe-button>
          <vxe-button type="text" status="primary" content="暂停" @click="pause(row)"></vxe-button>
        </template>
      </vxe-grid>
    </Card>
    <Modal
      v-model="modelflag"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="800"
    >
      <Form ref="sysQuartzJobForm" :model="sysQuartzJob" :rules="ruleInline" :label-width="80">
        <Row>
          <i-col span="12">
            <FormItem prop="jobName" label="任务名称">
              <Input placeholder="请输入" v-model="sysQuartzJob.jobName" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="description" label="任务描述">
              <Input placeholder="请输入" v-model="sysQuartzJob.description" />
            </FormItem>
          </i-col>
        </Row>

        <Row>
          <i-col span="12">
            <FormItem prop="beanName" label="Bean名称">
              <Input placeholder="请输入" v-model="sysQuartzJob.beanName" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="methodName" label="执行方法">
              <Input placeholder="请输入" v-model="sysQuartzJob.methodName" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem prop="cronExpression" label="cron表达式">
              <Input placeholder="请输入" v-model="sysQuartzJob.cronExpression" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem label="报警邮箱">
              <Input placeholder="多个邮箱用逗号隔开" v-model="sysQuartzJob.email" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem label="失败后暂停">
              <RadioGroup v-model="sysQuartzJob.pauseAfterFailure">
                <Radio label="1">
                  <span>是</span>
                </Radio>
                <Radio label="0">
                  <span>否</span>
                </Radio>
              </RadioGroup>
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem label="状态">
              <RadioGroup v-model="sysQuartzJob.isPause">
                <Radio label="1">
                  <span>暂停</span>
                </Radio>
                <Radio label="0">
                  <span>启用</span>
                </Radio>
              </RadioGroup>
            </FormItem>
          </i-col>
        </Row>
        <FormItem label="参数">
          <Input placeholder="请输入" type="textarea" :rows="4" v-model="sysQuartzJob.params" />
        </FormItem>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysQuartzJobForm')">确定</Button>
            <Button @click="modelflag=false" style="margin-left: 8px">取消</Button>
          </FormItem>
        </Row>
      </Form>
    </Modal>
    <!-- 日志窗口 -->
    <vxe-modal
      v-model="infoValue"
      id="myModal"
      width="1200"
      height="700"
      min-width="1200"
      min-height="700"
      show-zoom
      resize
      remember
      storage
      transfer
    >
      <template v-slot>
        <vxe-grid
          border
          resizable
          show-overflow
          auto-resize
          height="auto"
          :sync-resize="infoValue"
          :pager-config="infoPage"
          :proxy-config="infoProxy"
          :columns="infoColumn"
          :toolbar-config="infoToolbar"
        ></vxe-grid>
      </template>
    </vxe-modal>
  </div>
</template>

<script>
import {
  listForPage,
  save,
  update,
  remove,
  exportExcel,
  run,
  pause,
  resume,
  infoListForPage
} from "@/api/system/timing";
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
export default {
  name: "system_timing",
  components: {},
  data() {
    return {
      tableToolbar: {
        // 工具栏
        refresh: true,
        // export: true,
        custom: true,
        slots: {
          buttons: "toolbar_buttons"
        }
      },
      gridOptions: {
        // 表格配置
        border: true, // 是否带有边框
        resizable: true, // 所有的列是否允许拖动列宽调整大小
        showHeaderOverflow: true, // 设置表头所有内容过长时显示为省略号
        showOverflow: true, // 设置所有内容过长时显示为省略号（如果是固定列建议设置该值，提升渲染速度）
        highlightHoverRow: true, // 鼠标移到行是否要高亮显示
        keepSource: true, // 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等（开启后影响性能，具体取决于数据量）
        id: "system_timing", // 唯一标识（被某些特定的功能所依赖）
        height: document.documentElement.clientHeight - 150,
        rowId: "id", // 自定义行数据唯一主键的字段名（行数据必须要有唯一主键，默认自动生成）
        customConfig: {
          // 自定义列配置项
          storage: true, // 是否启用 localStorage 本地保存，会将列操作状态保留在本地（需要有 id）
          checkMethod: this.checkColumnMethod // 自定义列是否允许列选中的方法，该方法 Function({ column }) 的返回值用来决定这一列的 checkbox 是否可以选中
        },
        sortConfig: {
          // 排序配置项
          trigger: "cell" // default（点击按钮触发）, cell（点击表头触发）
        },
        pagerConfig: {
          pageSize: 10,
          pageSizes: [5, 20, 50, 100, 500, 1000]
        },
        formConfig: {
          titleWidth: 100,
          titleAlign: "right",
          items: [
            {
              field: "jobName",
              title: "任务名称",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            // {
            //   field: "methodName",
            //   title: "方法名称",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "params",
            //   title: "参数",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "description",
            //   title: "备注",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "personInCharge",
            //   title: "负责人",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "email",
            //   title: "报警邮箱",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "subTask",
            //   title: "子任务ID",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "pauseAfterFailure",
            //   title: "任务失败后是否暂停",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "createBy",
            //   title: "创建者",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "updateBy",
            //   title: "更新者",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "createTime",
            //   title: "创建日期",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            // {
            //   field: "updateTime",
            //   title: "更新时间",
            //   span: 8,
            //   itemRender: {
            //     name: "$input",
            //     props: { placeholder: "请输入" }
            //   }
            // },
            {
              span: 24,
              align: "center",
              collapseNode: true,
              itemRender: {
                name: "$buttons",
                children: [
                  {
                    props: {
                      type: "submit",
                      content: "查询",
                      status: "primary"
                    }
                  },
                  { props: { type: "reset", content: "重置" } }
                ]
              }
            }
          ]
        },
        proxyConfig: {
          seq: true, // 启用动态序号代理
          form: true, // 启用表单代理
          props: {
            result: "result",
            total: "page.total"
          },
          ajax: {
            // 接收 Promise 对象
            query: ({ page, form }) => {
              // // 处理排序条件
              const queryParams = Object.assign(
                {
                  pageSize: page.pageSize,
                  currentPage: page.currentPage
                },
                form
              );
              return this.list(queryParams); //XEAjax.get(`https://api.xuliangzhan.com:10443/api/pub/page/list/${page.pageSize}/${page.currentPage}`, queryParams)
            }
          }
        },
        columns: [
          { type: "checkbox", width: 40 },
          { type: "seq", title: "序号", width: 50 },
          // { field: "id", title: "任务ID", sortable: true },
          { field: "jobName", title: "任务名称", sortable: true },
          { field: "beanName", title: "Bean名称", sortable: true },
          { field: "methodName", title: "执行方法", sortable: true },
          { field: "params", title: "参数", sortable: true },
          { field: "cronExpression", title: "cron表达式", sortable: true },
          {
            field: "isPause",
            title: "状态",
            sortable: true,
            formatter: function({ cellValue }) {
              if (cellValue == 1) {
                return "暂停";
              } else {
                return "启用";
              }
            }
          },
          { field: "description", title: "描述", sortable: true },
          { field: "createTime", title: "创建时间", sortable: true },
          { title: "操作", width: 130, slots: { default: "operate" } }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      title: "",
      sysQuartzJob: {
        jobId: "",
        beanName: "",
        cronExpression: "",
        isPause: "1",
        jobName: "",
        methodName: "",
        params: "",
        description: "",
        personInCharge: "",
        email: "",
        subTask: "",
        pauseAfterFailure: "1",
        pid: ""
      },
      modelflag: false,
      ruleInline: {
        jobId: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        beanName: [
          {
            required: true,
            message: "请输入bean名称",
            trigger: "change"
          }
        ],
        cronExpression: [
          {
            required: true,
            message: "请输入cron表达式",
            trigger: "change"
          }
        ],
        isPause: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        jobName: [
          {
            required: true,
            message: "请输入任务名称",
            trigger: "change"
          }
        ],
        methodName: [
          {
            required: true,
            message: "请输入执行方法",
            trigger: "change"
          }
        ],
        params: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        description: [
          {
            required: true,
            message: "请输入任务描述",
            trigger: "change"
          }
        ],
        personInCharge: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        email: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        subTask: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        pauseAfterFailure: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        createBy: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        updateBy: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        createTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        updateTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ]
      },
      infoValue: false,
      infoPage: {
        pageSize: 10
      },
      infoToolbar: {
        refresh: true,
        custom: true
      },
      infoProxy: {
        props: {
          result: "result",
          total: "page.total"
        },
        ajax: {
          seq: true, // 启用动态序号代理
          form: true, // 启用表单代理
          // 接收 Promise 对象
          query: ({ page, form }) => {
            // // 处理排序条件
            const queryParams = Object.assign(
              {
                pageSize: page.pageSize,
                currentPage: page.currentPage
              },
              form
            );
            return this.infolist(queryParams);
          }
        }
      },
      infoColumn: [
        { type: "checkbox", width: 40 },
        { type: "seq", title: "序号", width: 50 },
        { field: "jobName", title: "任务名称", sortable: true },
        { field: "beanName", title: "Bean名称", sortable: true },
        { field: "methodName", title: "执行方法", sortable: true },
        { field: "params", title: "参数", sortable: true },
        { field: "cronExpression", title: "表达式", sortable: true },
        { field: "exceptionDetail", title: "异常信息", sortable: true },
        { field: "time", title: "耗时(毫秒)", sortable: true },
        { field: "isSuccess", title: "状态", sortable: true,
            formatter: function({ cellValue }) {
              if (cellValue == 1) {
                return "失败";
              } else {
                return "成功";
              }
            } },
        { field: "createTime", title: "创建时间", sortable: true ,width: 200}
      ]
    };
  },
  async created() {},
  methods: {
    infolist(queryParams) {
      return new Promise(resolve => {
          queryParams.pid = this.pid
          infoListForPage(queryParams).then(res => {
            resolve({
              result: res.data.data.list,
              page: { total: Number(res.data.data.total) }
            });
          });
        });
    },
    info() {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords();
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!"
        });
        return;
      } else if (selectRecords.length > 1) {
        Notice.warning({
          title: "消息通知",
          desc: "不允许选择多条数据!"
        });
        return;
      }
      this.infoValue = true;
      this.sysQuartzJob = JSON.parse(JSON.stringify(selectRecords[0]));
    },
    resume(row) {
      const params = { job: row.uid };
      resume(params).then(res => {
        Notice.success({
          title: "消息通知",
          desc: res.data.msg
        });
        // 重新加载表格
        this.$refs.xGrid.commitProxy("reload");
      }).catch((e) => {});
    },
    pause(row) {
      const params = { job: row.uid };
      pause(params).then(res => {
        Notice.success({
          title: "消息通知",
          desc: res.data.msg
        });
        // 重新加载表格
        this.$refs.xGrid.commitProxy("reload");
      }).catch((e) => {});
    },
    execute(row) {
      const params = { job: row.uid };
      run(params).then(res => {
        Notice.success({
          title: "消息通知",
          desc: res.data.msg
        });
        // 重新加载表格
        this.$refs.xGrid.commitProxy("reload");
      }).catch((e) => {});
    },
    list(queryParams) {
      return new Promise(resolve => {
        listForPage(queryParams).then(res => {
          resolve({
            result: res.data.data.list,
            page: { total: Number(res.data.data.total) }
          });
        });
      });
    },
    add() {
      this.title = "新增";
      this.modelflag = true;
      this.$refs.sysQuartzJobForm.resetFields();
    },
    confirm() {
      this.$refs.sysQuartzJobForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysQuartzJob).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              }).catch((e) => {});
              break;
            case "编辑":
              update(this.sysQuartzJob).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              }).catch((e) => {});
              break;
          }
        }
      });
    },
    edit(params) {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords();
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!"
        });
        return;
      } else if (selectRecords.length > 1) {
        Notice.warning({
          title: "消息通知",
          desc: "不允许选择多条数据!"
        });
        return;
      }
      this.modelflag = true;
      this.title = "编辑";
      this.sysQuartzJob = JSON.parse(JSON.stringify(selectRecords[0]));
      this.sysQuartzJob.pauseAfterFailure =
      this.sysQuartzJob.pauseAfterFailure + "";
      this.sysQuartzJob.isPause = this.sysQuartzJob.isPause + "";
    },
    remove(params) {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords(),
        ids = [];
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!"
        });
        return;
      }
      selectRecords.forEach((value, key, arr) => {
        ids[key] = value.id;
      });
      let _this = this;
      this.$Modal.confirm({
        title: "删除确认？",
        onOk: function() {
          remove(ids).then(res => {
            Notice.success({
              title: "消息通知",
              desc: res.data.msg
            });
            // 重新加载表格
            _this.$refs.xGrid.commitProxy("reload");
          }).catch((e) => {});
        },
        closable: true
      });
    },
    exportExcel() {
      const proxyInfo = this.$refs.xGrid.getProxyInfo();
      let queryData = proxyInfo.form;
      exportExcel(queryData).then(res => {
        downloadFile(res.data, "定时任务", "xlsx");
      });
    }
  },
  mounted() {}
};
</script>

<style>
</style>
