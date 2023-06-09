const options = {
  default: {
    nav: {
      title: 'title',
      leftText: 'back'
    }
  },
  login: {
    nav: {
      title: 'login',
      leftText: 'back'
    },
    input: {
      name: {
        text: 'name',
        placeholder: 'please enter name'
      },
      pwd: {
        text: 'password',
        placeholder: 'please enter password'
      }
    },
    button: {
      login: 'login'
    },
    dialog: {
      title: 'alert'
    }
  },
  main: {
    nav: {
      title: 'main',
      leftText: 'back'
    },
    button: {
      title: {
        username: 'username',
        password: 'password'
      },
      placeholder: {
        username: 'username',
        password: 'password'
      }
    }
  },
  common: {
    dialog: 'dialog',
    username: 'username',
    password: 'password',
    save: 'Save',
    edit: 'Edit',
    update: 'Update',
    delete: 'Delete',
    forever: 'Forever',
    expired: 'Expired'
  }
}
export default options
