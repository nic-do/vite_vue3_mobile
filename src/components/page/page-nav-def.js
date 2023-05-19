const config = function (options) {
  let data = {
    show: true,
    fixed: true,
    placeholder: true,
    border: false,
    safeAreaInsetTop: true,

    clickable: true,
    leftArrow: true,

    zIndex: 100,
    title: '',
    leftText: '',
    clickLeft: null, //function
    clickRight: null //function
  }
  if (options) {
    Object.assign(data, options)
  }
  return data
}
export default { config }
