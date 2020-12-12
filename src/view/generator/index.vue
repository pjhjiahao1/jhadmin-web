<template>
  <div>
    <Card>
      <Row>
          <tables ref="tables" pageInfo editable v-model="tableData" :columns="columns" :changePageCallback="changePageCallback" :total="total" :page-size="pageSize"
            :current="page"/>
      </Row>
    </Card>
    <Modal
        v-model="flag"
        title="属性配置"
        :mask-closable="false"
        :closable="true"
        footer-hide
        width="500">
        <Card>
            <p slot="title">填写规则</p>
            <p>模块：如用户管理在me.jiahao.modules.system,那么填写 modules.system</p>
            <p>vue-name属性: 用户管理属性：system_user，system模块拼接功能名称</p>
            <p>前端页面路径：用户管理：system/user/index，这也是放vue文件的路径</p>
            <p>前端JS路径：用户管理：api/system/user，这也是放js文件的路径</p>
        </Card>
        <Form ref="dataForm" :model="params" :rules="ruleInline" :label-width="80">
            <FormItem prop="moduleName" label="模块：" >
                <Input placeholder="请输入" v-model="params.moduleName"/>
            </FormItem>
            <FormItem prop="menuCode" label="vue-name属性：" >
                <Input placeholder="请输入" v-model="params.menuCode"/>
            </FormItem>
            <FormItem prop="vuePathName" label="前端页面路径：" >
                <Input placeholder="请输入" v-model="params.vuePathName"/>
            </FormItem>
            <FormItem prop="jsPathName" label="前端JS路径：" >
                <Input placeholder="请输入" v-model="params.jsPathName"/>
            </FormItem>
            <Row type="flex" justify="end" class="code-row-bg">
                <FormItem>
                    <Button type="primary"
                            @click="ok('dataForm')"
                            >确定</Button>
                    <Button @click="flag=false"
                            style="margin-left: 8px">取消</Button>
                </FormItem>
            </Row>
        </Form>
    </Modal>
  </div>
</template>

<script>
import Tables from '_c/tables'
import { listForPage,build,exportFile } from '@/api/generator/generator'
import { downloadFile } from '@/api/downUtils'
import { Notice } from 'iview'
export default {
  components: {Tables},
  name: 'generator_index',
  data () {
    return {
      tableData: [],
      total: 0, // 条数
      page: 1, // 当前页
      pageSize: 10, // 显示条数
      columns: [
        { title: '表名', key: 'tableName'},
        { title: '数据库引擎', key: 'engine' },
        { title: "字符编码集", key: "tableCollation" },
        { title: '备注', key: 'tableComment'},
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
                        content: "下载代码",
                        placement: "top",
                        transfer: true
                    }
                    },
                    [
                    h("Button", {
                        props: {
                        type: "primary",
                        // size: "small",
                        icon: "md-download"
                        },
                        style: {
                            marginRight: "5px"
                        },
                        on: {
                            click: () => {
                                this.download(params.row);
                            }
                        }
                    })
                    ]
                )
                ]);
            }
        }
      ],
      flag: false,
      params: {
        jsPathName: '',
        vuePathName: '',
        menuCode: '',
        moduleName: '',
        tableName: ''
      },
      ruleInline: {
        moduleName: [
          {
            required: true,
            message: "请输入模块",
            trigger: "change"
          }
        ],
        vuePathName: [
          {
            required: true,
            message: "请输入页面路径",
            trigger: "change"
          }
        ],
        menuCode: [
          {
            required: true,
            message: "请输入name属性",
            trigger: "change"
          }
        ],
        jsPathName: [
          {
            required: true,
            message: "请输入JS路径",
            trigger: "change"
          }
        ],
      }
    }
  },
  methods: {
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
    download (params) {
      this.params.tableName = params.tableName
      this.flag = true
      this.$refs.dataForm.resetFields()
    },
    ok () {
      this.$refs.dataForm.validate(async valid => {
        if (valid) {
          build(this.params).then(res => {
            this.flag = false
            downloadFile(res.data,this.params.tableName,'zip')
          })
        }
      })
    }
  },
  mounted () {
    this.listForPage(this.page,this.pageSize);
  }
}
</script>

<style>

</style>
