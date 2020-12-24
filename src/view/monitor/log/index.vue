<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <template v-slot:toolbar_buttons>
          <vxe-button status="danger" @click="remove">删除</vxe-button>
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
        </template>
        <!--使用自定义模板-->
        <template v-slot:infoExpand="{ row }">
          <Row>
            <span class="table-expand">请求方法：</span>
            <span>{{row.classPath}}.{{row.actionMethod}}()</span>
          </Row>
          <Row>
            <span class="table-expand">请求参数：</span>
            <span>{{row.params}}</span>
          </Row>
        </template>
        <template v-slot:timeScope="{ row }">
          <Tag color="blue" v-if="row.consumingTime <= 300">{{ row.consumingTime }}ms</Tag>
          <Tag color="warning" v-else-if="row.consumingTime <= 1000" >{{ row.consumingTime }}ms</Tag>
          <Tag color="error" v-else >{{ row.consumingTime }}ms</Tag>
        </template>
      </vxe-grid>
    </Card>
    <Modal
      v-model="modelflag"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="500"
    >
      <Form ref="sysLogForm" :model="sysLog" :rules="ruleInline" :label-width="80">
        <FormItem prop="id" label>
          <Input placeholder="请输入" v-model="sysLog.id" />
        </FormItem>
        <FormItem prop="ip" label="操作IP">
          <Input placeholder="请输入" v-model="sysLog.ip" />
        </FormItem>
        <FormItem prop="location" label="操作地点">
          <Input placeholder="请输入" v-model="sysLog.location" />
        </FormItem>
        <FormItem prop="type" label="操作类型 1 操作记录 2异常记录">
          <Input placeholder="请输入" v-model="sysLog.type" />
        </FormItem>
        <FormItem prop="userName" label="操作人ID">
          <Input placeholder="请输入" v-model="sysLog.userName" />
        </FormItem>
        <FormItem prop="description" label="操作描述">
          <Input placeholder="请输入" v-model="sysLog.description" />
        </FormItem>
        <FormItem prop="actionMethod" label="请求方法">
          <Input placeholder="请输入" v-model="sysLog.actionMethod" />
        </FormItem>
        <FormItem prop="actionUrl" label="请求url">
          <Input placeholder="请输入" v-model="sysLog.actionUrl" />
        </FormItem>
        <FormItem prop="params" label="请求参数">
          <Input placeholder="请输入" v-model="sysLog.params" />
        </FormItem>
        <FormItem prop="os" label="操作系统">
          <Input placeholder="请输入" v-model="sysLog.os" />
        </FormItem>
        <FormItem prop="browser" label="浏览器">
          <Input placeholder="请输入" v-model="sysLog.browser" />
        </FormItem>
        <FormItem prop="classPath" label="类路径">
          <Input placeholder="请输入" v-model="sysLog.classPath" />
        </FormItem>
        <FormItem prop="requestMethod" label="请求方法">
          <Input placeholder="请输入" v-model="sysLog.requestMethod" />
        </FormItem>
        <FormItem prop="startTime" label="开始时间">
          <Input placeholder="请输入" v-model="sysLog.startTime" />
        </FormItem>
        <FormItem prop="finishTime" label="完成时间">
          <Input placeholder="请输入" v-model="sysLog.finishTime" />
        </FormItem>
        <FormItem prop="consumingTime" label="消耗时间">
          <Input placeholder="请输入" v-model="sysLog.consumingTime" />
        </FormItem>
        <FormItem prop="exDetail" label="异常详情信息 堆栈信息">
          <Input placeholder="请输入" v-model="sysLog.exDetail" />
        </FormItem>
        <FormItem prop="exDesc" label="异常描述 e.getMessage">
          <Input placeholder="请输入" v-model="sysLog.exDesc" />
        </FormItem>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysLogForm')">确定</Button>
            <Button @click="modelflag=false" style="margin-left: 8px">取消</Button>
          </FormItem>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script>
import {
  listForPage,
  save,
  update,
  remove,
  exportExcel
} from "@/api/monitor/syslog";
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
export default {
  name: "logging_index",
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
        id: "logging_index", // 唯一标识（被某些特定的功能所依赖）
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
              field: "userName",
              title: "用户名",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "ip",
              title: "IP",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "location",
              title: "操作地点",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
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
              return this.list(queryParams);
            }
          }
        },
        columns: [
          { type: "checkbox", width: 40 },
          { type: "expand", width: 40, slots: { content: "infoExpand" } },
          { type: "seq", title: "序号", width: 50 },
          { field: "userName", title: "用户名", sortable: true },
          { field: "ip", title: "IP", sortable: true },
          { field: "location", title: "操作地点", sortable: true },
          { field: "description", title: "操作描述", sortable: true },
          { field: "browser", title: "浏览器", sortable: true },
          {
            field: "consumingTime",
            title: "消耗时间",
            slots: { default: "timeScope" }
          },
          { field: "startTime", title: "创建时间", sortable: true }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      title: "",
      sysLog: {
        id: "",
        ip: "",
        location: "",
        type: "",
        userName: "",
        description: "",
        actionMethod: "",
        actionUrl: "",
        params: "",
        os: "",
        browser: "",
        classPath: "",
        requestMethod: "",
        startTime: "",
        finishTime: "",
        consumingTime: "",
        exDetail: "",
        exDesc: ""
      },
      modelflag: false,
      ruleInline: {
        id: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        ip: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        location: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        type: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        userName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        description: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        actionMethod: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        actionUrl: [
          {
            required: true,
            message: "此项必填",
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
        os: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        browser: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        classPath: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        requestMethod: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        startTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        finishTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        consumingTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        exDetail: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        exDesc: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ]
      }
    };
  },
  async created() {},
  methods: {
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
      this.$refs.sysLogForm.resetFields();
    },
    confirm() {
      this.$refs.sysLogForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysLog).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
              break;
            case "编辑":
              update(this.sysLog).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
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
      this.sysLog = JSON.parse(JSON.stringify(selectRecords[0]));
      this.sysLog.status = this.sysLog.status + "";
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
          });
        },
        closable: true
      });
    },
    exportExcel() {
      const proxyInfo = this.$refs.xGrid.getProxyInfo();
      let queryData = proxyInfo.form;
      exportExcel(queryData).then(res => {
        downloadFile(res.data, "操作日志表", "xlsx");
      });
    }
  },
  mounted() {}
};
</script>

<style>
.table-expand {
  color: #99a9bf;
  font-size: 15px;
}
</style>
