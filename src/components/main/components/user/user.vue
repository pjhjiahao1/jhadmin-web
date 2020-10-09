<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="userAvatar"/>
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <!-- <DropdownItem name="message">
          消息中心<Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
        </DropdownItem> -->
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
export default {
  name: 'User',
  props: {
    userAvatar: {
      type: String,
      default: ''
    },
    messageUnreadCount: {
      type: Number,
      default: 0
    }
  },
  methods: {
    ...mapActions([
      'handleLogOut'
    ]),
    logout () {
      // 用户退出时保留最后操作页面
      this.$Modal.confirm({
        title: "确定注销并退出系统吗？",
        onOk: () => {
          this.handleLogOut().then(() => {
            let navList = this.$store.state.app.tagNavList
            let size = navList.length
            if (size > 1) {
              let arr1 = navList[0]
              let arr2 = navList[size-1]
              navList = []
              navList.push(arr1)
              navList.push(arr2)
              this.$store.state.app.tagNavList = navList
              localStorage.setItem("tagNaveList", JSON.stringify(navList));
            }
            this.$router.push({
              name: 'login'
            })
          })
        },
        closable: true
        
      });
    },
    message () {
      this.$router.push({
        name: 'message_page'
      })
    },
    handleClick (name) {
      switch (name) {
        case 'logout': this.logout()
          break
        case 'message': this.message()
          break
      }
    }
  }
}
</script>
