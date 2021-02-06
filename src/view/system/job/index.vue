<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
          <vxe-button status="success" @click="edit">编辑</vxe-button>
          <vxe-button status="danger" @click="remove">删除</vxe-button>
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
        </template>
        <template v-slot:statusScope="{ row }">
                <i-switch size="large" v-model=row.status :true-value='0' :false-value='1' disabled>
                  <span slot="open">启用</span>
                  <span slot="close">禁用</span>
                </i-switch>
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
      <Form ref="sysJobForm" :model="sysJob" :rules="ruleInline" :label-width="80">
       
        <FormItem prop="name" label="岗位名称">
          <Input placeholder="请输入" v-model="sysJob.name" />
        </FormItem>
        <FormItem prop="status" label="状态">
           <Select v-model="sysJob.status">
            <Option
              v-for="item in dict.YXX"
              :value="item.value"
              :key="item.id"
            >{{ item.name }}</Option>
          </Select>
        </FormItem>
       
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysJobForm')">确定</Button>
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
} from "@/api/system/sysjob";
import { Notice } from "iview";
import { downloadFile } from "@/api/downUtils";
export default {
  name: "system_job",
  components: {},
    // 数据字典
  dicts: ['YXX'],
  data() {
    return {
      statusData: [
        {
          value: "0",
          label: "有效"
        },
        {
          value: "1",
          label: "无效"
        }
      ],
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
        id: "system_job", // 唯一标识（被某些特定的功能所依赖）
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
              field: "name",
              title: "岗位名称",
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
              return this.list(queryParams); //XEAjax.get(`https://api.xuliangzhan.com:10443/api/pub/page/list/${page.pageSize}/${page.currentPage}`, queryParams)
            }
          }
        },
        columns: [
          { type: "checkbox", width: 40 },
          { type: "seq", title: "序号", width: 50 },
          { field: "name", title: "岗位名称", sortable: true },
          {
            field: "enabled",
            title: "状态",
            slots: { default: "statusScope" }
          },
          { field: "createTime", title: "创建日期", sortable: true }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      title: "",
      sysJob: {
        id: "",
        name: "",
        status: ""
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
        name: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        status: [
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
      this.$refs.sysJobForm.resetFields();
    },
    confirm() {
      this.$refs.sysJobForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysJob).then(res => {
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
              update(this.sysJob).then(res => {
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
      this.sysJob = JSON.parse(JSON.stringify(selectRecords[0]));
      this.sysJob.status = this.sysJob.status + ''
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
      let _this = this
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
        downloadFile(res.data, '岗位表', "xlsx");
      });
    }
  },
  mounted() {}
};
</script>

<style>
</style>
