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
let myStorage = require("./storage.js");

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
  toastLog("保存成功");
});
ui.runButton.click(() => threads.start(require("./main.js")));

// 读取配置
ui.studentIDTextBox.setText(myStorage.getStudentID());
ui.nameTextBox.setText(myStorage.getName());
ui.phoneNumberTextBox.setText(myStorage.getPhoneNumber());
ui.albumNameTextBox.setText(myStorage.getAlbumName());
