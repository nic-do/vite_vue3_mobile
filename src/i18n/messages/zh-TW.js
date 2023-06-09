const options = {
  default: {
    nav: {
      title: 'tw标题',
      leftText: '返回'
    }
  },
  login: {
    nav: {
      title: 'tw登录',
      leftText: '返回'
    },
    input: {
      name: {
        text: '姓名',
        placeholder: '请输入姓名'
      },
      pwd: {
        text: '密码',
        placeholder: '请输入密码'
      }
    },
    button: {
      login: 'tw登录'
    },
    dialog: {
      title: 'tw提示'
    }
  },
  main: {
    nav: {
      title: 'tw首页',
      leftText: '返回'
    },
    button: {
      title: {
        username: '名字',
        password: '密码'
      },
      placeholder: {
        username: '名字',
        password: '密码'
      }
    }
  },
  common: {
    dialog: 'tw弹窗',
    username: '用户名',
    password: '密码',
    save: '保存',
    edit: '编辑',
    update: '更新',
    delete: '删除',
    forever: '永久',
    expired: '过期',
    pageUnSetError: '页面没有内容'
  }
}
export default options
