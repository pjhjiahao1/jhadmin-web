<template>
  <div>
    <Card>
      <Row type="flex" justify="start" class="code-row-bg">
        <Button type="success" icon="md-add" @click="add">新增</Button>
      </Row>
    </Card>
    <Modal
      v-model="modelflag"
      :title="title"
      :mask-closable="false"
      :closable="true"
      footer-hide
      width="500"
    >
      <Form ref="sysDeptForm" :model="sysDept" :rules="ruleInline" :label-width="80">
        <FormItem prop="deptName" label="部门名称">
          <Input placeholder="请输入" v-model="sysDept.deptName" />
        </FormItem>
        <FormItem prop="sort" label="排序">
          <Input placeholder="请输入" v-model="sysDept.sort" />
        </FormItem>
        <FormItem label="顶级部门">
          <Select v-model="deptType">
            <Option v-for="item in dept" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="状态">
          <Select v-model="sysDept.status">
            <Option
              v-for="item in statusData"
              :value="item.value"
              :key="item.value"
            >{{ item.label }}</Option>
          </Select>
        </FormItem>
        <!-- <FormItem label="上级部门">
          <Dropdown trigger="custom" :visible="selectTreeVisible" placement="bottom-end">
          <Input v-model="selectedLevelName" readonly icon="ios-clock-outline" @on-click="freshSelectTree"/>

            <Dropdown-menu slot="list">
              <Tree 
                :data="data1">
              </Tree>
            </Dropdown-menu>
          </Dropdown>
        </FormItem>-->
        <FormItem label="上级部门">
          <Dropdown trigger="custom" :visible="visible">
            <Input v-model="selectedLevelName" readonly icon="ios-clock-outline" style="width: 260px" @on-click="handleOpen"/>
            <DropdownMenu slot="list">
              <div style="width: 260px"></div>
              <div>
                <Tree 
                :data="data1" @on-select-change="test">
                </Tree>
              </div>
            </DropdownMenu>
          </Dropdown>
        </FormItem>

        <Row type="flex" justify="end" class="code-row-bg">
          <FormItem>
            <Button type="primary" @click="confirm('sysDeptForm')">确定</Button>
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
  exportExcel
} from "@/api/system/dept";
import { Notice } from "iview";
export default {
  name: "system_dept",
  components: {},
  data() {
    return {
      statusData: [
        {
          value: "0",
          label: "有效"
        },
        {
          value: "1",
          label: "无效"
        }
      ],
      deptType: "Y",
      dept: [
        {
          value: "Y",
          label: "是"
        },
        {
          value: "N",
          label: "否"
        }
      ],
      title: "",
      sysDept: {
        id: "",
        deptName: "",
        pid: "",
        sort: "",
        status: "0"
      },
      modelflag: false,
      ruleInline: {
        id: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        deptName: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        pid: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        sort: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        status: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        createTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        updateTime: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        createBy: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ],
        updateBy: [
          {
            required: true,
            message: "此项必填",
            trigger: "change"
          }
        ]
      },
      selectedLevelName: "",
      selectTreeVisible: false,
      data1: [
        {
          title: "parent 1",
          children: [
            {
              title: "parent 1-1",
              children: [
                {
                  title: "leaf 1-1-1"
                },
                {
                  title: "leaf 1-1-2"
                }
              ]
            },
            {
              title: "parent 1-2",
              children: [
                {
                  title: "leaf 1-2-1"
                },
                {
                  title: "leaf 1-2-1"
                }
              ]
            }
          ]
        }
      ],
      visible: false
    };
  },
  async created() {},
  methods: {
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
      this.title = "新增";
      this.modelflag = true;
      this.visible = false;
      this.$refs.sysDeptForm.resetFields();
    },
    confirm() {
      this.$refs.sysDeptForm.validate(async valid => {
        if (valid) {
          switch (this.title) {
            case "新增":
              save(this.sysDept).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
              break;
            case "编辑":
              update(this.sysDept).then(res => {
                Notice.success({
                  title: "消息通知",
                  desc: res.data.msg
                });
                this.modelflag = false;
                // 重新加载表格
                this.$refs.xGrid.commitProxy("reload");
              });
              break;
          }
        }
      });
    },
    edit(params) {
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
      this.title = "编辑";
      this.user = JSON.parse(JSON.stringify(params));
    },
    remove(params) {
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
        title: "删除确认？",
        onOk: function() {
          remove(ids).then(res => {
            Notice.success({
              title: "消息通知",
              desc: res.data.msg
            });
            // 重新加载表格
            this.$refs.xGrid.commitProxy("reload");
          });
        },
        closable: true
      });
    },
    exportExcel() {
      const proxyInfo = this.$refs.xGrid.getProxyInfo();
      let queryData = proxyInfo.form;
      exportExcel(queryData).then(res => {
        downloadFile(res.data, 部门表, "xlsx");
      });
    },
    handleOpen() {
      this.visible = true;
    },
    test (row) {
      debugger
      this.visible = false;
      this.selectedLevelName = row[0].title
    }
  },
  mounted() {}
};
</script>

<style>
</style>
