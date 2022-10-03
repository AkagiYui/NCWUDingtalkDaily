module.exports = () => {
  let QUESTIONNAIRE_NAME = "本科生每日健康打卡"; // 问卷名称
  let ORGANIZATION_NAME = "华北水利水电大学"; // 组织名称

  // 显示控制台
  let utils = require("./utils.js");
  utils.resetConsole();
  console.setTitle("NCWUDingtalkDaily");
  
  // 读取配置
  let myStorage = require("./storage.js");
  let studentID = myStorage.getStudentID();
  let name = myStorage.getName();
  let albumName = myStorage.getAlbumName();
  if (!(studentID && name && albumName)) {
    console.error("请填写所有内容并保存！");
    return;
  }
  if (auto.service === null) {
    console.error("请开启无障碍服务！");
    return;
  }
  console.log("学号：" + studentID);
  console.log("姓名：" + name);
  let phoneNumber = myStorage.getPhoneNumber();
  if (!phoneNumber) {
    phoneNumber = utils.random(13000000000, 19999999999);
    console.log("未填写手机号，随机生成：" + phoneNumber);
    phoneNumber = phoneNumber.toString();
  } else {
    console.log("手机号：" + phoneNumber);
  }
  console.log("相册名：" + albumName);

  console.log("开始运行");
  device.wakeUp(); // 唤醒设备
  // eslint-disable-next-line no-constant-condition
  while (true) {
    sleep(1000);
    let t;

    // 打开钉钉
    t = currentPackage();
    if (t !== "com.alibaba.android.rimet") {
      console.log("场景", t);
      threads.start(() => {
        console.log("尝试启动钉钉");
        if (!app.launchPackage("com.alibaba.android.rimet")) {
          console.error("启动钉钉失败，请自行打开钉钉");
        }
      })
      continue;
    }

    // 切换到 工作台
    t = className("android.widget.TextView").id("home_bottom_tab_text").text("工作台").findOnce();
    if (t && !id("tv_org_name").findOnce()) {
      console.log("场景", "找到工作台按钮并且不在工作台");
      t = utils.findClickableParent(t);
      if (t) {
        console.log("点击", "工作台");
        t.click();
      } else {
        console.error("找不到可点击对象");
      }
      continue;
    }

    // 检查 企业名称
    t = className("android.widget.TextView").id("tv_org_name").findOnce(); // 企业名称
    if (t && className("android.widget.TextView").id("tv_app_center").findOnce()) {
      console.log("场景", "工作台");
      if (t.text() !== ORGANIZATION_NAME) {
        console.log("当前企业", t.text());
        console.log("切换", "企业列表");
        t.click(); // 打开企业列表
        continue;
      }

      // 点击 本科生每日健康打卡
      t = className("android.view.View").text(QUESTIONNAIRE_NAME).findOnce();
      if (t) {
        console.log("点击", "本科生每日健康打卡");
        t = utils.findClickableParent(t);
        if (t) {
          t.click();
        } else {
          console.error("找不到可点击对象");
        }
        continue;
      }
    }

    // 选择企业
    t = className("android.widget.TextView").id("tv_title").text("创建个人空间").findOnce();
    if (t && className("android.widget.TextView").id("ift_selected").findOnce()) {
      console.log("场景", "企业列表");
      let t1 = text(ORGANIZATION_NAME).findOnce();
      if (t1) {
        console.log("切换", ORGANIZATION_NAME);
        t1 = utils.findClickableParent(t1);
        if (t1) {
          t1.click();
        } else {
          console.error("找不到可点击对象");
        }
      }
      continue;
    }

    // 点击 今天
    t = className("android.view.View").text("完成情况").findOnce();
    if (t && className("android.view.View").text("今天").findOnce()) {
      console.log("场景", "每日完成情况页面");
      console.log("点击", "今天");
      t = className("android.view.View").text("今天").findOnce();
      t = utils.findClickableParent(t);
      if (t) {
        t.click();
      } else {
        console.error("找不到可点击对象");
      }
      continue;
    }

    t = className("android.widget.EditText").text(QUESTIONNAIRE_NAME).findOnce();
    // 是否有 提交 按钮
    if (t && className("android.widget.Button").text("提交").findOnce()) {
      console.log("场景", "问卷填写页面");

      // 识别日期
      t = className("android.view.View").textMatches("日期：.*\\d\\d月\\d\\d日.*").findOnce();
      if (t) {
        console.log("找到", t.text());
        let date = t.text().split("：")[1];
        date = date.split(" ")[0];
        let realDate = new Date();
        realDate = utils.add0(realDate.getMonth() + 1, 2) + "月" + utils.add0(realDate.getDate(), 2) + "日";
        if (date !== realDate) {
          console.warn("日期错误", date, realDate);
          back();
          continue;
        }
      }

      // 填写学号
      t = utils.findNearestEditalbeTextBoxInQuestionnaireByName("学号");
      if (t) {
        console.log("当前学号", t.text());
        if (t.text() !== studentID) {
          console.log("填写学号", studentID);
          t.setText(studentID);
        }
      }

      // 填写姓名
      t = utils.findNearestEditalbeTextBoxInQuestionnaireByName("姓名");
      if (t) {
        console.log("当前姓名", t.text());
        if (t.text() !== name) {
          console.log("填写姓名", name);
          t.setText(name);
        }
      }

      // 填写手机号
      t = utils.findNearestEditalbeTextBoxInQuestionnaireByName("手机号码");
      if (t) {
        console.log("当前手机号", t.text());
        if (t.text() !== phoneNumber) {
          console.log("填写手机号", phoneNumber);
          t.setText(phoneNumber);
        }
      }

    }
    // 问卷填写完成页面
    if (t && className("android.view.View").text("修改").findOnce()) {
      console.log("场景", "问卷填写完成页面");
      // 日期是否正确
      t = className("android.view.View").textMatches("日期：.*\\d\\d月\\d\\d日.*").findOnce();
      if (t) {
        console.log("找到", t.text());
        let date = t.text().split("：")[1];
        date = date.split(" ")[0];
        let realDate = new Date();
        realDate = utils.add0(realDate.getMonth() + 1, 2) + "月" + utils.add0(realDate.getDate(), 2) + "日";
        console.verbose("识别日期", date);
        console.verbose("当前日期", realDate);
        if (date !== realDate) {
          console.warn("日期错误", date, realDate);
          back();
          continue;
        } else {
          console.log("已完成打卡");
          break;
        }
      }
    }
  }
  console.show(true);
}
