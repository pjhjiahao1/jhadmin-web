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
                    <Button type="primary"  icon="ios-create-outline" @click="handle(scope)"></Button>
                    </i-col>
                    <i-col span="6">
                        <Button type="error"  icon="ios-trash" @click="handle(scope)"></Button>
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
                    <RadioGroup v-model="menu.isLeaf" type="button">
                        <Radio label="0" >目录</Radio>
                        <Radio label="1" >菜单</Radio>
                    </RadioGroup>
                </FormItem>
            </Row>
            <Row>
                <FormItem label="菜单图标：">
                    <!-- <Input placeholder="请选择"  v-model="menu.icon" icon="ios-heart-outline" @on-click= "choose"/> -->
                    <icon-choose v-model="menu.icon"
                         placeholder="选择图标，子菜单非必选"></icon-choose>
                </FormItem>
            </Row>
            <Row>
                
                <i-col span="12">
                    <FormItem label="菜单标题：">
                        <Input placeholder="菜单标题"  v-model="menu.menuName"/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem label="权限标识：" >
                        <Input placeholder="权限标识" v-model="menu.permission"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <i-col span="12">
                    <FormItem label="路由地址：" >
                        <Input placeholder="前端页面路径" v-model="menu.component"/>
                    </FormItem>
                </i-col>
                <i-col span="12">
                    <FormItem label="菜单排序：" >
                        <Input placeholder="请输入" v-model="menu.sort"/>
                    </FormItem>
                </i-col>
            </Row>
            <Row>
                <FormItem label="组件名称：" >
                    <Input placeholder="匹配前端页面name属性" v-model="menu.menuCode"/>
                </FormItem>
            </Row>
            <!-- <Row type="flex" justify="end" class="code-row-bg">
                <FormItem>
                    <Button type="primary"
                            @click="ok('userForm')"
                            >确定</Button>
                    <Button @click="add=false"
                            style="margin-left: 8px">取消</Button>
                </FormItem>
            </Row> -->
            
        </Form>
    </Modal>
  </div>
</template>

<script>
import { list } from '@/api/system/menu'
import IconChoose from "@/components/icons-choose/icon-choose"
export default {
  components: {
    IconChoose
  },
  name: 'system_menu',
  data () {
    return {
        ruleInline: {
            // roleName: [
            //     {
            //         required: true,
            //         message: "请输入角色名称",
            //         trigger: "change"
            //     },
            //     { type: "string", max: 20, message: "角色名称过长", trigger: "change" }
            // ]
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
            menuCode: ''
        }
    }
  },
  methods: {
    handle (scope) {
      console.log(scope)
    },
    list () {
        list().then(res => {
            this.data = res.data.data
        })
    },
    add () {
        this.show = true;
        this.title = '新增菜单'
        this.$refs.menuForm.resetFields();
    },
    choose: function () {
        alert(1)
    }
  },
  mounted () {
    this.list();
  }
}
</script>

<style>

</style>
