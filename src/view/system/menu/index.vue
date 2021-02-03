<template>
  <div>
    <Card>
      <vxe-grid
        border
        resizable
        ref="xGrid"
        :proxy-config="tableProxy"
        :columns="tableColumn"
        :tree-config="{lazy: true, children: 'children', hasChild: 'menuName', loadMethod: loadChildrenMethod}"
        :toolbar-config="tableToolbar"
      >
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
        </template>
        <template v-slot:operate="{ row }">
          <vxe-button status="success" @click="edit(row)">编辑</vxe-button>
          <vxe-button status="danger" @click="remove(row)">删除</vxe-button>
        </template>
        <template v-slot:iconScope="{ row }">
            <Icon :type=row.icon />
        </template>
      </vxe-grid>
    </Card>
    <Modal
      v-model="show"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="700"
    >
      <Form ref="menuForm" :model="menu" :rules="ruleInline" :label-width="100">
        <Row>
          <FormItem label="菜单类型：">
            <RadioGroup v-model="menu.isLeaf" type="button" @on-change="redioChange">
              <Radio label="0">目录</Radio>
              <Radio label="1">菜单</Radio>
            </RadioGroup>
          </FormItem>
        </Row>
        <Row>
          <FormItem label="菜单图标：">
            <icon-choose v-model="menu.icon" placeholder="选择图标，子菜单非必选"></icon-choose>
          </FormItem>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem prop="menuName" label="菜单标题：">
              <Input placeholder="菜单标题" v-model="menu.menuName" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem label="菜单排序：" prop="sort">
              <Input placeholder="请输入" v-model="menu.sort" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12" v-if="showCol == true">
            <FormItem label="路由地址：" prop="component">
              <Input placeholder="前端页面路径: system/dept/index" v-model="menu.component" />
            </FormItem>
          </i-col>
          <i-col span="12" v-if="showCol == true">
            <FormItem label="权限标识：" prop="permission">
              <Input placeholder="权限标识: dept:list" v-model="menu.permission" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem label="组件名称：" prop="menuCode">
              <Input placeholder="页面name: system_dept;目录：system" v-model="menu.menuCode" />
            </FormItem>
          </i-col>
          <i-col span="12" v-if="showCol == true">
            <FormItem label="上级名称：" prop="menuPid">
              <!-- <Input placeholder="上级名称" v-model="menu.menuPid"/> -->
              <Select v-model="menu.menuPid" filterable>
                <Option
                  v-for="item in firstMenuData"
                  :value="item.id"
                  :key="item.id"
                >{{ item.menuName }}</Option>
              </Select>
            </FormItem>
          </i-col>
        </Row>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="ok()">确定</Button>
            <Button @click="show=false" style="margin-left: 8px">取消</Button>
          </FormItem>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { list, firstMenu, save, update, remove } from "@/api/system/menu";
import IconChoose from "@/components/icons-choose/icon-choose";
import { Notice } from "iview";
import { validateNumber } from "@/libs/validate"; // 正数验证
export default {
  name: "system_dept",
  components: { IconChoose },
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
      menu: {
        isLeaf: "0",
        icon: "",
        menuName: "",
        permission: "",
        component: "",
        sort: "",
        menuCode: "",
        menuPid: "",
        level: 1 // 1: 目录 2: 菜单 3: 按钮
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
        { field: "menuName", title: "菜单标题", treeNode: true },
        {field: "icon",title: "图标",slots: { default: "iconScope" }}, 
        { field: "sort", title: "排序" },
        { field: "permission", title: "权限标识" },
        { field: "component", title: "组件路径" },
        { field: "createTime", title: "创建日期" },
        { title: "操作", width: 200, slots: { default: "operate" } }
      ],
      ruleInline: {
        menuName: [
          {
            required: true,
            message: "请输入菜单名称",
            trigger: "change"
          },
          {
            type: "string",
            max: 20,
            message: "菜单名称过长",
            trigger: "change"
          }
        ],
        sort: [
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
        component: [
          {
            required: true,
            message: "请输入页面路径",
            trigger: "change"
          },
          {
            type: "string",
            max: 60,
            message: "页面路径过长",
            trigger: "change"
          }
        ],
        permission: [
          {
            required: true,
            message: "请输入权限标识",
            trigger: "change"
          },
          {
            type: "string",
            max: 60,
            message: "权限标识过长",
            trigger: "change"
          }
        ],
        menuCode: [
          {
            required: true,
            message: "请输入组件名称",
            trigger: "change"
          },
          {
            type: "string",
            max: 30,
            message: "组件名称过长",
            trigger: "change"
          }
        ]
      },
      data: [],
      show: false,
      title: "",
      showCol: false,
      firstMenuData: ""
    };
  },
  async created() {},
  methods: {
    ok() {
      this.$refs.menuForm.validate(async valid => {
        if (valid) {
          debugger;
          switch (this.title) {
            case "新增":
              save(this.menu).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.show = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
              break;
            case "编辑":
              update(this.menu).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.show = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
              break;
          }
        }
      });
    },
    getFirstMenu() {
      firstMenu().then(res => {
        this.firstMenuData = res.data.data;
      });
    },
    redioChange(value) {
      if (value == 1) {
        this.showCol = true;
        this.menu.level = 2;
      } else {
        this.showCol = false;
        this.menu.level = 1;
      }
    },
    find(val) {
      return new Promise(resolve => {
        list({ pid: val }).then(res => {
          resolve(res.data.data);
        });
      });
    },
    loadChildrenMethod({ row }) {
      return new Promise(resolve => {
        list({ pid: row.id }).then(res => {
          resolve(res.data.data);
        });
      });
    },
    add() {
      this.show = true;
      this.title = "新增";
      this.menu.level = 1;
      this.showCol = false;
      this.menu.isLeaf = "0";
      this.$refs.menuForm.resetFields();
    },
    edit(row) {
      // 获取选中数据
      this.title = "编辑";
      list({ menuPid: row.id }).then(res => {
        this.show = true;
        this.menu = res.data.data[0];
        this.menu.isLeaf = this.menu.isLeaf.toString();
        this.redioChange(this.menu.isLeaf);
      });
    },
    remove(row) {
      if (row.isLeaf == 0 && row.children.length > 0) {
        Notice.warning({
          title: "消息通知",
          desc: "该目录下存在子菜单！"
        });
        return;
      }
      let _this = this;
      this.$Modal.confirm({
        title: "确定删除该菜单？",
        onOk: async () => {
          remove({ id: row.id }).then(res => {
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
    }
  },
  mounted() {
    this.getFirstMenu();
  }
};
</script>

<style>
</style>
