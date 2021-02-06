<template>
  <div>
    <Card>
      <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
        <template v-slot:toolbar_buttons>
          <vxe-button status="primary" @click="add">新增</vxe-button>
          <vxe-button status="success" @click="edit">编辑</vxe-button>
          <vxe-button status="danger" @click="remove">删除</vxe-button>
          <vxe-button status="primary" @click="relateMenus">关联菜单</vxe-button>
          <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
        </template>
      </vxe-grid>
    </Card>
    <Modal
        v-model="menuFlag"
        title="关联菜单"
        :mask-closable="false"
        :closable="false"
        @on-ok="roleMenuOk"
        width="500">
        <Card>
          <Tree ref="tree" :data="baseData" show-checkbox></Tree>
        </Card>
    </Modal>
    <Modal
      v-model="modelflag"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="500"
    >
      <Form ref="roleForm" :model="role" :rules="ruleInline" :label-width="100">
        <Row>
          <i-col span="12">
            <FormItem prop="roleName" label="角色名称：">
              <Input placeholder="请输入" v-model="role.roleName" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="roleCode" label="角色编码：">
              <Input placeholder="请输入" v-model="role.roleCode" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem prop="roleDesc" label="角色描述：">
              <Input placeholder="请输入" v-model="role.roleDesc" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="sort" label="排序：">
              <Input placeholder="请输入" v-model="role.sort" />
            </FormItem>
          </i-col>
        </Row>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('roleForm')">确定</Button>
            <Button @click="modelflag = false" style="margin-left: 8px"
              >取消</Button
            >
          </FormItem>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script>
// api 地址 https://xuliangzhan_admin.gitee.io/vxe-table/#/table/api
import { listForPage, save, update, remove, exportExcel } from "@/api/system/role";
import { Notice } from "iview";
import { validateNumber } from "@/libs/validate"; // 正数验证
import { buildTree } from "@/api/system/menu";
import { saveRoleMenu } from "@/api/system/roleMenu";
import { downloadFile } from '@/api/downUtils'
export default {
  name: "system_role",
  components: {},
  data() {
    return {
      tableToolbar: {
        // 工具栏
        refresh: true,
        // export: true,
        custom: true,
        slots: {
          buttons: "toolbar_buttons",
        },
      },
      gridOptions: {
        // 表格配置
        border: true, // 是否带有边框
        resizable: true, // 所有的列是否允许拖动列宽调整大小
        showHeaderOverflow: true, // 设置表头所有内容过长时显示为省略号
        showOverflow: true, // 设置所有内容过长时显示为省略号（如果是固定列建议设置该值，提升渲染速度）
        highlightHoverRow: true, // 鼠标移到行是否要高亮显示
        keepSource: true, // 保持原始值的状态，被某些功能所依赖，比如编辑状态、还原数据等（开启后影响性能，具体取决于数据量）
        id: "user", // 唯一标识（被某些特定的功能所依赖）
        height: document.documentElement.clientHeight - 150,
        rowId: "id", // 自定义行数据唯一主键的字段名（行数据必须要有唯一主键，默认自动生成）
        customConfig: {
          // 自定义列配置项
          storage: true, // 是否启用 localStorage 本地保存，会将列操作状态保留在本地（需要有 id）
          checkMethod: this.checkColumnMethod, // 自定义列是否允许列选中的方法，该方法 Function({ column }) 的返回值用来决定这一列的 checkbox 是否可以选中
        },
        sortConfig: {
          // 排序配置项
          trigger: "cell", // default（点击按钮触发）, cell（点击表头触发）
        },
        pagerConfig: {
          pageSize: 10,
          pageSizes: [5, 20, 50, 100, 500, 1000],
        },
        formConfig: {
          titleWidth: 100,
          titleAlign: "right",
          items: [
            {
              field: "roleName",
              title: "角色名称",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入名称" },
              },
            },
            {
              field: "roleCode",
              title: "角色编码",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入编码" },
              },
            },
            {
              field: "roleDesc",
              title: "角色描述",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入描述" },
              },
            },
            {
              field: "createTime",
              title: "创建日期",
              span: 8,
              folding: true,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入日期" },
              },
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
                      status: "primary",
                    },
                  },
                  { props: { type: "reset", content: "重置" } },
                ],
              },
            },
          ],
        },
        proxyConfig: {
          seq: true, // 启用动态序号代理
          form: true, // 启用表单代理
          props: {
            result: "result",
            total: "page.total",
          },
          ajax: {
            // 接收 Promise 对象
            query: ({ page, form }) => {
              // // 处理排序条件
              const queryParams = Object.assign(
                {
                  pageSize: page.pageSize,
                  currentPage: page.currentPage,
                },
                form
              );
              return this.list(queryParams); //XEAjax.get(`https://api.xuliangzhan.com:10443/api/pub/page/list/${page.pageSize}/${page.currentPage}`, queryParams)
            },
          },
        },
        columns: [
          { type: "checkbox", width: 40 },
          { type: "seq", title: "序号", width: 50 },
          { field: "roleName", title: "角色名称", sortable: true },
          { field: "roleCode", title: "角色编码", sortable: true },
          { field: "roleDesc", title: "角色描述", sortable: true },
          { field: "sort", title: "排序", sortable: true },
          { field: "createTime", title: "创建日期", sortable: true },
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true,
        },
      },
      ruleInline: {
        roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "change",
          },
          {
            type: "string",
            max: 20,
            message: "角色名称过长",
            trigger: "change",
          },
        ],
        roleCode: [
          {
            required: true,
            message: "请输入角色编码",
            trigger: "change",
          },
          {
            type: "string",
            max: 10,
            message: "角色编码过长",
            trigger: "change",
          },
        ],
        roleDesc: [
          {
            required: true,
            trigger: "change",
            message: "请输入角色描述",
          },
        ],
        sort: [
          {
            required: true,
            trigger: "change",
            validator: function (rule, value, callback) {
              if (!validateNumber(value)) {
                callback(new Error("排序格式不正确,输入正数"));
              } else {
                callback();
              }
            },
          },
        ],
      },
      modelflag: false, // modal标识
      title: "", // modal标识标题
      roleList: [], // 角色列表 - 下拉
      role: {
        roleName: "",
        roleCode: "",
        roleDesc: "",
        sort: 1,
      },
      menuFlag: false,
      baseData: [],
    };
  },
  async created() {},
  methods: {
    list(queryParams) {
      return new Promise((resolve) => {
        listForPage(queryParams).then((res) => {
          resolve({
            result: res.data.data.list,
            page: { total: Number(res.data.data.total) },
          });
        });
      });
    },
    add() {
      this.modelflag = true;
      this.title = "新增角色";
      this.$refs.roleForm.resetFields();
    },
    edit() {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords();
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!",
        });
        return;
      } else if (selectRecords.length > 1) {
        Notice.warning({
          title: "消息通知",
          desc: "不允许选择多条数据!",
        });
        return;
      }
      this.modelflag = true;
      this.title = "编辑角色";
      this.role = JSON.parse(JSON.stringify(selectRecords[0]));
    },
    remove() {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords(),
        ids = [];
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!",
        });
        return;
      }
      selectRecords.forEach((value, key, arr) => {
        ids[key] = value.id;
      });
      this.$Modal.confirm({
        title: "确定删除该用户？",
        onOk: async () => {
          remove(ids).then((res) => {
            Notice.success({
              title: "消息通知",
              desc: res.data.msg,
            });
            // 重新加载表格
            this.$refs.xGrid.commitProxy("reload");
          }).catch((e) => {});
        },
        closable: true,
      });
    },
    confirm() {
      this.$refs.roleForm.validate(async (valid) => {
        if (valid) {
          switch (this.title) {
            case "新增角色":
              save(this.role).then((res) => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg,
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              }).catch((e) => {});
              break;
            case "编辑角色":
              update(this.role).then((res) => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg,
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
    // 查看关联菜单
    relateMenus () {
      // 获取选中数据
      let selectRecords = this.$refs.xGrid.getCheckboxRecords()
      if (selectRecords.length == 0) {
        Notice.warning({
          title: "消息通知",
          desc: "请选择数据!",
        });
        return;
      } else if (selectRecords.length > 1) {
        Notice.warning({
          title: "消息通知",
          desc: "不允许选择多条数据!",
        });
        return;
      }
      this.menuFlag = true
      this.roleId = selectRecords[0].id
      this.roleCode = selectRecords[0].roleCode
      this.baseData = []
      this.buildTree(selectRecords[0].roleCode)
    },
    // 构建菜单树
    buildTree (roleCode) {
      const params = { rolecode: roleCode }
      buildTree(params).then(res => {
        this.baseData = res.data.data
      }).catch((e) => {});
    },
    // 关联菜单保存
    roleMenuOk () {
      // if (this.roleCode === 'admin') {
      //   Notice.warning({
      //     title: '消息通知',
      //     desc: "暂不支持修改admin用户"
      //   });
      //   return
      // }
      let treeNode = this.$refs.tree.getCheckedNodes()
      const params = { 'roleid': this.roleId,'rolemenu': treeNode }
      saveRoleMenu(JSON.stringify(params)).then(res => {
        Notice.success({
          title: '消息通知',
          desc: res.data.msg
        });
      }).catch((e) => {});
    },
    exportExcel() {
      const proxyInfo = this.$refs.xGrid.getProxyInfo()
      let queryData = proxyInfo.form
      exportExcel(queryData).then(res => {
        downloadFile(res.data,'角色管理','xlsx')
      });
    }
  },
  mounted() {},
};
</script>

<style>
</style>
