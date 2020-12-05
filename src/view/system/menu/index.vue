<template>
  <div>
    <Card>
        <Row type="flex" justify="start" class="code-row-bg">
           <Button type="success" icon="md-add" @click="add" >新增</Button>
        </Row>
        <br>
        <tree-table expand-key="menuName" :expand-type="false" :selectable="false" :columns="columns" :data="data">
            <template slot="operation" slot-scope="scope">
                <Row>
                    <i-col span="6">
                        <Button type="primary"  icon="ios-create-outline" @click="edit(scope)"></Button>
                    </i-col>
                    <i-col span="6">
                        <Button type="error"  icon="ios-trash" @click="remove(scope)"></Button>
                    </i-col>
                </Row>
            </template>
            <template slot="icon" slot-scope="scope">
                <Icon :type="scope.row.icon ? scope.row.icon : ''" />
            </template>
        </tree-table>
    </Card>
    <Modal
        v-model="show"
        :title="title"
        :mask-closable="false"
        :closable="true"
        footer-hide
        width="700">
        <Form ref="menuForm" :model="menu" :rules="ruleInline" :label-width="100">
            
            <Row>
                <FormItem label="菜单类型：" >
                    <RadioGroup v-model="menu.isLeaf" type="button" @on-change="redioChange">
                        <Radio label="0" >目录</Radio>
                        <Radio label="1" >菜单</Radio>
                    </RadioGroup>
                </FormItem>
            </Row>
            <Row>
                <FormItem label="菜单图标：">
                    <icon-choose v-model="menu.icon"
                         placeholder="选择图标，子菜单非必选"></icon-choose>
                </FormItem>
            </Row>
            <Row>    
                <i-col span="12">
                    <FormItem  prop="menuName" label="菜单标题：">
                        <Input placeholder="菜单标题"  v-model="menu.menuName"/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem label="菜单排序：" prop="sort">
                        <Input placeholder="请输入" v-model="menu.sort"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <i-col span="12" v-if="showCol == true">
                    <FormItem label="路由地址：" prop="component">
                        <Input placeholder="前端页面路径: system/dept/index" v-model="menu.component"/>
                    </FormItem>
                </i-col>
                <i-col span="12" v-if="showCol == true">
                    <FormItem label="权限标识：" prop="permission">
                        <Input placeholder="权限标识: dept:list" v-model="menu.permission"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <i-col span="12">
                    <FormItem label="组件名称：" prop="menuCode">
                        <Input placeholder="页面name: system_dept;目录：system" v-model="menu.menuCode"/>
                    </FormItem>
                </i-col>
                 <i-col span="12" v-if="showCol == true" >
                    <FormItem label="上级名称：" prop="menuPid">
                        <!-- <Input placeholder="上级名称" v-model="menu.menuPid"/> -->
                        <Select v-model="menu.menuPid" filterable>
                            <Option v-for="item in firstMenuData" :value="item.id" :key="item.id">{{ item.menuName }}</Option>
                        </Select>

                    </FormItem>
                </i-col>
            </Row>
            <Row type="flex" justify="end" class="code-row-bg">
                <FormItem>
                    <Button type="primary"
                            @click="ok()"
                            >确定</Button>
                    <Button @click="show=false"
                            style="margin-left: 8px">取消</Button>
                </FormItem>
            </Row>
            
        </Form>
    </Modal>
  </div>
</template>

<script>
import { list,firstMenu,save,update,remove } from '@/api/system/menu'
import IconChoose from "@/components/icons-choose/icon-choose"
import { validateNumber } from "@/libs/validate"; // 正数验证
import { Notice } from 'iview'
export default {
  components: {
    IconChoose
  },
  name: 'system_menu',
  data () {
    return {
        ruleInline: {
            menuName: [
                {
                    required: true,
                    message: "请输入菜单名称",
                    trigger: "change"
                },
                { type: "string", max: 20, message: "菜单名称过长", trigger: "change" }
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
                { type: "string", max: 60, message: "页面路径过长", trigger: "change" }
            ],
            permission: [
                {
                    required: true,
                    message: "请输入权限标识",
                    trigger: "change"
                },
                { type: "string", max: 60, message: "权限标识过长", trigger: "change" }
            ],
            menuCode: [
                {
                    required: true,
                    message: "请输入组件名称",
                    trigger: "change"
                },
                { type: "string", max: 30, message: "组件名称过长", trigger: "change" }
            ]
        },
        columns: [
            {
            title: '菜单标题',
            key: 'menuName',
            tree: true
            },
            {
            title: '图标',
            key: 'icon',
            type: 'template',
            template: 'icon'
            },
            {
            title: '排序',
            key: 'sort'
            },
            {
            title: '权限标识',
            key: 'permission'
            },
            {
            title: '组件路径',
            key: 'component'
            },
            {
            title: '创建日期',
            key: 'createTime'
            },
            {
            title: '操作',
            key: 'operation',
            type: 'template',
            template: 'operation'
            }
        ],
        data: [],
        show: false,
        title: '',
        menu: {
            isLeaf: '0',
            icon: '',
            menuName: '',
            permission: '',
            component: '',
            sort: '',
            menuCode: '',
            menuPid: '',
            level: 1 // 1: 目录 2: 菜单 3: 按钮
        },
        showCol: false,
        firstMenuData: ''
    }
  },
  methods: {
    redioChange (value) {
        if (value == 1) {
            this.showCol = true
            this.menu.level = 2
        } else {
            this.showCol = false
            this.menu.level = 1
        }
    },
    edit (scope) {
        this.show = true
        this.title = '编辑菜单'
        this.menu = scope.row
        this.menu.isLeaf = this.menu.isLeaf.toString();
        this.redioChange(this.menu.isLeaf)

        this.$refs.menuForm.resetFields()
    },
    remove (scope) {
        if (scope.row.isLeaf == 0 && scope.row.children.length > 0) {
            Notice.warning({
                title: '消息通知',
                desc: "该目录下存在子菜单！"
            });
            return
        }
        this.$Modal.confirm({
            title: "确定删除该菜单？",
            onOk: async () => {
                remove({id: scope.row.id}).then(res => {
                    Notice.success({
                        title: '消息通知',
                        desc: res.data.msg
                    });
                    this.listForPage();
                })
            },
            closable: true
        });
    },
    listForPage () {
        list().then(res => {
            this.data = res.data.data
        })
    },
    getFirstMenu () {
        firstMenu().then(res => {
            this.firstMenuData = res.data.data
        })
    },
    add () {
        this.show = true;
        this.title = '新增菜单'
        this.$refs.menuForm.resetFields()
    },
    ok () {
        this.$refs.menuForm.validate(async valid => {
            if (valid) {
                debugger
                switch (this.title) {
                    case '新增菜单':
                        save(this.menu).then(res => {
                            Notice.success({
                                title: '消息通知',
                                desc: res.data.msg
                            });
                            this.show = false;
                            this.listForPage();
                        })
                    break
                    case '编辑菜单':
                        update(this.menu).then(res => {
                            Notice.success({
                                title: '消息通知',
                                desc: res.data.msg
                            });
                            this.show = false;
                            this.listForPage();
                        })
                    break
                }
                
            }
        })   
    }
  },
  mounted () {
    this.listForPage()
    this.getFirstMenu()
  }
}
</script>

<style>

</style>
