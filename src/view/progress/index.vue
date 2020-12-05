<template>
  <!-- <div>
    
  </div> -->
    <div style="background:#eee;padding: 20px;">
        <Card :bordered="false">
            <p slot="title">目前进度</p>
            <p>JH-ADMIN 基于 Spring Boot 2.1.0 、 Mybatis、 JWT、Spring Security、Redis、Vue、iview 的前后端分离的后台管理系统， 项目采用按功能分模块的开发方式，权限控制采用 RBAC(角色访问控制) 思想，支持前端菜单动态路由等
目前正在持续迭代开发中 swagger接口： http://192.168.116.6:8000/swagger-ui.html#/ druid地址：http://localhost:8000/druid/api.html</p>
            <Row>
                <Checkbox v-model="complete" disabled>基于Spring Security+JWT登录登出</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="complete" disabled>角色访问控制，动态路由</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="complete" disabled>用户管理：提供用户的相关配置，新增用户后，默认密码为123456</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="complete" disabled>角色管理：对权限与菜单进行分配，可根据部门设置角色的数据权限</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="complete" disabled>菜单管理：已实现菜单动态路由，后端可配置化，支持多级菜单</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>部门管理：可配置系统组织架构，树形表格展示</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>岗位管理：配置各个部门的职位</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>字典管理：可维护常用一些固定的数据，如：状态，性别等</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>系统日志：记录用户操作日志与异常日志，方便开发人员定位拍错</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>SQL监控：采用druid 监控数据库访问性能，默认用户名admin，密码123456</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>定时任务：整合Quartz做定时任务，加入任务日志，任务运行情况一目了然</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>代码生成：高灵活度生成前后端代码，减少大量重复的工作任务</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>邮件工具：配合富文本，发送html格式的邮件</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>服务监控：监控服务器的负载情况</Checkbox>
            </Row>
            <Row>
                <Checkbox v-model="unfinished" disabled>运维管理：一键部署你的应用</Checkbox>
            </Row>
        </Card>
    </div>
</template>

<script>
export default {
  name: 'progress_page',
  components: {
  },
  data () {
    return {
      complete: true,
      unfinished: false

    }
  },
  methods: {
  },
  mounted () {
  }
}
</script>

<style>

</style>
