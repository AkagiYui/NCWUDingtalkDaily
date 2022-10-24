"ui";

// UI
ui.layout(
  <vertical h="auto" padding="8">
    <text text="NCWU钉钉打卡" textSize="24sp" gravity="center_horizontal" />
    <text text="By AkagiYui" textSize="22sp" gravity="center_horizontal" />
    <text text="当前版本于2022年10月25日可使用" textSize="18sp" gravity="center_horizontal" />
    <text text="仔细阅读使用说明：" textSize="16sp"/>
    <text text="0. 【音量+键】可强制停止脚本" textColor="red" />
    <text text="0. 运行前请【关闭钉钉】" textColor="red" />
    <text text="1. 脚本能力有限，请认真【填写所有内容】！" />
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
    <horizontal>
      <text text="3. 打开悬浮窗权限→"/>
      <Switch id="floatySwitch" text="悬浮窗权限" checked="false" gravity="right" w="*"/>
    </horizontal>
    <horizontal>
      <text text="4. 自动回到桌面→"/>
      <Switch id="goHomeSwitch" text="打卡完成回到桌面" checked="false" gravity="right" w="*"/>
    </horizontal>
    <text text="5. 确保钉钉语言为【简体中文】"/>
    <text text="6. 创建一个相册，用于存放打卡图片，脚本会在以下指定名称的相册中选择第一张图片作为核酸检测记录图片"/>
    <horizontal>
      <text text="相册名" textSize="16sp" />
      <text text="*" textColor="red" textSize="16sp" />
      <text text="：" textSize="16sp" />
      <input id="albumNameTextBox" inputType="text" singleLine="true" w="*" hint="请输入相册名"/>
    </horizontal>
    <text text="6. 从现在开始，每天直接点击【开始运行】即可" />
    <button id="runButton" text="开始运行" layout_gravity="bottom" h="auto"/>
    <text text="一些提示：" />
    <text text="1. 运行一次即可保存设置，以后使用无需再次填写。" />
    <text text="2. 在存储根目录创建名为dd的文件可在启动脚本时自动运行打卡。" />
    <text text="3. 该脚本暂时没有使用联网更新机制。" />
    <text text="4. apk直装版有一个常驻通知，你可以把脚本的通知权限关闭。" />
    <text text="该脚本免费开源，如果你是购买获得，请立即退款并报警！" textSize="18sp" gravity="center_horizontal" />
    <text autoLink="all" text="开源地址：https://github.com/AkagiYui/NCWUDingtalkDaily" ellipsize="marquee"/>
    <horizontal>
      <text text="开源地址" textSize="18sp" />
      <input inputType="textUri" singleLine="true" text="https://github.com/AkagiYui/NCWUDingtalkDaily" textSize="18sp"/>
    </horizontal>
  </vertical>
);
ui.floatySwitch.checked = floaty.checkPermission();

// 配置读写器
let myStorage = require("./storage.js");

// 事件
ui.emitter.on("back_pressed", (event) => {
  event.consumed = true;
  exit();
});
// 当用户回到本界面时，resume事件会被触发
ui.emitter.on("resume", () => {
  // 此时根据无障碍服务的开启情况，同步开关的状态
  ui.autoServiceSwitch.checked = auto.service !== null;
  ui.floatySwitch.checked = floaty.checkPermission();
  ui.goHomeSwitch.checked = myStorage.getGoHome();
});
ui.autoServiceSwitch.on("check", (checked) => {
  if (checked && auto.service == null) {
      app.startActivity({action: "android.settings.ACCESSIBILITY_SETTINGS"});
  }
  if (!checked && auto.service != null) {
      auto.service.disableSelf();
  }
});
ui.floatySwitch.on("check", (checked) => {
  if (checked && !floaty.checkPermission()) {
    floaty.requestPermission();
  }
});
ui.goHomeSwitch.on("check", (checked) => {
  if (checked) {
    myStorage.setGoHome(true);
  } else {
    myStorage.setGoHome(false);
  }
});

ui.runButton.click(() => {
  let ableToRun = true;
  if (ui.studentIDTextBox.text() === "") {
    ui.studentIDTextBox.setError("学号不能为空");
    ableToRun = false;
  }
  if (ui.nameTextBox.text() === "") {
    ui.nameTextBox.setError("姓名不能为空");
    ableToRun = false;
  }
  if (ui.albumNameTextBox.text() === "") {
    ui.albumNameTextBox.setError("相册名不能为空");
    ableToRun = false;
  }
  if (!ableToRun) {
    return;
  }
  myStorage.setStudentID(ui.studentIDTextBox.text());
  myStorage.setName(ui.nameTextBox.text());
  myStorage.setPhoneNumber(ui.phoneNumberTextBox.text());
  myStorage.setAlbumName(ui.albumNameTextBox.text());
  threads.start(require("./main.js"));
});

// 读取配置
ui.studentIDTextBox.setText(myStorage.getStudentID());
ui.nameTextBox.setText(myStorage.getName());
ui.phoneNumberTextBox.setText(myStorage.getPhoneNumber());
ui.albumNameTextBox.setText(myStorage.getAlbumName());
ui.goHomeSwitch.checked = myStorage.getGoHome();
if (files.isFile("/sdcard/dd")) {
  console.log("自动运行");
  ui.runButton.click();
}
