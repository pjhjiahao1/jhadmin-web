<template>
  <div>
    <Card>
      <vxe-grid
        border
        resizable
        ref="xGrid"
        :proxy-config="tableProxy"
        :columns="tableColumn"
        :tree-config="{lazy: true, children: 'children',  hasChild: 'hasChild', loadMethod: loadChildrenMethod}"
        :toolbar-config="tableToolbar"
      >
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
        </template>
        <template v-slot:timeScope="{ row }">
          <Tag color="blue" v-if="row.type == 0">目录</Tag>
          <Tag color="error" v-if="row.type == 1">参数</Tag>
        </template>
        <template v-slot:operate="{ row }">
          <vxe-button status="primary" @click="addRow(row)">新增</vxe-button>
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
      <Form ref="sysDictForm" :model="sysDict" :rules="ruleInline" :label-width="80">
        <FormItem label="字典类型：">
          <RadioGroup v-model="sysDict.type" type="button">
            <Radio label="0">目录</Radio>
            <Radio label="1">参数</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem prop="name" label="名称">
          <Input placeholder="目录名称或参数名称" v-model="sysDict.name" />
        </FormItem>
        <FormItem prop="value" label="英文代码">
          <Input placeholder="类型编码或参数值" v-model="sysDict.value" />
        </FormItem>
        <FormItem prop="parentName" label="上级" v-if="addshow == false">
          <Dropdown trigger="custom" :visible="visible" style="width: 300px">
            <Input
              v-model="sysDict.parentName"
              readonly
              icon="ios-clock-outline"
              @on-click="visible=true"
            />
            <DropdownMenu slot="list">
              <div style="width: 100%"></div>
              <div>
                <Tree :data="treeAlertData" @on-select-change="getClickTree" :load-data="loadData"></Tree>
                <div style="text-align: right;margin:10px;">
                  <Button type="primary" @click="visible=false">关闭</Button>
                </div>
              </div>
            </DropdownMenu>
          </Dropdown>
        </FormItem>

        <FormItem prop="dictSort" label="排序">
          <Input placeholder="请输入" v-model="sysDict.dictSort" />
        </FormItem>
        <FormItem label="备注">
          <Input placeholder="请输入" v-model="sysDict.description" />
        </FormItem>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysDictForm')">确定</Button>
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
  find
} from "@/api/system/dict";
import { downloadFile } from "@/api/downUtils";
import { validateNumber } from "@/libs/validate"; // 正数验证
import { Notice } from "iview";
export default {
  name: "system_dict",
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
      tableProxy: {
        ajax: {
          // 查询根节点
          query: () => {
            return this.list();
          }
        }
      },
      tableColumn: [
        { field: "name", title: "参数名", treeNode: true },
        { field: "value", title: "参数值", sortable: true },
        { field: "description", title: "描述", sortable: true },
        { field: "parentName", title: "所属类别", sortable: true },
        { field: "type", title: "类型", slots: { default: "timeScope" } },
        { field: "dictSort", title: "排序", sortable: true },
        { title: "操作", width: 230, slots: { default: "operate" } }
      ],

      title: "",
      sysDict: {
        id: "",
        name: "",
        value: "",
        description: "",
        dictSort: "",
        parent: "",
        parentName: "",
        type: "0"
      },
      modelflag: false,
      visible: false,
      ruleInline: {
        name: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        value: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        dictSort: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              if (!validateNumber(value)) {
                callback(new Error("排序格式不正确,输入正数"));
              } else {
                callback();
              }
            }
          }
        ],
        parentName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ]
      },
      treeAlertData: [],
      addshow: false
    };
  },
  async created() {},
  methods: {
    loadChildrenMethod({ row }) {
      return new Promise(resolve => {
        listForPage({ parent: row.id }).then(res => {
          resolve(res.data.data);
        });
      });
    },
    loadData(item, callback) {
      find({ parent: item.id, type: 0 }).then(res => {
        callback(res.data.data);
      });
    },
    getClickTree(row) {
      this.visible = false;
      if (row.length == 0) {
        this.sysDict.parentName = "";
        this.sysDict.parent = "";
        return;
      }
      this.sysDict.parentName = row[0].title;
      this.sysDict.parent = row[0].id;
    },
    getTreeAlertData(val) {
      find({ parent: val }).then(res => {
        this.treeAlertData = res.data.data;
      }).catch((e) => {});
    },
    list() {
      return new Promise(resolve => {
        listForPage({ isShow: "Y", parentName: "一级目录" }).then(res => {
          resolve(res.data.data);
        });
      });
    },
    addRow(row) {
      if (row.type == "1") {
        Notice.warning({
          title: "消息通知",
          desc: "请选择目录!"
        });
        return;
      }
      this.addshow = true;
      this.title = "新增";
      this.visible = false;
      this.modelflag = true;
      this.sysDict.parent = row.id;
      this.sysDict.parentName = row.name;
      this.$refs.sysDictForm.resetFields();
    },
    add() {
      this.addshow = false;
      this.title = "新增";
      this.visible = false;
      this.modelflag = true;
      this.getTreeAlertData(0);
      this.$refs.sysDictForm.resetFields();
    },
    confirm() {
      this.$refs.sysDictForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysDict).then(res => {
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
              update(this.sysDict).then(res => {
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
    edit(row) {
      // 获取选中数据
      this.addshow = true;
      this.modelflag = true;
      this.title = "编辑";
      this.sysDict = row
      this.sysDict.type = this.sysDict.type + ''
    },
    remove(row) {
      // 获取选中数据
      let ids = [];
      ids[0] = row.id
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
        downloadFile(res.data, "数据字典", "xlsx");
      });
    }
  },
  mounted() {}
};
</script>

<style>
</style>
