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
}