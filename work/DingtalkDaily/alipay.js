/* eslint-disable no-undef */

let exec = () => {
  images.requestScreenCapture(false); // 请求截图权限

  let utils = require("./utils.js");
  let tryLaunchTimes = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    sleep(1000);
    let t;

    // 打开钉钉
    t = currentPackage();
    if (t !== "com.eg.android.AlipayGphone") {
      console.log("场景", t);
      threads.start(() => {
        if (tryLaunchTimes >= 5) {
          console.warn("多次启动支付宝失败", "回到桌面");
          // eslint-disable-next-line no-undef
          home(); // 回到桌面
          tryLaunchTimes = 0;
        } else {
          console.log("尝试启动支付宝");
          tryLaunchTimes++;
        }
        if (!app.launchPackage("com.eg.android.AlipayGphone")) {
          console.error("启动支付宝失败，请自行打开支付宝");
        }
      })
      continue;
    }
    tryLaunchTimes = 0;

    t = currentActivity();
    if (t === "com.eg.android.AlipayGphone.AlipayLogin") {
      console.log("场景", "支付宝首页");

      t = id("com.alipay.android.tablauncher:id/tab_description").text("首页").findOnce();
      if (t) {
        console.log("场景", "不在支付宝首tab");
        utils.tryClick(t, "首页");
        continue;
      }

      t = id("com.alipay.android.phone.openplatform:id/app_text").text("健康码").findOnce();
      if (t) {
        console.log("场景", "找到 健康码");
        utils.tryClick(t, "健康码");
        continue;
      }

      
    }
    if (t === "com.alipay.mobile.nebulax.integration.mpaas.activity.NebulaActivity$Main") {
      console.log("场景", "小程序");

      t = id("com.alipay.mobile.nebula:id/h5_tv_title").findOnce();
      if (t && t.text() === "豫康码") {
        console.log("场景", "豫康码小程序");
        t = className("android.view.View").text("核酸报告").findOnce();
        if (t) {
          console.log("场景", "找到 核酸报告");
          utils.tryClick(t, "核酸报告");
          continue;
        }

      } else if (t && t.text() === "河南核酸检测") {
        console.log("场景", "河南核酸检测查询");
        t = utils.clickIfExist(className("android.widget.Button").text("本人查询"));
        if (!t) {
          t = className("android.view.View").text("核酸检测机构").findOnce();
          if (t) {
            console.log("场景", "已查询到检测结果，尝试截图");
            console.hide();
            sleep(200);
            let path = files.cwd() + '/screenshots/';
            files.ensureDir(path)
            let filename = path + `${new Date().getTime()}.png`;
            images.captureScreen(filename); // 截图并保存到脚本目录下
            sleep(500);
            console.show();
            media.scanFile(filename); // 加到媒体库
            utils.clickIfExist(className("android.widget.TextView").desc("关闭"));
            home();
            break;
          }
        }
      }
    }
  }
}

// module.exports = exec;
exec();