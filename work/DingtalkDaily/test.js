console.verbose(
  id("tv_app_center").findOnce()
)
//console.verbose(text("工作台").findOnce())
console.log(new Date().getDate())
console.log(textMatches("日期：.*\\d\\d月\\d\\d日.*").findOnce())