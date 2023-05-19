//注：这里的默认值是 取自 vant的dark 模式
const config = function (type, vars) {
  if (!vars) {
    vars = themeVars
  }
  const data = `.van-theme-${type} {
    --van-slider-inactive-background: ${vars.sliderInactiveBackground};
    --van-calendar-month-mark-color: ${vars.calendarMonthMarkColor};
    --van-calendar-day-disabled-color: ${vars.calendarDayDisabledColor};
    --van-picker-loading-mask-color: ${vars.pickerLoadingMaskColor};
    --van-picker-mask-color: ${vars.pickerMaskColor};
    --van-button-plain-background: ${vars.buttonPlainBackground};
    --van-switch-background: ${vars.switchBackground};
    --van-number-keyboard-background: ${vars.numberKeyboardBackground};
    --van-number-keyboard-key-background: ${vars.numberKeyboardKeyBackground};
    --van-number-keyboard-key-active-color: ${vars.numberKeyboardKeyActiveColor};
    --van-text-color: ${vars.textColor};
    --van-text-color-2:${vars.textColor2};
    --van-text-color-3: ${vars.textColor3};
    --van-border-color: ${vars.borderColor};
    --van-active-color: ${vars.activeColor};
    --van-background: ${vars.background};
    --van-background-2: ${vars.background2};
    --van-background-3: ${vars.background3};
  }`
  return data
}
const themeVars = function () {
  return {
    sliderInactiveBackground: 'var(--van-background-3)',
    ///// 这种带变量的一般不动
    numberKeyboardBackground: 'var(--van-gray-8)',
    numberKeyboardKeyBackground: 'var(--van-gray-7)',
    numberKeyboardKeyActiveColor: 'var(--van-gray-6)',
    /////
    ////
    calendarDayDisabledColor: 'var(--van-gray-7)',
    calendarMonthMarkColor: 'rgba(100, 101, 102, 0.2)',
    /////
    pickerLoadingMaskColor: 'rgba(0, 0, 0, 0.6)',
    pickerMaskColor: `linear-gradient(180deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1)),
linear-gradient(0deg, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.1))`,
    /////
    buttonPlainBackground: 'transparent',
    /////
    switchBackground: 'rgba(120, 120, 128, 0.32)',

    textColor: '#f5f5f5;',
    textColor2: '#707070;',
    textColor3: '#4d4d4d;',
    borderColor: '#3a3a3c',
    activeColor: '#3a3a3c',
    background: '#000',
    background2: '#1c1c1e',
    background3: '#37363b'
  }
}
export default { config, themeVars }
