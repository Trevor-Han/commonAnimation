// 第一屏图片滚动
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