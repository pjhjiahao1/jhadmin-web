<template>
  <div>
    <Row>
      <i-col span="3">
        <Card :style="autoHeight">
          <Tree :data="treeData" :load-data="loadData" @on-select-change="getleftTree"></Tree>
        </Card>
      </i-col>
      <i-col span="21">
        <Card>
          <vxe-grid ref="xGrid" v-bind="gridOptions" :toolbar-config="tableToolbar">
            <template v-slot:toolbar_buttons>
              <vxe-button status="primary" @click="add" v-if="accessAdd">新增</vxe-button>
              <vxe-button status="success" @click="edit" v-if="accessEdit">编辑</vxe-button>
              <vxe-button status="danger" @click="remove">删除</vxe-button>
              <vxe-button status="warning" @click="exportExcel">导出</vxe-button>
            </template>
            <template v-slot:statusScope="{ row }">
                <i-switch size="large" v-model=row.enabled :true-value='1' :false-value='0' disabled>
                  <span slot="open">启用</span>
                  <span slot="close">禁用</span>
                </i-switch>
            </template>
          </vxe-grid>
        </Card>
      </i-col>
    </Row>

    <Modal
      v-model="modelflag"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="500"
    >
      <Form ref="userForm" :model="user" :rules="ruleInline" :label-width="80">
        <Row>
          <i-col span="12">
            <FormItem prop="username" label="用户名：">
              <Input placeholder="请输入" v-model="user.username" :readonly="usernameflag" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="phone" label="手机号：">
              <Input placeholder="请输入" v-model="user.phone" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem prop="nickName" label="昵称：">
              <Input placeholder="请输入" v-model="user.nickName" />
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem prop="email" label="邮箱：">
              <Input placeholder="请输入" v-model="user.email" />
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem label="部门：" prop="orgName">
              <Dropdown trigger="custom" :visible="visible">
                <Input
                  v-model="user.orgName"
                  readonly
                  icon="ios-clock-outline"
                  @on-click="handleOpen"
                />
                <DropdownMenu slot="list">
                  <div style="width: 155px"></div>
                  <div>
                    <Tree
                      :data="treeAlertData"
                      @on-select-change="getClickTree"
                      :load-data="loadData"
                    ></Tree>
                    <div style="text-align: right;margin:10px;">
                      <Button type="primary" @click="handleClose">关闭</Button>
                    </div>
                  </div>
                </DropdownMenu>
              </Dropdown>
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem label="岗位：" prop="jobName">
              <Select v-model="user.jobId" :max-tag-count="3" label-in-value @on-change="jobchange">
                <Option v-for="(jobs,i) in job" :value="jobs.id" :key="i">{{ jobs.name }}</Option>
              </Select>
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <i-col span="12">
            <FormItem label="性别：">
              <RadioGroup v-model="user.gender">
                <Radio label="男">
                  <span>男</span>
                </Radio>
                <Radio label="女">
                  <span>女</span>
                </Radio>
              </RadioGroup>
            </FormItem>
          </i-col>
          <i-col span="12">
            <FormItem label="状态：">
              <RadioGroup v-model="user.enabled">
                <Radio v-for="item in dict.YHZT" :key="item.id" :label="item.value">
                  <span>{{ item.name }}</span>
                </Radio>
                <!-- <Radio label="0">
                  <span>禁用</span>
                </Radio> -->
              </RadioGroup>
            </FormItem>
          </i-col>
        </Row>
        <Row>
          <FormItem label="角色：">
            <Select v-model="user.roleId" :max-tag-count="3" style="width: 380px">
              <Option v-for="(role,i) in roleList" :value="role.id" :key="i">{{ role.roleName }}</Option>
            </Select>
          </FormItem>
        </Row>
        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('userForm')">确定</Button>
            <Button @click="modelflag=false" style="margin-left: 8px">取消</Button>
          </FormItem>
        </Row>
      </Form>
    </Modal>
  </div>
</template>

<script>
// api 地址 https://xuliangzhan_admin.gitee.io/vxe-table/#/table/api
import {
  listForPage,
  save,
  update,
  remove,
  exportExcel
} from "@/api/system/user";
import { getTreeData } from "@/api/system/dept";
import { findAll } from "@/api/system/sysjob";
import selectTree from "iview-select-tree";
import { getAllRole } from "@/api/system/role";
import { validateTel, validateEmail } from "@/libs/validate"; // 手机号验证
import { downloadFile } from "@/api/downUtils";
import { Notice } from "iview";
import { hasOneOf } from '@/libs/tools'
let windowHeight = document.documentElement.clientHeight - 150;
export default {
  name: "system_user",
  components: { selectTree },
  // 数据字典
  dicts: ['YHZT'],
  data() {
    return {
      value10: "1",
      treeData: [],
      treeAlertData: [],
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
        id: "user", // 唯一标识（被某些特定的功能所依赖）
        height: document.documentElement.clientHeight - 150,
        width: 600,
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
              field: "username",
              title: "用户名",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入名称" }
              }
            },
            {
              field: "nickName",
              title: "昵称",
              span: 8,
              itemRender: {
                name: "$input",
                props: { placeholder: "请输入昵称" }
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
                  currentPage: page.currentPage,
                  dept: this.dept
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
          { field: "username", title: "用户名", sortable: true },
          { field: "nickName", title: "昵称", sortable: true },
          { field: "orgName", title: "部门", sortable: true },
          { field: "jobName", title: "岗位", sortable: true },
          { field: "roleName", title: "角色", sortable: true },
          { field: "gender", title: "性别", sortable: true },
          {
            field: "enabled",
            title: "状态",
            slots: { default: "statusScope" }
          },
          { field: "phone", title: "手机号", sortable: true },
          { field: "email", title: "邮箱", sortable: true },
          { field: "createTime", title: "创建日期", sortable: true }
        ],
        checkboxConfig: {
          reserve: true,
          highlight: true,
          range: true
        }
      },
      ruleInline: {
        // modal必填校验
        username: [
          {
            required: true,
            message: "请输入用户名",
            trigger: "change"
          },
          { type: "string", max: 20, message: "账户名过长", trigger: "change" }
        ],
        nickName: [
          {
            required: true,
            message: "请输入昵称",
            trigger: "change"
          },
          { type: "string", max: 10, message: "昵称过长", trigger: "change" }
        ],
        phone: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              if (!validateTel(value)) {
                callback(new Error("联系方式格式不正确"));
              } else {
                callback();
              }
            }
          }
        ],
        email: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              if (!validateEmail(value)) {
                callback(new Error("邮箱格式不正确"));
              } else {
                callback();
              }
            }
          }
        ],
        roleId: [
          {
            required: true,
            validator: function(rule, value, callback) {
              if (value === "") {
                callback(new Error("请选择用户角色"));
              } else {
                callback();
              }
            },
            message: "请选择用户角色",
            trigger: "change"
          }
        ],
        jobName: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              callback();
            }
          }
        ],
        orgName: [
          {
            required: true,
            trigger: "change",
            validator: function(rule, value, callback) {
              callback();
            }
          }
        ]
      },
      modelflag: false, // modal标识
      title: "", // modal标识标题
      usernameflag: false,
      roleList: [], // 角色列表 - 下拉
      user: {
        gender: "男",
        enabled: "1",
        username: "",
        nickName: "",
        phone: "",
        email: "",
        roleId: "",
        pidName: "",
        pid: "",
        orgId: "",
        jobId: "",
        jobName: ""
      },
      windowHeight: windowHeight,
      autoHeight: {
        height: ""
      },
      visible: false,
      dept: "",
      job: []
    };
  },
  async created() {
    window.addEventListener("resize", this.getHeight);
    this.getHeight();
    this.roleList = (await getAllRole()).data.data || []; // 角色列表下拉select框
    this.getTreeData(0);
    this.job = (await findAll()).data.data || [];    
  },
  destroyed() {
    window.removeEventListener("resize", this.getHeight);
  },
  methods: {
    jobchange(params) {
      this.user.jobName = params.label
    },
    getleftTree(row) {
      if (row.length == 0) {
        this.dept = "";
      } else {
        this.dept = row[0].id;
      }
      // 重新加载表格
      this.$refs.xGrid.commitProxy("reload");
    },
    getClickTree(row) {
      this.visible = false;
      this.user.orgName = row[0].title;
      this.user.orgId = row[0].id;
    },
    handleClose() {
      this.visible = false;
    },
    handleOpen() {
      this.visible = true;
    },
    getHeight() {
      this.autoHeight.height = windowHeight + "px";
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
      this.modelflag = true;
      this.title = "新增用户";
      this.usernameflag = false;
      this.getTreeAlertData(0);
      this.$refs.userForm.resetFields();
    },
    edit() {
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
      this.title = "编辑用户";
      this.user = JSON.parse(JSON.stringify(selectRecords[0]));
      this.user.enabled = this.user.enabled.toString();
      this.usernameflag = true;
      this.getTreeAlertData(0);
    },
    remove() {
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
      this.$Modal.confirm({
        title: "确定删除该用户？",
        onOk: async () => {
          remove(ids).then(res => {
            debugger
            Notice.success({
              title: "消息通知",
              desc: res.data.msg
            });
            // 重新加载表格
            this.$refs.xGrid.commitProxy("reload");
          }).catch((e) => {});
        },
        closable: true
      });
    },
    confirm() {
      this.$refs.userForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增用户":
              save(this.user).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              }).catch((e) => {});
              break;
            case "编辑用户":
              update(this.user).then(res => {
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
    exportExcel() {
      const proxyInfo = this.$refs.xGrid.getProxyInfo();
      let queryData = proxyInfo.form;
      exportExcel(queryData).then(res => {
        downloadFile(res.data, "用户管理", "xlsx");
      });
    },
    getTreeData(val) {
      getTreeData({ pid: val }).then(res => {
        this.treeData = res.data.data;
      });
    },
    getTreeAlertData(val) {
      getTreeData({ pid: val }).then(res => {
        this.treeAlertData = res.data.data;
      });
    },
    loadData(item, callback) {
      getTreeData({ pid: item.id }).then(res => {
        callback(res.data.data);
      });
    }
  },
  computed: {
    accessAdd () {
      return hasOneOf(['user:add'], this.access)
    },
    accessEdit () {
      return hasOneOf(['user:edit'], this.access)
    },
    access () {
      return this.$store.state.user.access
    }
  }
};
</script>

<style>
</style>
