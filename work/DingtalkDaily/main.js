"ui";
ui.layout(
  <vertical h="*">
    <text text="NCWU钉钉打卡" textSize="20sp" gravity="center_horizontal" />
    <text text="注意：本脚本鲁棒性较低，请认真填写需要填写的内容！" textSize="16sp" gravity="center_horizontal" />
    <text text="请先确保 钉钉“工作台” 左上角选择的企业为 华北水利水电大学！" textSize="16sp" gravity="center_horizontal" />
    <horizontal>
      <text text="学号：" textSize="16sp" />
      <input id="username" inputType="number" singleLine="true" w="*" hint="请输入学号"/>
    </horizontal>
    <horizontal>
      <text text="姓名：" textSize="16sp" />
      <input id="name" inputType="text" singleLine="true" w="*" hint="请输入姓名"/>
    </horizontal>
    <horizontal>
      <text text="手机号：" textSize="16sp" />
      <input id="phone" inputType="phone" singleLine="true" w="*" hint="请输入手机号"/>
    </horizontal>
    <text text="该脚本会在你指定名称的相册中选择第一张图片作为核酸检测记录图片！" textSize="16sp" gravity="center_horizontal" />
    <horizontal>
      <text text="相册名：" textSize="16sp" />
      <input id="album" inputType="text" singleLine="true" w="*" hint="请输入相册名"/>
    </horizontal>
    <button id="save" text="保存" w="*" />
    <frame h="*" w="*">
    <button id="rrun" text="走起" w="*" layout_gravity="bottom" h="auto"/>
    </frame>
  </vertical>
);
let storage = storages.create("DingtalkDaily");
ui.username.setText(storage.get("username", ""));
ui.name.setText(storage.get("name", ""));
ui.phone.setText(storage.get("phone", ""));
ui.album.setText(storage.get("album", ""));
ui.save.click(() => {
  storage.put("username", ui.username.text());
  storage.put("name", ui.name.text());
  storage.put("phone", ui.phone.text());
  storage.put("album", ui.album.text());
})

device.wakeUp(); // 唤醒设备
ui.rrun.click(()=>(threads.start(() => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // 打开钉钉
    let cp = currentPackage();
    if (cp !== "com.alibaba.android.rimet") {
      console.verbose("当前不在钉钉", cp);
      threads.start(() => {
        console.verbose("启动钉钉");
        if (!app.launchPackage("com.alibaba.android.rimet")) {
          console.error("启动钉钉失败");
        }
      })
      sleep(2000);
    }

    // 点击 工作台，请确保工作台企业是 华北水利水电大学
    if (!id("recycler_view").find().empty()) {
      if (className("android.view.View").text("健康打卡").findOnce() === null) {
        console.verbose("点击 工作台");
        click('工作台');
        sleep(1000);
      } else {
        console.verbose("已在工作台");
      }
    }

    // 点击 本科生每日健康打卡
    let t = className("android.view.View").text("本科生每日健康打卡").findOnce();
    if (t !== null) {
      console.verbose("点击 本科生每日健康打卡");
      t.parent().click();
    }

    // 问卷选择/填写页面
    // eslint-disable-next-line no-undef
    let ca = currentActivity();
    if (ca === "com.alibaba.lightapp.runtime.activity.CommonWebViewActivitySwipe") {
      // 打开今天的问卷
      t = className("android.view.View").text("今天").findOnce();
      if (t !== null) {
        console.verbose("点击 今天");
        t.click();
      }

      // 如果底下是 修改 说明已经打过卡了
      t = className("android.view.View").text("修改").findOnce();
      if (t !== null) {
        console.info("已经打卡");
        toastLog("已经打卡");
        shell("am force-stop com.alibaba.android.rimet", false);
        break;
      }

      // 文本框 
      t = className("android.view.View").text("学号").findOnce();
      if (t !== null) {
        console.verbose("填充 学号");
        t = t.parent().parent().findOne(className("android.widget.EditText"));
        if (t !== null) {
          t.setText(ui.username.text());
        }
      }

      t = className("android.view.View").text("姓名").findOnce();
      if (t !== null) {
        console.verbose("填充 姓名");
        t = t.parent().parent().findOne(className("android.widget.EditText"));
        if (t !== null) {
          t.setText(ui.name.text());
        }
      }

      t = className("android.view.View").text("手机号码").findOnce();
      if (t !== null) {
        console.verbose("填充 手机号码");
        t = t.parent().parent().findOne(className("android.widget.EditText"));
        if (t !== null) {
          t.setText(ui.phone.text());
        }
      }

      // 单选框选是
      t = className("android.widget.RadioButton").find();
      if (!t.empty()) {
        for (let tt of t) {
          if (tt.text() === ' 是' && tt.checked() === false) {
            console.verbose("点击 单选框");
            tt.click();
          }
        }
      }

      // 打开图片选择器
      let selectedImage = false;
      t = className("android.widget.Image").find();
      if (!t.empty()) {
        for (let tt of t) {
          if (tt.clickable()) {
            let b = tt.bounds();
            if (b.width() > 100 && b.height() > 100) {
              console.verbose("已添加图片");
              selectedImage = true;
              break;
            }
          }
        }
      }
      if (!selectedImage) {
        t = className("android.view.View").text("请上传48小时核酸证明文件").findOnce();
        if (t !== null && id("cb_send_origin").findOnce() === null) {
          t = className("android.view.View").clickable(true).depth(23).findOnce();
          if (t !== null) {
            console.verbose("选择图片");
            t.click();
            sleep(1000);
            continue;
          }
        }
      }

      // 获取位置
      t = className("android.view.View").text("获取").findOnce();
      if (t !== null) {
        console.verbose("点击 获取");
        t.click();
        sleep(4000);
      }
    }

    // eslint-disable-next-line no-undef
    t = currentActivity();
    if (t === "com.alibaba.laiwang.photokit.picker.ImageFolderDialog") {
      console.verbose("相册选择界面");
      t = id("lv_folder_list").findOnce();
      if (t !== null) {
        let found = false;
        t.children().forEach(child => {
          let target = child.findOne(id("tv_folder_name"));
          if (target !== null) {
            if (target.text().substr(0, ui.album.text().length + 1) === ui.album.text()+"(") {
              console.verbose("选择相册");
              child.click();
              found = true;
            }
          }
        });
        if (!found) {
          console.error("未找到相册，向下滑动");
          let b = t.bounds();
          // eslint-disable-next-line no-undef
          swipe(b.centerX(), b.bottom - 200, b.centerX(), b.top + 10, 1000);
        }
      }
    }

    // eslint-disable-next-line no-undef
    t = currentActivity();
    if (t === "com.alibaba.android.dingtalk.photoui.activitys.AlbumActivity") {
      t = id("tv_image_folder").findOnce();
      if (t !== null && t.text() !== ui.album.text()) {
        console.verbose("切换相册");
        t.click();
      }

      // 选择第一张图片
      t = id("album_gv").findOnce();
      if (t !== null) {
        t.children().forEach(child => {
          let target = child.findOne(id("album_item_media_cbx_icon"));
          if (target !== null) {
            if (target.desc() === '未选中') {
              target.click();
              sleep(100);
              id("btn_send").findOne().click();
            }
          }
        });
      }
    }

    // t = className("android.widget.Button").text("提交").findOnce();
    // if (t !== null) {
    //   console.verbose("点击 提交");
    //   t.click();
    // }
    // exit();
    sleep(1000);
  }

})));
