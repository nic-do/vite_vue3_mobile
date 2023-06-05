function FileSelector() {
  let selector = this

  let noFileSelectedCallback = function () {}

  selector.selectSingleFile = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure
    }

    selectFile(callback)
  }
  selector.selectMultipleFiles = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure
    }

    selectFile(callback, true)
  }
  selector.selectDirectory = function (callback, failure) {
    if (failure) {
      noFileSelectedCallback = failure
    }

    selectFile(callback, true, true)
  }

  selector.accept = '*.*'

  function selectFile(callback, multiple, directory) {
    callback = callback || function () {}

    let file = document.createElement('input')
    file.type = 'file'
    if (multiple) {
      file.multiple = true
    }

    if (directory) {
      file.webkitdirectory = true
    }

    file.accept = selector.accept

    file.onclick = function () {
      console.log('-----', 'file.onclick')
      file.clickStarted = true
    }

    document.body.onfocus = function () {
      console.log('-----', 'file.clickStarted')
      setTimeout(function () {
        if (!file.clickStarted) return
        file.clickStarted = false

        if (!file.value) {
          noFileSelectedCallback()
        }
      }, 500)
    }

    file.onchange = function () {
      if (multiple) {
        if (!file.files.length) {
          console.error('No file selected.')
          return
        }

        let arr = []
        Array.from(file.files).forEach(function (file) {
          file.url = file.webkitRelativePath
          arr.push(file)
        })
        callback(arr)
        return
      }

      if (!file.files[0]) {
        console.error('No file selected.')
        return
      }

      callback(file.files[0])

      file.parentNode.removeChild(file)
    }
    file.style.display = 'none'
    ;(document.body || document.documentElement).appendChild(file)
    fireClickEvent(file)
  }

  function getValidFileName(fileName) {
    if (!fileName) {
      fileName = 'file' + new Date().toISOString().replace(/:|\.|-/g, '')
    }

    let a = fileName
    a = a.replace(/^.*[\\\/]([^\\\/]*)$/i, '$1')
    a = a.replace(/\s/g, '_')
    a = a.replace(/,/g, '')
    a = a.toLowerCase()
    return a
  }
  function fireClickEvent(element) {
    if (typeof element.click === 'function') {
      console.log('----', 'element.click')
      //手机端无效
      element.click()
      return
    }

    if (typeof element.change === 'function') {
      console.log('----', 'element.change')
      element.change()
      return
    }

    if (typeof document.createEvent('Event') !== 'undefined') {
      let event = document.createEvent('Event')

      if (typeof event.initEvent === 'function' && typeof element.dispatchEvent === 'function') {
        console.log('----', 'createEvent')
        event.initEvent('click', true, true)
        element.dispatchEvent(event)
        return
      }
    }

    performEvent(element)
  }
  function performEvent(element) {
    try {
      let event = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      })
      element.dispatchEvent(event)
    } catch (e) {
      console.log('----', e)
    }
  }
}
export { FileSelector }
