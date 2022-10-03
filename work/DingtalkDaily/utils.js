module.exports = {
  random: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
  resetConsole: (x, y, w, h) => {
    console.show(false);
    x = x || 0;
    y = y || 0;
    w = w || device.width * 0.7;
    h = h || device.height * 0.2;
    console.setPosition(x, y);
    ui.run(() => {
        console.setSize(w, h);
        console.setCanInput(false);
        console.setTitle("", "#ff11ee00", 30);
        console.setLogSize(8);
    })
  },
  findClickableParent: (child) => {
    if (child.clickable()) {
      return child;
    }
    let parent = child.parent();
    while (parent !== null) {
      if (parent.clickable()) {
        return parent;
      }
      parent = parent.parent();
    }
    return null;
  },
  findNearestEditalbeTextBoxInQuestionnaireByName: (questionName) => {
    let oriUIObject = className("android.view.View").text(questionName).findOnce();
    if (!oriUIObject) {
      return null;
    }
    let parent = oriUIObject.parent();
    while (parent !== null) {
      let t = parent.findOne(className("android.widget.EditText")
        .enabled().clickable().editable().focusable()
      );
      if (t) {
        return t;
      }
      parent = parent.parent();
    }
    return null;
  },
  add0: (num, len) => {
    let str = num.toString();
    while (str.length < len) {
      str = "0" + str;
    }
    return str;
  },
  swipeRandom: (qx, qy, zx, zy, time) => {
    //仿真随机带曲线滑动  
    //qx, qy, zx, zy, time 代表起点x,起点y,终点x,终点y,过程耗时单位毫秒
    var xxy = [time];
    var point = [];
    var dx0 = {
        "x": qx,
        "y": qy
    };
    var dx1 = {
        "x": random(qx - 100, qx + 100),
        "y": random(qy, qy + 50)
    };
    var dx2 = {
        "x": random(zx - 100, zx + 100),
        "y": random(zy, zy + 50),
    };
    var dx3 = {
        "x": zx,
        "y": zy
    };
    point.push(dx0);
    point.push(dx1);
    point.push(dx2);
    point.push(dx3);
    // log(point[3].x)
    for (let i = 0; i < 1.2; i += 0.08) {
        var xxyy = [parseInt(this.bezier_curves(point, i).x), parseInt(this.bezier_curves(point, i).y)]
        xxy.push(xxyy);
    }
    //  log(xxy);
    gesture.apply(null, xxy);
  },
  bezier_curves: (cp, t) => {
    //短距离测试
    //sml_move(400, 1000, 800, 600, 1000);
    //此代码由飞云脚本圈整理提供（www.feiyunjs.com）
    var cx = 3.0 * (cp[1].x - cp[0].x);
    var bx = 3.0 * (cp[2].x - cp[1].x) - cx;
    var ax = cp[3].x - cp[0].x - cx - bx;
    var cy = 3.0 * (cp[1].y - cp[0].y);
    var by = 3.0 * (cp[2].y - cp[1].y) - cy;
    var ay = cp[3].y - cp[0].y - cy - by;

    var tSquared = t * t;
    var tCubed = tSquared * t;
    var result = {
        "x": 0,
        "y": 0
    };
    result.x = (ax * tCubed) + (bx * tSquared) + (cx * t) + cp[0].x;
    result.y = (ay * tCubed) + (by * tSquared) + (cy * t) + cp[0].y;
    return result;
  },
  swipeToRight: () => {
    // eslint-disable-next-line no-undef
    swipe(device.width * 0.8 + random(-20, 10), device.height * 0.5 + random(-20, 10),
        device.width * 0.2 + random(-20, 10), device.height * 0.5 + random(-20, 10), 1);
  },
  swipeToLeft: () => {
    // eslint-disable-next-line no-undef
    swipe(device.width * 0.2 + random(-20, 10), device.height * 0.5 + random(-20, 10),
        device.width * 0.8 + random(-20, 10), device.height * 0.5 + random(-20, 10), 1);
  },
  deviceHeight: () => device.height - device.getVirtualBarHeigh(),
  
}