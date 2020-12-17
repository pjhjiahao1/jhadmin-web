<template>
  <div>
    <Card>
      <!-- <Row type="flex" justify="start" class="code-row-bg">
        <Button type="success" icon="md-add" @click="add">新增</Button>
      </Row>-->
      <vxe-grid
        border
        resizable
        ref="xGrid"
        :proxy-config="tableProxy"
        :columns="tableColumn"
        :tree-config="{lazy: true, children: 'children', hasChild: 'deptName', loadMethod: loadChildrenMethod}"
        :toolbar-config="tableToolbar"
      >
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
        </template>
        <template v-slot:operate="{ row }">
          <vxe-button status="success" @click="edit(row)">编辑</vxe-button>
          <vxe-button status="danger" @click="remove(row)">删除</vxe-button>
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
      <Form ref="sysDeptForm" :model="sysDept" :rules="ruleInline" :label-width="80">
        <FormItem prop="deptName" label="部门名称">
          <Input placeholder="请输入" v-model="sysDept.deptName" />
        </FormItem>
        <FormItem prop="sort" label="排序">
          <Input placeholder="请输入" v-model="sysDept.sort" />
        </FormItem>
        <FormItem label="顶级部门" >
          <Select v-model="deptType">
            <Option v-for="item in dept" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="状态">
          <Select v-model="sysDept.status">
            <Option
              v-for="item in statusData"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="上级部门" v-if="deptType === 'N'">
          <Dropdown trigger="custom" :visible="visible">
            <Input
              v-model="sysDept.pidName"
              readonly
              icon="ios-clock-outline"
              style="width: 260px"
              @on-click="handleOpen"
            />
            <DropdownMenu slot="list">
              <div style="width: 260px"></div>
              <div>
                <Tree :data="treeData" @on-select-change="getClickTree" :load-data="loadData"></Tree>
                <div style="text-align: right;margin:10px;">
                  <Button type="primary" @click="handleClose">关闭</Button>
                </div>
              </div>
            </DropdownMenu>
          </Dropdown>
        </FormItem>

        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysDeptForm')">确定</Button>
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
  exportExcel,
  find,
  getTreeData
} from "@/api/system/dept";
import { Notice } from "iview";
import { validateNumber } from "@/libs/validate"; // 正数验证
export default {
  name: "system_dept",
  components: {},
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
      deptType: "N",
      dept: [
        {
          value: "Y",
          label: "是"
        },
        {
          value: "N",
          label: "否"
        }
      ],
      title: "",
      sysDept: {
        id: "",
        dept: "",
        pid: "0",
        sort: "",
        status: "0",
        pidName: "",
        deptName: ""
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
        deptName: [
          {
            required: true,
            message: "请输入部门名称",
            trigger: "change"
          },
          { type: "string", max: 20, message: "账户名过长", trigger: "change" }
        ],
        pidName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        sort: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              debugger
              if (!validateNumber(value)) {
                callback(new Error("排序格式不正确,输入正数"));
              } else {
                callback();
              }
            }
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
      },
      selectTreeVisible: false,
      treeData: [],
      visible: false,
      tableToolbar: {
        // 工具栏
        refresh: true,
        // export: true,
        custom: true,
        slots: {
          buttons: "toolbar_buttons"
        }
      },
      tableProxy: {
        ajax: {
          // 查询根节点
          query: () => {
            return this.find(0);
          }
        }
      },
      tableColumn: [
        { field: "deptName", title: "名称", treeNode: true },
        { field: "sort", title: "排序" },
        {
          field: "status",
          title: "状态",
          formatter: function({ cellValue }) {
            if (Number(cellValue) === 0) {
              return "启用";
            } else {
              return "禁用";
            }
          }
        },
        { field: "createTime", title: "创建时间" },
        { title: "操作", width: 200, slots: { default: "operate" } }
      ]
    };
  },
  async created() {},
  methods: {
    find(val) {
      return new Promise(resolve => {
        find({ pid: val }).then(res => {
          resolve(res.data.data);
        });
      });
    },
    getTreeData(val) {
      getTreeData({ pid: val }).then(res => {
        this.treeData = res.data.data;
      });
    },
    getTreeChildrenData(val) {
      getTreeData({ pid: val }).then(res => {
        callback(res.data.data);
      });
    },
    add() {
      this.title = "新增";
      this.modelflag = true;
      this.visible = false;
      this.sysDept.pidName = "";
      this.getTreeData(0);
      this.$refs.sysDeptForm.resetFields();
    },
    confirm() {
      this.$refs.sysDeptForm.validate(async valid => {
        if (valid) {
          if (this.deptType === "Y") {
            this.sysDept.pidName = "";
            this.sysDept.pid = 0;
          }
          switch (this.title) {
            case "新增":
              save(this.sysDept).then(res => {
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
              update(this.sysDept).then(res => {
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
    edit(row) {
      // 获取选中数据
      this.title = "编辑";
      find({ id: row.id }).then(res => {
        this.sysDept = res.data.data[0];
        this.sysDept.status = res.data.data[0].status + "";
        this.getTreeData(0);
        this.modelflag = true;
      });
    },
    remove(params) {
      // 获取选中数据
      let ids = [];
      ids[0] = params.id;
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
        downloadFile(res.data, 部门表, "xlsx");
      });
    },
    handleOpen() {
      this.visible = true;
    },
    getClickTree(row) {
      this.visible = false;
      this.sysDept.pidName = row[0].title;
      this.sysDept.pid = row[0].id;
    },
    handleClose() {
      this.visible = false;
    },
    loadData(item, callback) {
      getTreeData({ pid: item.id }).then(res => {
        callback(res.data.data);
      });
    },
    loadChildrenMethod({ row }) {
      return new Promise(resolve => {
        find({ pid: row.id }).then(res => {
          resolve(res.data.data);
        });
      });
    }
  },
  mounted() {}
};
</script>

<style>
</style>
