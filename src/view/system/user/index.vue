<template>
  <div>
    <Card>
        <Row type="flex" justify="start" class="code-row-bg">
           <Button type="success" icon="md-add" @click="adduser" >新增用户</Button>
        </Row>
        <br>
        <tables ref="tables" pageInfo editable v-model="tableData" :columns="columns" :changePageCallback="changePageCallback" :total="total" :page-size="pageSize"
            :current="page"/>
    </Card>
    <Modal
        v-model="add"
        :title="title"
        :mask-closable="false"
        :closable="false"
        footer-hide
        width="500">
        <Form ref="userForm" :model="user" :rules="ruleInline" inline :label-width="80">
            <Row>
                <i-col span="12">
                    <FormItem prop="username" label="用户名：" >
                        <Input placeholder="请输入" v-model="user.username" :readonly= 'flag'/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem prop="phone" label="手机号：">
                        <Input placeholder="请输入"  v-model="user.phone"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <i-col span="12">
                    <FormItem prop="nickName" label="昵称：">
                        <Input placeholder="请输入" v-model="user.nickName"/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem prop="email" label="邮箱：" >
                        <Input placeholder="请输入" v-model="user.email"/>
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
                            <Radio label='1'>
                                <span>激活</span>
                            </Radio>
                            <Radio label='0'>
                                <span>禁用</span>
                            </Radio>
                        </RadioGroup>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <FormItem prop="roleId" label="角色：">
                    <Select v-model="user.roleId" :max-tag-count="3" style="width: 380px">
                        <Option v-for="(role,i) in roleList" :value="role.id" :key="i">
                            {{ role.roleName }}
                        </Option>
                    </Select>
                </FormItem>
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
import { listForPage, save, update, remove } from '@/api/system/user'
import { getAllRole } from '@/api/system/role'
import { validateTel, validateEmail } from "@/libs/validate"; // 手机号验证
import { Message } from 'iview'
export default {
  name: 'system_user',
  components: {
    Tables
  },
  data () {
    return {
        roleList: [], // 角色列表 - select用
        columns: [
            { title: '用户名', key: 'username'},
            { title: '昵称', key: 'nickName' },
            { title: "角色", key: "roleName" },
            { title: '性别', key: 'gender' },
            // { title: '是否启用', key: 'enabled'},
            {
                title: "状态",
                key: "enabled",
                // fixed: "right",
                minWidth: 180,
                align: "center",
                render: (h, params) => {
                return h("i-switch", {
                    props: {
                        type: 'primary',
                        size: 'large',
                        disabled: true,
                        value: Number(params.row.enabled) === 1 //控制开关的打开或关闭状态，官网文档属性是value
                    },
                    scopedSlots: {
                        open: () => h('span','正常'),
                        close: () => h('span','禁止')
                    },
                    on: {
                        'on-change': (value) => {//触发事件是on-change,用双引号括起来，
                            //参数value是回调值，并没有使用到
                            this.statusChange(params.row,value,params.index) //params.index是拿到table的行序列，可以取到对应的表格值
                        }
                    }
                });
            }
        },
            { title: '手机号', key: 'phone' },
            { title: '邮箱', key: 'email' },
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
                        disabled: params.row.username === "admin"
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
                        disabled: params.row.username === "admin"
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
      title: '',
      user: {
          gender: '男',
          enabled: '1',
          username: '',
          nickName: '',
          phone: '',
          email: '',
          roleId: '',
      },
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
      }
    }
  },
  async created() {
      this.roleList = (await getAllRole()).data.data || []; // 角色列表下拉select框
    //   console.log(this.roleList)
  },
  methods: {
    changePageCallback (page, pageSize) {
        this.page = page
        this.listForPage(page,pageSize)
    },
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
