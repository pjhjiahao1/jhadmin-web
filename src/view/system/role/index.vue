<template>
  <div>
    <Card>
        <Row type="flex" justify="start" class="code-row-bg">
          <Button type="success" icon="md-add" @click="adduser" >新增角色</Button>
        </Row>
        <Row>
            <tables ref="tables" pageInfo editable v-model="tableData" :columns="columns" :changePageCallback="changePageCallback" :total="total" :page-size="pageSize"
              :current="page"/>
        </Row>
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
  </div>
</template>

<script>
import Tables from '_c/tables'
import { listForPage } from '@/api/system/role'
import { buildTree } from '@/api/system/menu'
import { save } from '@/api/system/roleMenu'
import { Message } from 'iview'
export default {
  name: 'system_role',
  components: {
    Tables
  },
  data () {
    return {
        roleList: [], // 角色列表 - select用
        columns: [
            { title: '角色名称', key: 'roleName'},
            { title: '角色编码', key: 'roleCode' },
            { title: "角色描述", key: "roleDesc" },
            { title: '排序', key: 'sort', sortable: true  },
            { title: '创建日期', key: 'createTime', sortable: true },
            {
                title: "操作",
                key: "action",
                fixed: "right",
                minWidth: 180,
                align: "center",
                render: (h, params) => {
                return h("div", [
                h(
                    "Tooltip",
                    {
                    props: {
                        trigger: "hover",
                        content: "修改",
                        placement: "top",
                        transfer: true
                    }
                    },
                    [
                    h("Button", {
                        props: {
                        type: "info",
                        size: "small",
                        icon: "ios-create-outline",
                        disabled: params.row.roleCode === "admin"
                        },
                        style: {
                            marginRight: "5px"
                        },
                        on: {
                            click: () => {
                                // this.edit(params.row);
                            }
                        }
                    })
                    ]
                ),
                h(
                  "Tooltip",
                  {
                    props: {
                      trigger: "hover",
                      content: "关联菜单",
                      placement: "top",
                      transfer: true
                    }
                  },
                  [
                    h("Button", {
                      props: {
                        type: "success",
                        size: "small",
                        icon: "ios-menu-outline"
                      },
                      style: {
                        marginRight: "5px"
                      },
                      on: {
                        click: () => {
                          this.relateMenus(params.row);
                        }
                      }
                    })
                  ]
                ),
                h(
                    "Tooltip",
                    {
                    props: {
                        trigger: "hover",
                        content: "删除",
                        placement: "top",
                        transfer: true
                    }
                    },
                    [
                    h("Button", {
                        props: {
                        type: "error",
                        size: "small",
                        icon: "ios-trash",
                        disabled: params.row.roleCode === "admin"
                        },
                        on: {
                            click: () => {
                                // this.delete(params.row);
                            }
                        }
                    })
                    ]
                )
                ]);
            }
        }
      ],
      tableData: [],
      total: 0, // 条数
      page: 1, // 当前页
      pageSize: 10, // 显示条数
      add: false,
      menuFlag: false,
      roleName: '',
      roleCode: '',
      flag: false,
      ruleInline: {
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
              if (value === '') {
                callback(new Error("请选择用户角色"));
              } else {
                callback();
              }
            },
            message: "请选择用户角色",
            trigger: "change"
          }
        ]
      },
      baseData: [],
      roleId: ''
    }
  },
  async created() {
  },
  methods: {
    // 菜单保存
    roleMenuOk () {
      debugger
      let treeNode = this.$refs.tree.getCheckedNodes()
      const params = { 'roleid': this.roleId,'rolemenu': treeNode }
      save(JSON.stringify(params)).then(res => {
        debugger
      })
    },
    // 查看关联菜单
    relateMenus (row) {
      this.menuFlag = true
      this.roleId = row.id
      this.baseData = []
      this.buildTree(row.roleCode)
    },
    // 构建菜单树
    buildTree (roleCode) {
      const params = { rolecode: roleCode }
      buildTree(params).then(res => {
        debugger
        this.baseData = res.data.data
      })
    },
    // 分页
    changePageCallback (page, pageSize) {
        this.page = page
        this.listForPage(page,pageSize)
    },
    // 分页查询
    listForPage (page,pageSize) {
      const params = { pageNum: page, pageSize: pageSize}
      listForPage(params).then(res => {
        this.total = Number(res.data.data.total)
        this.tableData = res.data.data.list
      })
    },
    adduser () {
      this.add = true;
      this.title = '新增用户'
      this.flag = false
      this.$refs.userForm.resetFields();
    },
    ok () {
        this.$refs.userForm.validate(async valid => {
            if (valid) {
                switch (this.title) {
                    case '新增用户':
                        save(this.user).then(res => {
                            Message.success(res.data.message);
                            this.add = false;
                            this.listForPage(this.page,this.pageSize);
                        })
                    break
                    case '编辑用户':
                        update(this.user).then(res => {
                            Message.success(res.data.message);
                            this.add = false;
                            this.listForPage(this.page,this.pageSize);
                        })
                    break
                }
            }
        })   
    },
    edit (params) {
        this.add = true;
        this.title = '编辑用户'
        this.user = JSON.parse(JSON.stringify(params));
        this.user.enabled = this.user.enabled + ''
        this.flag = true
    },
    delete (params) {
        this.$Modal.confirm({
            title: "确定删除该用户？",
            onOk: async () => {
                remove({id: params.id}).then(res => {
                    Message.success(res.data.message);
                    this.listForPage(this.page,this.pageSize);
                })
            },
            closable: true
        });
    },
    statusChange (params,value,index) {
        debugger
        let _this = this;
        this.$Modal.confirm({
        title: "确定" + (value == true?'激活':'禁用') +"该用户？",
            onOk: async () => {

            },
            onCancel: () => {
                
                _this.tableData[index].enabled = 1;
                console.log(_this.tableData[index].enabled)
            }
        });
    }
  },
  mounted () {
    this.listForPage(this.page,this.pageSize);
  }
}
</script>

<style>

</style>
