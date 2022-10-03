let running = false;

module.exports = () => {
  if (running) {
    return;
  }
  running = true;

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
    running = false;
    return;
  }
  if (auto.service === null) {
    console.error("请开启无障碍服务！");
    running = false;
    return;
  }
  console.verbose("学号：" + studentID);
  console.verbose("姓名：" + name);
  let phoneNumber = myStorage.getPhoneNumber();
  if (!phoneNumber) {
    phoneNumber = utils.random(13000000000, 19999999999);
    console.log("未填写手机号，随机生成：" + phoneNumber);
    phoneNumber = phoneNumber.toString();
  } else {
    console.verbose("手机号：" + phoneNumber);
  }
  console.verbose("相册名：" + albumName);

  console.log("开始运行");
  device.wakeUp(); // 唤醒设备

  let tryLaunchTimes = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    sleep(1000);
    let t;

    // 打开钉钉
    t = currentPackage();
    if (t !== "com.alibaba.android.rimet") {
      console.log("场景", t);
      threads.start(() => {
        if (tryLaunchTimes >= 5) {
          console.warn("多次启动钉钉失败", "回到桌面");
          // eslint-disable-next-line no-undef
          home();
          tryLaunchTimes = 0;
        } else {
          console.log("尝试启动钉钉");
          tryLaunchTimes++;
        }
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
      t = utils.findClickableReverse(t);
      if (t) {
        console.log("点击", "工作台");
        t.click();
      } else {
        console.error("未发现", "可点击对象");
      }
      continue;
    }

    // 退出问卷列表页面
    if (className("android.view.View").text("创建").findOnce()
        && className("android.view.View").text("填写").findOnce()
        && className("android.view.View").text("统计").findOnce()) {
      console.verbose("场景", "问卷列表页面");
      back();
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
        t = utils.findClickableReverse(t);
        if (t) {
          t.click();
        } else {
          console.error("未发现", "可点击对象");
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
        t1 = utils.findClickableReverse(t1);
        if (t1) {
          t1.click();
        } else {
          console.error("未发现", "可点击对象");
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
      t = utils.findClickableReverse(t);
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

      // 点击 取消 按钮
      t = className("android.widget.Button").text("取消").findOnce();
      if (t) {
        console.log("点击", "取消");
        t = utils.findClickableReverse(t);
        if (t) {
          t.click();
        } else {
          console.error("找不到可点击对象");
        }
        continue;
      }

      // 识别日期
      t = className("android.view.View").textMatches("日期：.*\\d\\d月\\d\\d日.*").findOnce();
      if (t) {
        console.verbose("发现", t.text());
        let date = t.text().split("：")[1];
        date = date.split(" ")[0];
        let realDate = new Date();
        realDate = utils.add0(realDate.getMonth() + 1, 2) + "月" + utils.add0(realDate.getDate(), 2) + "日";
        if (date !== realDate) {
          console.error("日期错误", date, realDate);
          back();
          continue;
        }
      }

      // 填写文本框
      let textBoxList = [
        ["学号", studentID],
        ["姓名", name],
        ["手机号码", phoneNumber],
      ]
      for (let tuple of textBoxList) {
        t = utils.findNearestEditableTextBoxInQuestionnaireByName(tuple[0]);
        if (t) {
          if (t.text() !== tuple[1]) {
            console.log("当前" + tuple[0], t.text());
            console.log("填写" + tuple[0], tuple[1]);
            t.setText(tuple[1]);
          }
        }
      }

      // 单选题
      let radioQuestions = [
        ["目前是否在校", " 是"],
        ["过去48小时是否进行了核酸检测", " 是"],
      ]
      for (let q of radioQuestions) {
        t = utils.clickRadioByText(q[0], q[1]);
        if (t) {
          console.log("选择", q[0], q[1]);
        }
      }

      // 添加图片
      t = className("android.view.View").text("请上传48小时核酸证明文件").findOnce(); // 包含Image控件的父控件
      if (t) {
        // 找到该问题的控件
        let pictureSelectButton = null; // Image控件
        while (t) {
          let t1 = t.find(className("android.widget.Image").clickable(false));
          for (let t2 of t1) {
            let b = t2.bounds();
            if (b.width() > 50 && b.width() < 100) {
              pictureSelectButton = t2;
              break;
            }
          }
          if (pictureSelectButton) {
            break;
          } else {
            t = t.parent();
          }
        }

        if (!pictureSelectButton) {
          console.error("未发现", "选择图片控件");
        } else {
          // 找到添加图片的按钮
          console.verbose("发现", "添加图片按钮");

          let imageSelected = false; // 是否已添加图片
          let addedImages = t.find(className("android.widget.Image").clickable(true));
          console.log("已添加图片数量", addedImages.length);
          for (let t1 of addedImages) {
            let b = t1.bounds();
            if (b.width() > 100) {
              imageSelected = true;
              break;
            }
          }

          if (!imageSelected) {
            console.verbose("未添加图片");
            pictureSelectButton.click();
            continue;
          } else {
            console.verbose("已添加图片");
          }
        }
      }

      // 获取地址
      t = className("android.view.View").text("获取").findOnce();
      if (t && !className("android.view.View").text("地点微调").findOnce()) {
        console.verbose("点击", "获取");
        t.click();
        continue;
      }
    }
    // 问卷填写完成页面
    if (t && className("android.view.View").text("修改").findOnce()) {
      console.log("场景", "问卷填写完成页面");
      // 日期是否正确
      t = className("android.view.View").textMatches("日期：.*\\d\\d月\\d\\d日.*").findOnce();
      if (t) {
        console.verbose("找到", t.text());
        let date = t.text().split("：")[1];
        date = date.split(" ")[0];
        let realDate = new Date();
        realDate = utils.add0(realDate.getMonth() + 1, 2) + "月" + utils.add0(realDate.getDate(), 2) + "日";
        console.verbose("识别日期", date);
        console.verbose("当前日期", realDate);
        if (date !== realDate) {
          console.error("日期错误", date, realDate);
          back();
          continue;
        } else {
          console.log("已完成打卡");
          break;
        }
      }
    }

    // eslint-disable-next-line no-undef
    t = currentActivity();
    if (t === "com.alibaba.laiwang.photokit.picker.ImageFolderDialog") {
      // 选择相册
      console.verbose("场景", "相册选择");
      let albumList = id("lv_folder_list").findOnce();
      if (albumList !== null) {
        let t1 = id("tv_folder_name").textMatches(albumName + "\\(\\d+\\)").findOnce();
        if (t1) {
          console.log("发现", albumName);
          t1 = utils.findClickableReverse(t1);
          if (t1) {
            t1.click();
          } else {
            console.error("未发现", "可点击对象");
          }
        } else {
          console.error("未发现", albumName);
          let b = albumList.bounds();
          utils.swipeRandom(b.centerX(), b.bottom - 300, b.centerX(), b.top + 10, 700);
        }
      }
    } else if (t === "com.alibaba.android.dingtalk.photoui.activitys.AlbumActivity") {
      console.verbose("场景", "相册");
      t = id("tv_image_folder").findOnce();
      if (t && t.text() !== albumName) {
        console.verbose("点击", "相册名");
        t.click();
        continue;
      }

      // 选择第一张图片
      t = id("album_gv").findOnce();
      if (t) {
        t = id("album_item_media_cbx_icon").desc("未选中").findOnce();
        if (t) {
          console.log("点击", "第一张图片");
          t.click();
          sleep(1000);
        }
        t = id("btn_send").findOnce();
          if (t) {
            t.click();
            continue;
          }
      }
    }

    t = className("android.view.View").textStartsWith("你已成功提交" + QUESTIONNAIRE_NAME).findOnce();
    if (t && className("android.view.View").text("查看你提交的表单").findOnce()) {
      console.verbose("场景", "问卷提交成功");
      console.log("已完成打卡");
      break;
    }

    // 点击 提交 按钮
    t = className("android.widget.Button").text("提交").findOnce();
    if (t) {
      console.verbose("点击", "提交");
      t.click();
      continue;
    }
  }
  console.show(true);
  running = false;
  ui.finish();
  exit();
}
