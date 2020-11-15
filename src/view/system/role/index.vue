<template>
  <div>
    <Card>
        <Row type="flex" justify="start" class="code-row-bg">
          <Button type="success" icon="md-add" @click="addrole" >新增</Button>
        </Row>
        <br>
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
    <Modal
        v-model="add"
        :title="title"
        :mask-closable="false"
        :closable="true"
        footer-hide
        width="500">
        <Form ref="roleForm" :model="role" :rules="ruleInline" :label-width="100">
            <Row>
                <i-col span="12">
                    <FormItem prop="roleName" label="角色名称：" >
                        <Input placeholder="请输入" v-model="role.roleName" :readonly= 'flag'/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem prop="roleCode" label="角色编码：">
                        <Input placeholder="请输入"  v-model="role.roleCode"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <i-col span="12">
                    <FormItem prop="roleDesc" label="角色描述：">
                        <Input placeholder="请输入" v-model="role.roleDesc"/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem prop="sort" label="排序：" >
                        <Input placeholder="请输入" v-model="role.sort"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row type="flex" justify="end" class="code-row-bg">
                <FormItem>
                    <Button type="primary"
                            @click="ok('userForm')"
                            >确定</Button>
                    <Button @click="add=false"
                            style="margin-left: 8px">取消</Button>
                </FormItem>
            </Row>
            
        </Form>
    </Modal>
  </div>
</template>

<script>
import Tables from '_c/tables'
import { listForPage } from '@/api/system/role'
import { buildTree } from '@/api/system/menu'
import { saveRoleMenu } from '@/api/system/roleMenu'
import { save, update, remove } from '@/api/system/role'
import { Message } from 'iview'
import { validateNumber } from "@/libs/validate"; // 正数验证
export default {
  name: 'system_role',
  components: {
    Tables
  },
  data () {
    return {
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
                              this.edit(params.row);
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
                                this.delete(params.row);
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
      role: {
        roleName: '',
        roleCode: '',
        roleDesc: '',
        sort: 1
      },
      ruleInline: {
          roleName: [
          {
            required: true,
            message: "请输入角色名称",
            trigger: "change"
          },
          { type: "string", max: 20, message: "角色名称过长", trigger: "change" }
        ],
        roleCode: [
          {
            required: true,
            message: "请输入角色编码",
            trigger: "change"
          },
          { type: "string", max: 10, message: "角色编码过长", trigger: "change" }
        ],
        roleDesc: [
          {
            required: true,
            trigger: "change",
            message: "请输入角色描述",
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
        ]
      },
      baseData: [],
      roleId: '',
      title: ''
    }
  },
  async created() {
  },
  methods: {
    // 菜单保存
    roleMenuOk () {
      if (this.roleCode === 'admin') {
        return Message.warning("暂不支持修改admin用户")
      }
      let treeNode = this.$refs.tree.getCheckedNodes()
      const params = { 'roleid': this.roleId,'rolemenu': treeNode }
      saveRoleMenu(JSON.stringify(params)).then(res => {
        Message.success(res.data.message);
      })
    },
    // 查看关联菜单
    relateMenus (row) {
      this.menuFlag = true
      this.roleId = row.id
      this.roleCode = row.roleCode
      this.baseData = []
      this.buildTree(row.roleCode)
    },
    // 构建菜单树
    buildTree (roleCode) {
      const params = { rolecode: roleCode }
      buildTree(params).then(res => {
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
    addrole () {
      this.add = true;
      this.title = '新增角色'
      this.$refs.roleForm.resetFields();
    },
    ok () {
        this.$refs.roleForm.validate(async valid => {
            if (valid) {
                switch (this.title) {
                    case '新增角色':
                        save(this.role).then(res => {
                            Message.success(res.data.message);
                            this.add = false;
                            this.listForPage(this.page,this.pageSize);
                        })
                    break
                    case '编辑角色':
                        update(this.role).then(res => {
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
        this.title = '编辑角色'
        this.role = JSON.parse(JSON.stringify(params));
    },
    delete (params) {
        this.$Modal.confirm({
            title: "确定删除该角色？",
            onOk: async () => {
                remove({id: params.id}).then(res => {
                    Message.success(res.data.message);
                    this.listForPage(this.page,this.pageSize);
                })
            },
            closable: true
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
