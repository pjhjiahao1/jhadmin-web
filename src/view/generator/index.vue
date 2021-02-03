<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <!-- <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
          <vxe-button status="success" @click="edit">编辑</vxe-button>
          <vxe-button status="danger" @click="remove">删除</vxe-button>
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
        </template> -->
        <template v-slot:operate="{ row }">
          <vxe-button status="primary" @click="download(row)">下载</vxe-button>
        </template>
      </vxe-grid>
    </Card>
    <Modal
        v-model="modelflag"
        title="属性配置"
        :mask-closable="false"
        :closable="true"
        footer-hide
        width="500">
        <Card>
            <p slot="title">填写规则</p>
            <p>模块：如用户管理在me.jiahao.modules.system,那么填写 modules.system</p>
            <p>vue-name属性: 用户管理属性：system_user，system模块拼接功能名称</p>
            <p>前端页面路径：用户管理：system/user/index，这也是放vue文件的路径</p>
            <p>前端JS路径：用户管理：api/system/user，这也是放js文件的路径</p>
        </Card>
        <Form ref="dataForm" :model="params" :rules="ruleInline" :label-width="80">
            <FormItem prop="moduleName" label="模块：" >
                <Input placeholder="请输入" v-model="params.moduleName"/>
            </FormItem>
            <FormItem prop="menuCode" label="vue-name属性：" >
                <Input placeholder="请输入" v-model="params.menuCode"/>
            </FormItem>
            <FormItem prop="vuePathName" label="前端页面路径：" >
                <Input placeholder="请输入" v-model="params.vuePathName"/>
            </FormItem>
            <FormItem prop="jsPathName" label="前端JS路径：" >
                <Input placeholder="请输入" v-model="params.jsPathName"/>
            </FormItem>
            <Row type="flex" justify="end" class="code-row-bg">
                <FormItem>
                    <Button type="primary"
                            @click="ok('dataForm')"
                            >确定</Button>
                    <Button @click="modelflag=false"
                            style="margin-left: 8px">取消</Button>
                </FormItem>
            </Row>
        </Form>
    </Modal>
  </div>
</template>

<script>
import { listForPage, build, exportFile } from "@/api/generator/generator";
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
export default {
  name: "generator_index",
  components: {},
  data() {
    return {
      tableToolbar: {
        // 工具栏
        refresh: true,
        // export: true,
        custom: true,
        // slots: {
        //   buttons: "toolbar_buttons"
        // }
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
              field: "tableName",
              title: "表名",
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
          { type: "seq", title: "序号", width: 50 },
          { field: "tableName", title: "表名", sortable: true },
          { field: "engine", title: "数据库引擎", sortable: true },
          { field: "tableCollation", title: "字符编码集", sortable: true },
          { field: "tableComment", title: "备注", sortable: true },
          { field: "createTime", title: "创建日期", sortable: true },
          { title: "操作", width: 80, slots: { default: "operate" } }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      params: {
        jsPathName: '',
        vuePathName: '',
        menuCode: '',
        moduleName: '',
        tableName: ''
      },
      modelflag: false,
      ruleInline: {
        moduleName: [
          {
            required: true,
            message: "请输入模块",
            trigger: "change"
          }
        ],
        vuePathName: [
          {
            required: true,
            message: "请输入页面路径",
            trigger: "change"
          }
        ],
        menuCode: [
          {
            required: true,
            message: "请输入name属性",
            trigger: "change"
          }
        ],
        jsPathName: [
          {
            required: true,
            message: "请输入JS路径",
            trigger: "change"
          }
        ],
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
    ok () {
      this.$refs.dataForm.validate(async valid => {
        if (valid) {
          build(this.params).then(res => {
            this.modelflag = false
            downloadFile(res.data,this.params.tableName,'zip')
          })
        }
      })
    },
    download (params) {
      this.params.tableName = params.tableName
      this.modelflag = true
      this.$refs.dataForm.resetFields()
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
</style>
