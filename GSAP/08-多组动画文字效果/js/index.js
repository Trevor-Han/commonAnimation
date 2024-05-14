// 第一屏图片滚动,第二屏图片同步变大
// gsap.fromTo('.kv-content', { scale: 1 }, { scale: 0.5 })
let action1 = gsap.timeline().fromTo('.kv-content', { scale: 1 }, { scale: 0.5 })
  .fromTo('.summary-content', { width: '50%', height: '50vh' }, { width: '100%', height: '100vh' }, '<')

ScrollTrigger.create({
  trigger: '.section1',
  start: 'top top',
  end: '+=1000',
  scrub: true,
  animation: action1
})

// 第二屏视频播放
let action2 = gsap.timeline()
  .to('.text1', { top: '20rem', opacity: 1 })
  .to('.text1', { top: 0, opacity: 0 })
  .to('.text2', { top: '27rem', opacity: 1 })
  .to('.text2', { top: '24rem', opacity: 0 })
ScrollTrigger.create({
  // 触发元素第二屏
  trigger: '.section2',
  // 起始位置
  start: 'top top',
  // 结束位置
  end: '+=5000',
  // 显示调试信息
  markers: true,
  // 让screen2改为固定定位
  pin: true,
  scrub: true,
  // ScrollTrigger的进度更改时,会调用的回调
  onUpdate(self) {
    const summary = document.querySelector('.summary')
    try {
      // 视频的播放进度随着滚动条变化
      // self.progress滚动进度
      // summary.duration视频总时长
      summary.currentTime = self.progress * summary.duration
    } catch (e) {
      console.log(e)
    }
  },
  animation: action2
})