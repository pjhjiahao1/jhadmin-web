<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <template v-slot:toolbar_buttons>
          <!-- <vxe-button status="primary" @click="add">新增</vxe-button>
          <vxe-button status="success" @click="edit">编辑</vxe-button>
          <vxe-button status="danger" @click="remove">删除</vxe-button> -->
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
        </template>
      </vxe-grid>
    </Card>
  </div>
</template>

<script>
import {
  listForPage,
  save,
  update,
  remove,
  exportExcel
} from "@/api/monitor/sysonline";
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
export default {
  name: "online_user",
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
        id: "online_user", // 唯一标识（被某些特定的功能所依赖）
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
              field: "nickName",
              title: "昵称",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "dept",
              title: "部门",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "browser",
              title: "浏览器",
              span: 8,
              folding: true,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "ip",
              title: "ip地址",
              span: 8,
              folding: true,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入" }
              }
            },
            {
              field: "address",
              title: "地址",
              span: 8,
              folding: true,
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
              return this.list(queryParams); //XEAjax.get(`https://api.xuliangzhan.com:10443/api/pub/page/list/${page.pageSize}/${page.currentPage}`, queryParams)
            }
          }
        },
        columns: [
          { type: "checkbox", width: 40 },
          { type: "seq", title: "序号", width: 50 },
          { field: "userName", title: "用户名", sortable: true },
          { field: "nickName", title: "昵称", sortable: true },
          { field: "dept", title: "部门", sortable: true },
          { field: "browser", title: "浏览器", sortable: true },
          { field: "ip", title: "ip地址", sortable: true },
          { field: "address", title: "地址", sortable: true },
          { field: "loginTime", title: "登录时间", sortable: true }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      title: "",
      sysOnline: {
        id: "",
        userName: "",
        nickName: "",
        dept: "",
        browser: "",
        ip: "",
        address: "",
        key: "",
        loginTime: ""
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
        userName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        nickName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        dept: [
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
        ip: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        address: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        key: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        loginTime: [
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
      this.$refs.sysOnlineForm.resetFields();
    },
    confirm() {
      this.$refs.sysOnlineForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysOnline).then(res => {
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
              update(this.sysOnline).then(res => {
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
      this.sysOnline = JSON.parse(JSON.stringify(selectRecords[0]));
      this.sysOnline.status = this.sysOnline.status + "";
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
        downloadFile(res.data, "在线用户表", "xlsx");
      });
    }
  },
  mounted() {}
};
</script>

<style>
</style>
