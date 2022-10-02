"ui";

// UI
ui.layout(
  <vertical h="*" padding="8">
    <text text="NCWU钉钉打卡" textSize="24sp" gravity="center_horizontal" />
    <text text="By AkagiYui" textSize="22sp" gravity="center_horizontal" />
    <text text="当前版本于2022年10月2日仍可使用" textSize="20sp" gravity="center_horizontal" />
    <text text="该脚本免费开源，如果你是购买获得，请立即退款并报警！" textSize="18sp" gravity="center_horizontal" />
    <text autoLink="all" text="开源地址：https://github.com/AkagiYui/NCWUDingtalkDaily" ellipsize="marquee"/>
    <horizontal>
      <text text="开源地址" textSize="18sp" />
      <input inputType="textUri" singleLine="true" text="https://github.com/AkagiYui/NCWUDingtalkDaily" textSize="18sp"/>
    </horizontal>
    <text text="仔细阅读使用说明：" textSize="16sp"/>
    <text text="1. 脚本鲁棒性较低，请认真填写所有内容！" />
    <horizontal>
      <text text="学号" textSize="16sp" />
      <text text="*" textColor="red" textSize="16sp" />
      <text text="：" textSize="16sp" />
      <input id="studentIDTextBox" inputType="number" singleLine="true" w="*" hint="请输入学号"/>
    </horizontal>
    <horizontal>
      <text text="姓名" textSize="16sp" />
      <text text="*" textColor="red" textSize="16sp" />
      <text text="：" textSize="16sp" />
      <input id="nameTextBox" inputType="text" singleLine="true" w="*" hint="请输入姓名"/>
    </horizontal>
    <horizontal>
      <text text="手机号：" textSize="16sp" />
      <input id="phoneNumberTextBox" inputType="phone" singleLine="true" w="*" hint="留空将随机生成"/>
    </horizontal>
    <horizontal>
      <text text="2. 打开无障碍服务→"/>
      <Switch id="autoServiceSwitch" text="无障碍服务" checked="{{auto.service != null}}" gravity="right" w="*"/>
    </horizontal>
    <text text="3. 确保钉钉语言为简体中文"/>
    <text text="4. 创建一个相册，用于存放打卡图片，脚本会在你指定名称的相册中选择第一张图片作为核酸检测记录图片"/>
    <horizontal>
      <text text="相册名" textSize="16sp" />
      <text text="*" textColor="red" textSize="16sp" />
      <text text="：" textSize="16sp" />
      <input id="albumNameTextBox" inputType="text" singleLine="true" w="*" hint="请输入相册名"/>
    </horizontal>
    <text text="5. 记得保存↓"/>
    <button id="saveButton" text="保存" w="*"/>
    <frame h="*" w="*">
      <button id="runButton" text="开始运行" layout_gravity="bottom" h="auto"/>
    </frame>
  </vertical>
);

// 配置读写器
let s = storages.create("DingtalkDaily");
let myStorage = {
  getStudentID: () => s.get("studentID", ""),
  setStudentID: (studentID) => s.put("studentID", studentID),
  getName: () => s.get("name", ""),
  setName: (name) => s.put("name", name),
  getPhoneNumber: () => s.get("phoneNumber", ""),
  setPhoneNumber: (phoneNumber) => s.put("phoneNumber", phoneNumber),
  getAlbumName: () => s.get("albumName", ""),
  setAlbumName: (albumName) => s.put("albumName", albumName),
};

// 无障碍服务开关
ui.autoServiceSwitch.on("check", (checked) => {
  if (checked && auto.service == null) {
      app.startActivity({action: "android.settings.ACCESSIBILITY_SETTINGS"});
  }
  if (!checked && auto.service != null) {
      auto.service.disableSelf();
  }
});
// 按钮事件
ui.saveButton.click(() => {
  myStorage.setStudentID(ui.studentIDTextBox.text());
  myStorage.setName(ui.nameTextBox.text());
  myStorage.setPhoneNumber(ui.phoneNumberTextBox.text());
  myStorage.setAlbumName(ui.albumNameTextBox.text());
});
ui.runButton.click(() => threads.start(mainScript));

// 读取配置
ui.studentIDTextBox.setText(myStorage.getStudentID());
ui.nameTextBox.setText(myStorage.getName());
ui.phoneNumberTextBox.setText(myStorage.getPhoneNumber());
ui.albumNameTextBox.setText(myStorage.getAlbumName());


function mainScript() {
  // 显示控制台
  let utils = require("./utils.js");
  utils.resetConsole();
  console.setTitle("NCWUDingtalkDaily");

  // 读取配置
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
  while (true) {
    sleep(1000);

    // 打开钉钉
    let t = currentPackage();
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
    t = text("工作台").findOnce();
    if (t && !id("tv_org_name").findOnce()) {
      console.log("场景", "找到工作台按钮并且不在工作台");
      t = utils.findClickableParent(t);
      if (t) {
        t.click();
      } else {
        console.error("找不到可点击对象");
      }
      continue;
    }

    // 检查 企业名称
    t = id("tv_org_name").findOnce(); // 在工作台
    if (t && id("tv_app_center").findOnce()) {
      console.log("场景", "工作台");
      if (t.text() !== "华北水利水电大学") {
        console.log("当前企业", t.text());
        console.log("切换", "企业列表");
        t.click(); // 打开企业列表
        continue;
      }
    }

    // 选择企业
    t = text("创建个人空间").findOnce();
    if (t && id("ift_selected").findOnce()) {
      console.log("场景", "企业列表");
      let t1 = text("华北水利水电大学").findOnce();
      if (t1) {
        console.log("切换", "华北水利水电大学");
        t1 = utils.findClickableParent(t1);
        if (t1) {
          t1.click();
        } else {
          console.error("找不到可点击对象");
        }
      }
      continue;
    }

    // 点击 本科生每日健康打卡
    t = text("本科生每日健康打卡").findOnce();
    if (t && !text("完成情况").findOnce() && !text("提交").findOnce()) {
      console.log("点击", "本科生每日健康打卡");
      t = utils.findClickableParent(t);
      if (t) {
        t.click();
      } else {
        console.error("找不到可点击对象");
      }
      continue;
    }
    if (t && text("今天").findOnce()) {
      console.log("场景", "每日完成情况页面");
      console.log("点击", "今天");
      t = text("今天").findOnce();
      t = utils.findClickableParent(t);
      if (t) {
        t.click();
      } else {
        console.error("找不到可点击对象");
      }
      continue;
    }
    if (t && text("提交").findOnce()) {
      console.log("场景", "问卷填写页面");
    }
  }
  console.show(true);
}
