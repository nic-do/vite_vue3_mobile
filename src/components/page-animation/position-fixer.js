'use strict'
let lockTop = -999999999
export default class PositionFixer {
  constructor({ clsLock = 'vue-page-animation-animation-lock' }) {
    this.clsLock = clsLock
    lockTop = -999999999
    this.setScrollingElementFlag = true
    this.elBody = document.body || document.getElementsByTagName('body')[0]
  }

  // 锁定滚动
  lockScroll() {
    this.elBody.classList.add(this.clsLock)
    if (this.setScrollingElementFlag) {
      if (window.document.scrollingElement) {
        window.document.scrollingElement.classList.add(this.clsLock)
      }
      if (!this.scrollLoadMore) {
        this.scrollLoadMore = this.scrollLoad

        if (window.document.scrollingElement) {
          lockTop = window.document.scrollingElement.scrollTop
        }

        window.addEventListener('scroll', this.scrollLoadMore, true)
      }
    }
  }
  scrollLoad() {
    //为什么scrollTop会跳 ？？
    if (window.document.scrollingElement) {
      if (lockTop != -999999999 && lockTop != window.document.scrollingElement.scrollTop) {
        window.document.scrollingElement.scrollTop = lockTop
        lockTop = -999999999
      }
    }
  }
  // 解锁滚动
  unlockScroll() {
    this.elBody.classList.remove(this.clsLock)

    if (this.setScrollingElementFlag) {
      if (window.document.scrollingElement) {
        window.document.scrollingElement.classList.remove(this.clsLock)
      }
      lockTop = -999999999
      if (this.scrollLoadMore) {
        var temp = this.scrollLoadMore
        this.scrollLoadMore = null
        window.removeEventListener('scroll', temp)
      }
    }
  }

  // 修正元素的位置
  fixElementPos($el, pos, func) {
    $el.org_top = $el.style.top
    $el.style.top = 0 - pos + 'px'
    return {
      clear(isFixWindowScroll, scrollY) {
        const top = $el.org_top
        $el.style.top = top
        $el.org_top = null
        if (isFixWindowScroll) {
          var yy = scrollY != null ? scrollY : pos || 0
          window.scrollTo(0, scrollY != null ? scrollY : pos || 0)
        }
      }
    }
  }
}
