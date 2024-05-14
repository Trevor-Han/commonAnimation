// 第一屏图片滚动,第二屏图片同步变大
ScrollTrigger.create({
  trigger: '.section1',
  start: 'top top',
  end: '+=1000',
  scrub: true,
  animation: gsap.timeline().fromTo('.kv-content', { scale: 1 }, { scale: 0.5 })
    .fromTo('.summary-content', { width: '50%', height: '50vh' }, { width: '100%', height: '100vh' }, '<')
})

// 第二屏视频播放
ScrollTrigger.create({
  // 触发元素第二屏
  trigger: '.section2',
  // 起始位置
  start: 'top top',
  // 结束位置
  end: '+=5000',
  // 显示调试信息
  // markers: true,
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
  animation: gsap.timeline()
    .to('.text1', { top: '20rem', opacity: 1 })
    .to('.text1', { top: 0, opacity: 0 })
    .to('.text2', { top: '27rem', opacity: 1 })
    .to('.text2', { top: '24rem', opacity: 0 })
})

// 第三屏,图片滚入
ScrollTrigger.create({
  trigger: '.section3',
  start: 'top top',
  end: '+=1000',
  pin: true,
  scrub: true,
  // markers: true,
})
ScrollTrigger.create({
  trigger: '.color-img',
  start: 'top-=500',
  end: '+=3000',
  scrub: true,
  animation: gsap.timeline()
    .fromTo('.color1', { 'margin-left': '90rem', opacity: 0 }, { 'margin-left': 0, opacity: 1 }, '<')
    .fromTo('.color2', { 'margin-left': '100rem', scale: 1.3 }, { 'margin-left': 0, scale: 1 }, '<')
    .fromTo('.color3', { 'margin-left': '110rem', scale: 1.6 }, { 'margin-left': 0, scale: 1 }, '<')
    .fromTo('.color4', { 'margin-left': '120rem', scale: 1.9 }, { 'margin-left': 0, scale: 1 }, '<')
    .fromTo('.color1', { 'margin-left': '0', opacity: 1 }, { 'margin-left': '-120rem', opacity: 1 }, '>')
    .fromTo('.color2', { 'margin-left': '0', scale: 1 }, { 'margin-left': '-110rem', scale: 1.3 }, '<')
    .fromTo('.color3', { 'margin-left': '0', scale: 1 }, { 'margin-left': '-100rem', scale: 1.6 }, '<')
    .fromTo('.color4', { 'margin-left': '0', scale: 1 }, { 'margin-left': '-90rem', scale: 1.9 }, '<')
})

// 第四屏
ScrollTrigger.create({
  trigger: '.parallel',
  start: 'top top',
  end: '+=3000',
  pin: true,
  scrub: true,
  animation: gsap.timeline()
    .fromTo('.title', { opacity: 1 }, { opacity: 0 })
    .fromTo('.video1', { 'margin-top': '100%' }, {
      'margin-top': 0, onStart: function () {
        const video1 = document.querySelector('.page1 .video1')
        video1.currentTime = 0
        video1.play()
      }
    })
    .fromTo('.info', { opacity: 0 }, { opacity: 1 })
    .fromTo('.page1', { 'left': 0 }, { 'left': '-128rem' }, '>')
    .fromTo('.page2', { 'left': '128rem' }, {
      'left': 0, onStart: function () {
        const video2 = document.querySelector('.page2 .video2')
        video2.currentTime = 0
        video2.play()
      }
    }, '<')
})
