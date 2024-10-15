var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../../../../../usr/share/astal/gjs/src/imports.ts
import { default as default2 } from "gi://Astal?version=0.1";
import { default as default3 } from "gi://GObject?version=2.0";
import { default as default4 } from "gi://Gio?version=2.0";
import { default as default5 } from "gi://Gtk?version=3.0";
import { default as default6 } from "gi://Gdk?version=3.0";
import { default as default7 } from "gi://GLib?version=2.0";

// ../../../../../../usr/share/astal/gjs/src/process.ts
function subprocess(argsOrCmd, onOut = print, onErr = printerr) {
  const args = Array.isArray(argsOrCmd) || typeof argsOrCmd === "string";
  const { cmd, err, out } = {
    cmd: args ? argsOrCmd : argsOrCmd.cmd,
    err: args ? onErr : argsOrCmd.err || onErr,
    out: args ? onOut : argsOrCmd.out || onOut
  };
  const proc = Array.isArray(cmd) ? default2.Process.subprocessv(cmd) : default2.Process.subprocess(cmd);
  proc.connect("stdout", (_, stdout) => out(stdout));
  proc.connect("stderr", (_, stderr) => err(stderr));
  return proc;
}
function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(cmd)) {
      default2.Process.exec_asyncv(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_asyncv_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    } else {
      default2.Process.exec_async(cmd, (_, res) => {
        try {
          resolve(default2.Process.exec_finish(res));
        } catch (error) {
          reject(error);
        }
      });
    }
  });
}

// ../../../../../../usr/share/astal/gjs/src/time.ts
function interval(interval2, callback) {
  return default2.Time.interval(interval2, () => void callback?.());
}

// ../../../../../../usr/share/astal/gjs/src/binding.ts
var snakeify = (str) => str.replace(/([a-z])([A-Z])/g, "$1_$2").replaceAll("-", "_").toLowerCase();
var kebabify = (str) => str.replace(/([a-z])([A-Z])/g, "$1-$2").replaceAll("_", "-").toLowerCase();
var Binding = class _Binding {
  transformFn = (v) => v;
  #emitter;
  #prop;
  static bind(emitter, prop) {
    return new _Binding(emitter, prop);
  }
  constructor(emitter, prop) {
    this.#emitter = emitter;
    this.#prop = prop && kebabify(prop);
  }
  toString() {
    return `Binding<${this.#emitter}${this.#prop ? `, "${this.#prop}"` : ""}>`;
  }
  as(fn) {
    const bind3 = new _Binding(this.#emitter, this.#prop);
    bind3.transformFn = (v) => fn(this.transformFn(v));
    return bind3;
  }
  get() {
    if (typeof this.#emitter.get === "function")
      return this.transformFn(this.#emitter.get());
    if (typeof this.#prop === "string") {
      const getter = `get_${snakeify(this.#prop)}`;
      if (typeof this.#emitter[getter] === "function")
        return this.transformFn(this.#emitter[getter]());
      return this.transformFn(this.#emitter[this.#prop]);
    }
    throw Error("can not get value of binding");
  }
  subscribe(callback) {
    if (typeof this.#emitter.subscribe === "function") {
      return this.#emitter.subscribe(() => {
        callback(this.get());
      });
    } else if (typeof this.#emitter.connect === "function") {
      const signal = `notify::${this.#prop}`;
      const id = this.#emitter.connect(signal, () => {
        callback(this.get());
      });
      return () => {
        this.#emitter.disconnect(id);
      };
    }
    throw Error(`${this.#emitter} is not bindable`);
  }
};
var { bind } = Binding;

// ../../../../../../usr/share/astal/gjs/src/variable.ts
var VariableWrapper = class extends Function {
  variable;
  errHandler = console.error;
  _value;
  _poll;
  _watch;
  pollInterval = 1e3;
  pollExec;
  pollTransform;
  pollFn;
  watchTransform;
  watchExec;
  constructor(init) {
    super();
    this._value = init;
    this.variable = new default2.VariableBase();
    this.variable.connect("dropped", () => {
      this.stopWatch();
      this.stopPoll();
    });
    this.variable.connect("error", (_, err) => this.errHandler?.(err));
    return new Proxy(this, {
      apply: (target, _, args) => target._call(args[0])
    });
  }
  _call(transform) {
    const b = Binding.bind(this);
    return transform ? b.as(transform) : b;
  }
  toString() {
    return String(`Variable<${this.get()}>`);
  }
  get() {
    return this._value;
  }
  set(value) {
    if (value !== this._value) {
      this._value = value;
      this.variable.emit("changed");
    }
  }
  startPoll() {
    if (this._poll)
      return;
    if (this.pollFn) {
      this._poll = interval(this.pollInterval, () => {
        const v = this.pollFn(this.get());
        if (v instanceof Promise) {
          v.then((v2) => this.set(v2)).catch((err) => this.variable.emit("error", err));
        } else {
          this.set(v);
        }
      });
    } else if (this.pollExec) {
      this._poll = interval(this.pollInterval, () => {
        execAsync(this.pollExec).then((v) => this.set(this.pollTransform(v, this.get()))).catch((err) => this.variable.emit("error", err));
      });
    }
  }
  startWatch() {
    if (this._watch)
      return;
    this._watch = subprocess({
      cmd: this.watchExec,
      out: (out) => this.set(this.watchTransform(out, this.get())),
      err: (err) => this.variable.emit("error", err)
    });
  }
  stopPoll() {
    this._poll?.cancel();
    delete this._poll;
  }
  stopWatch() {
    this._watch?.kill();
    delete this._watch;
  }
  isPolling() {
    return !!this._poll;
  }
  isWatching() {
    return !!this._watch;
  }
  drop() {
    this.variable.emit("dropped");
  }
  onDropped(callback) {
    this.variable.connect("dropped", callback);
    return this;
  }
  onError(callback) {
    delete this.errHandler;
    this.variable.connect("error", (_, err) => callback(err));
    return this;
  }
  subscribe(callback) {
    const id = this.variable.connect("changed", () => {
      callback(this.get());
    });
    return () => this.variable.disconnect(id);
  }
  poll(interval2, exec, transform = (out) => out) {
    this.stopPoll();
    this.pollInterval = interval2;
    this.pollTransform = transform;
    if (typeof exec === "function") {
      this.pollFn = exec;
      delete this.pollExec;
    } else {
      this.pollExec = exec;
      delete this.pollFn;
    }
    this.startPoll();
    return this;
  }
  watch(exec, transform = (out) => out) {
    this.stopWatch();
    this.watchExec = exec;
    this.watchTransform = transform;
    this.startWatch();
    return this;
  }
  observe(objs, sigOrFn, callback) {
    const f = typeof sigOrFn === "function" ? sigOrFn : callback ?? (() => this.get());
    const set = (obj, ...args) => this.set(f(obj, ...args));
    if (Array.isArray(objs)) {
      for (const obj of objs) {
        const [o, s] = obj;
        const id = o.connect(s, set);
        this.onDropped(() => o.disconnect(id));
      }
    } else {
      if (typeof sigOrFn === "string") {
        const id = objs.connect(sigOrFn, set);
        this.onDropped(() => objs.disconnect(id));
      }
    }
    return this;
  }
  static derive(deps, fn = (...args) => args) {
    const update = () => fn(...deps.map((d) => d.get()));
    const derived = new Variable(update());
    const unsubs = deps.map((dep) => dep.subscribe(() => derived.set(update())));
    derived.onDropped(() => unsubs.map((unsub) => unsub()));
    return derived;
  }
};
var Variable = new Proxy(VariableWrapper, {
  apply: (_t, _a, args) => new VariableWrapper(args[0])
});
var variable_default = Variable;

// ../../../../../../usr/share/astal/gjs/src/widgets.ts
var widgets_exports = {};
__export(widgets_exports, {
  Box: () => Box,
  Button: () => Button,
  CenterBox: () => CenterBox,
  CircularProgress: () => CircularProgress,
  DrawingArea: () => DrawingArea,
  Entry: () => Entry,
  EventBox: () => EventBox,
  Icon: () => Icon,
  Label: () => Label,
  LevelBar: () => LevelBar,
  Overlay: () => Overlay,
  Revealer: () => Revealer,
  Scrollable: () => Scrollable,
  Slider: () => Slider,
  Stack: () => Stack,
  Switch: () => Switch,
  Window: () => Window,
  astalify: () => astalify
});

// ../../../../../../usr/share/astal/gjs/src/astalify.ts
Object.defineProperty(default2.Box.prototype, "children", {
  get() {
    return this.get_children();
  },
  set(v) {
    this.set_children(v);
  }
});
function setChildren(parent, children) {
  children = children.flat(Infinity).map((ch) => ch instanceof default5.Widget ? ch : new default5.Label({ visible: true, label: String(ch) }));
  if (parent instanceof default5.Bin) {
    const ch = parent.get_child();
    if (ch)
      parent.remove(ch);
  } else if (parent instanceof default5.Container && !(parent instanceof default2.Box || parent instanceof default2.Stack)) {
    for (const ch of parent.get_children())
      parent.remove(ch);
  }
  if (parent instanceof default2.Box) {
    parent.set_children(children);
  } else if (parent instanceof default2.Stack) {
    parent.set_children(children);
  } else if (parent instanceof default2.CenterBox) {
    parent.startWidget = children[0];
    parent.centerWidget = children[1];
    parent.endWidget = children[2];
  } else if (parent instanceof default2.Overlay) {
    const [child, ...overlays] = children;
    parent.set_child(child);
    parent.set_overlays(overlays);
  } else if (parent instanceof default5.Container) {
    for (const ch of children)
      parent.add(ch);
  }
}
function mergeBindings(array) {
  function getValues(...args) {
    let i = 0;
    return array.map(
      (value) => value instanceof Binding ? args[i++] : value
    );
  }
  const bindings = array.filter((i) => i instanceof Binding);
  if (bindings.length === 0)
    return array;
  if (bindings.length === 1)
    return bindings[0].as(getValues);
  return variable_default.derive(bindings, getValues)();
}
function setProp(obj, prop, value) {
  try {
    const setter = `set_${snakeify(prop)}`;
    if (typeof obj[setter] === "function")
      return obj[setter](value);
    if (Object.hasOwn(obj, prop))
      return obj[prop] = value;
  } catch (error) {
    console.error(`could not set property "${prop}" on ${obj}:`, error);
  }
  console.error(`could not set property "${prop}" on ${obj}`);
}
function hook(self, object, signalOrCallback, callback) {
  if (typeof object.connect === "function" && callback) {
    const id = object.connect(signalOrCallback, (_, ...args) => {
      callback(self, ...args);
    });
    self.connect("destroy", () => {
      object.disconnect(id);
    });
  } else if (typeof object.subscribe === "function" && typeof signalOrCallback === "function") {
    const unsub = object.subscribe((...args) => {
      signalOrCallback(self, ...args);
    });
    self.connect("destroy", unsub);
  }
  return self;
}
function ctor(self, config = {}, children = []) {
  const { setup, ...props } = config;
  props.visible ??= true;
  const bindings = Object.keys(props).reduce((acc, prop) => {
    if (props[prop] instanceof Binding) {
      const binding = props[prop];
      delete props[prop];
      return [...acc, [prop, binding]];
    }
    return acc;
  }, []);
  const onHandlers = Object.keys(props).reduce((acc, key) => {
    if (key.startsWith("on")) {
      const sig = kebabify(key).split("-").slice(1).join("-");
      const handler = props[key];
      delete props[key];
      return [...acc, [sig, handler]];
    }
    return acc;
  }, []);
  children = mergeBindings(children.flat(Infinity));
  if (children instanceof Binding) {
    setChildren(self, children.get());
    self.connect("destroy", children.subscribe((v) => {
      setChildren(self, v);
    }));
  } else {
    if (children.length > 0) {
      setChildren(self, children);
    }
  }
  for (const [signal, callback] of onHandlers) {
    if (typeof callback === "function") {
      self.connect(signal, callback);
    } else {
      self.connect(signal, () => execAsync(callback).then(print).catch(console.error));
    }
  }
  for (const [prop, binding] of bindings) {
    if (prop === "child" || prop === "children") {
      self.connect("destroy", binding.subscribe((v) => {
        setChildren(self, v);
      }));
    }
    self.connect("destroy", binding.subscribe((v) => {
      setProp(self, prop, v);
    }));
    setProp(self, prop, binding.get());
  }
  Object.assign(self, props);
  setup?.(self);
  return self;
}
function proxify(klass) {
  Object.defineProperty(klass.prototype, "className", {
    get() {
      return default2.widget_get_class_names(this).join(" ");
    },
    set(v) {
      default2.widget_set_class_names(this, v.split(/\s+/));
    }
  });
  Object.defineProperty(klass.prototype, "css", {
    get() {
      return default2.widget_get_css(this);
    },
    set(v) {
      default2.widget_set_css(this, v);
    }
  });
  Object.defineProperty(klass.prototype, "cursor", {
    get() {
      return default2.widget_get_cursor(this);
    },
    set(v) {
      default2.widget_set_cursor(this, v);
    }
  });
  Object.defineProperty(klass.prototype, "clickThrough", {
    get() {
      return default2.widget_get_click_through(this);
    },
    set(v) {
      default2.widget_set_click_through(this, v);
    }
  });
  Object.assign(klass.prototype, {
    hook: function(obj, sig, callback) {
      return hook(this, obj, sig, callback);
    },
    toggleClassName: function name(cn, cond = true) {
      default2.widget_toggle_class_name(this, cn, cond);
    },
    set_class_name: function(name) {
      this.className = name;
    },
    set_css: function(css) {
      this.css = css;
    },
    set_cursor: function(cursor) {
      this.cursor = cursor;
    },
    set_click_through: function(clickThrough) {
      this.clickThrough = clickThrough;
    }
  });
  const proxy = new Proxy(klass, {
    construct(_, [conf, ...children]) {
      return ctor(new klass(), conf, children);
    },
    apply(_t, _a, [conf, ...children]) {
      return ctor(new klass(), conf, children);
    }
  });
  return proxy;
}
function astalify(klass) {
  return proxify(klass);
}

// ../../../../../../usr/share/astal/gjs/src/widgets.ts
var Box = astalify(default2.Box);
var Button = astalify(default2.Button);
var CenterBox = astalify(default2.CenterBox);
var CircularProgress = astalify(default2.CircularProgress);
var DrawingArea = astalify(default5.DrawingArea);
var Entry = astalify(default5.Entry);
var EventBox = astalify(default2.EventBox);
var Icon = astalify(default2.Icon);
var Label = astalify(default2.Label);
var LevelBar = astalify(default2.LevelBar);
var Overlay = astalify(default2.Overlay);
var Revealer = astalify(default5.Revealer);
var Scrollable = astalify(default2.Scrollable);
var Slider = astalify(default2.Slider);
var Stack = astalify(default2.Stack);
var Switch = astalify(default5.Switch);
var Window = astalify(default2.Window);

// ../../../../../../usr/share/astal/gjs/src/application.ts
import { setConsoleLogDomain } from "console";
import { exit, programArgs } from "system";
var application_default = new class AstalJS extends default2.Application {
  static {
    default3.registerClass(this);
  }
  eval(body) {
    return new Promise((res, rej) => {
      try {
        const fn = Function(`return (async function() {
                    ${body.includes(";") ? body : `return ${body};`}
                })`);
        fn()().then(res).catch(rej);
      } catch (error) {
        rej(error);
      }
    });
  }
  requestHandler;
  vfunc_request(msg, conn) {
    if (typeof this.requestHandler === "function") {
      this.requestHandler(msg, (response) => {
        default2.write_sock(
          conn,
          String(response),
          (_, res) => default2.write_sock_finish(res)
        );
      });
    } else {
      super.vfunc_request(msg, conn);
    }
  }
  apply_css(style, reset = false) {
    super.apply_css(style, reset);
  }
  quit(code) {
    super.quit();
    exit(code ?? 0);
  }
  start({ requestHandler, css, hold, main, client, icons, ...cfg } = {}) {
    client ??= () => {
      print(`Astal instance "${this.instanceName}" already running`);
      exit(1);
    };
    Object.assign(this, cfg);
    setConsoleLogDomain(this.instanceName);
    this.requestHandler = requestHandler;
    this.connect("activate", () => {
      const path = import.meta.url.split("/").slice(3);
      const file = path.at(-1).replace(".js", ".css");
      const css2 = `/${path.slice(0, -1).join("/")}/${file}`;
      if (file.endsWith(".css") && default7.file_test(css2, default7.FileTest.EXISTS))
        this.apply_css(css2, false);
      main?.(...programArgs);
    });
    if (!this.acquire_socket())
      return client((msg) => default2.Application.send_message(this.instanceName, msg), ...programArgs);
    if (css)
      this.apply_css(css, false);
    if (icons)
      this.add_icons(icons);
    hold ??= true;
    if (hold)
      this.hold();
    this.runAsync([]);
  }
}();

// ../../../../../../usr/share/astal/gjs/index.ts
default5.init(null);

// app.tsx
import Pango from "gi://Pango";

// ../Astalified/Grid.ts
var Grid = widgets_exports.astalify(default5.Grid);

// ../Astalified/Image.ts
var Image = widgets_exports.astalify(default5.Image);

// ../Astalified/Spinner.ts
var Spinner = widgets_exports.astalify(default5.Spinner);

// ../Astalified/Stack.ts
var Stack2 = widgets_exports.astalify(default5.Stack);

// ../Astalified/StackSideBar.ts
var StackSidebar = widgets_exports.astalify(default5.StackSidebar);

// ../Astalified/StackSwitcher.ts
var StackSwitcher = widgets_exports.astalify(default5.StackSwitcher);

// ../lib/screensizeadjust.ts
var winheight = (value) => {
  const screenHeight = default6.Screen.get_default()?.get_height();
  const winheight2 = screenHeight * value;
  return winheight2;
};
var winwidth = (value) => {
  const screenWidth = default6.Screen.get_default()?.get_width();
  const winwidth2 = screenWidth * value;
  return winwidth2;
};

// ../lib/icons.tsx
var Icon2 = {
  settings: "preferences-system-symbolic",
  refresh: "view-refresh-symbolic",
  missing: "image-missing-symbolic",
  deezer: "deezer-symbolic",
  app: {
    terminal: "terminal-symbolic"
  },
  fallback: {
    executable: "application-x-executable",
    notification: "dialog-information-symbolic",
    video: "video-x-generic-symbolic",
    audio: "audio-x-generic-symbolic"
  },
  ui: {
    close: "window-close-symbolic",
    colorpicker: "color-select-symbolic",
    info: "info-symbolic",
    link: "external-link-symbolic",
    lock: "system-lock-screen-symbolic",
    menu: "open-menu-symbolic",
    refresh: "view-refresh-symbolic",
    search: "system-search-symbolic",
    settings: "emblem-system-symbolic",
    themes: "preferences-desktop-theme-symbolic",
    tick: "object-select-symbolic",
    time: "hourglass-symbolic",
    toolbars: "toolbars-symbolic",
    warning: "dialog-warning-symbolic",
    avatar: "avatar-default-symbolic",
    arrow: {
      right: "pan-end-symbolic",
      left: "pan-start-symbolic",
      down: "pan-down-symbolic",
      up: "pan-up-symbolic"
    }
  },
  cliphist: {
    delete: "window-close-symbolic"
  },
  audio: {
    mic: {
      muted: "microphone-disabled-symbolic",
      low: "microphone-sensitivity-low-symbolic",
      medium: "microphone-sensitivity-medium-symbolic",
      high: "microphone-sensitivity-high-symbolic"
    },
    volume: {
      muted: "audio-volume-muted-symbolic",
      low: "audio-volume-low-symbolic",
      medium: "audio-volume-medium-symbolic",
      high: "audio-volume-high-symbolic",
      overamplified: "audio-volume-overamplified-symbolic"
    },
    type: {
      headset: "audio-headphones-symbolic",
      speaker: "audio-speakers-symbolic",
      card: "audio-card-symbolic"
    },
    mixer: "mixer-symbolic"
  },
  powerprofile: {
    balanced: "power-profile-balanced-symbolic",
    "power-saver": "power-profile-power-saver-symbolic",
    performance: "power-profile-performance-symbolic"
  },
  battery: {
    Charging: "battery-charging-symbolic",
    Discharging: "battery-discharging-symbolic",
    Empty: "battery-empty-symbolic",
    Full: "battery-full-charged-symbolic",
    High: "battery-high-charged-symbolic",
    Medium: "battery-medium-charged-symbolic",
    Low: "battery-low-charged-symbolic",
    Caution: "battery-caution-symbolic"
  },
  bluetooth: {
    enabled: "bluetooth-active-symbolic",
    disabled: "bluetooth-disabled-symbolic"
  },
  network: {
    ethernet: {
      connected: "network-wired-symbolic",
      disconnected: "network-wired-disconnected-symbolic"
    },
    wifi: {
      enabled: "network-wireless-symbolic",
      disabled: "network-wireless-disconnected-symbolic",
      connected: "network-wireless-symbolic",
      disconnected: "network-wireless-signal-none-symbolic",
      signal: {
        low: "network-wireless-signal-strength-0-symbolic",
        medium: "network-wireless-signal-strength-1-symbolic",
        high: "network-wireless-signal-strength-2-symbolic",
        full: "network-wireless-signal-strength-3-symbolic",
        overamplified: "network-wireless-signal-strength-4-symbolic"
      }
    }
  },
  brightness: {
    indicator: "display-brightness-symbolic",
    keyboard: "keyboard-brightness-symbolic",
    screen: "display-brightness-symbolic",
    levels: {
      b1: "brightness-1-symbolic",
      b2: "brightness-2-symbolic",
      b3: "brightness-3-symbolic",
      b4: "brightness-4-symbolic",
      b5: "brightness-5-symbolic",
      b6: "brightness-6-symbolic",
      b7: "brightness-7-symbolic",
      low: "brightness-low-symbolic",
      medium: "brightness-medium-symbolic",
      high: "brightness-high-symbolic"
    }
  },
  powermenu: {
    lock: "system-lock-screen-symbolic",
    logout: "system-log-out-symbolic",
    reboot: "system-reboot-symbolic",
    shutdown: "system-shutdown-symbolic"
  },
  recorder: {
    recording: "media-record-symbolic"
  },
  notifications: {
    noisy: "org.gnome.Settings-notifications-symbolic",
    silent: "notifications-disabled-symbolic",
    message: "chat-bubbles-symbolic"
  },
  trash: {
    full: "user-trash-full-symbolic",
    empty: "user-trash-symbolic"
  },
  mpris: {
    shuffle: {
      enabled: "media-playlist-shuffle-symbolic",
      disabled: "media-playlist-consecutive-symbolic"
    },
    loop: {
      none: "media-playlist-repeat-symbolic",
      track: "media-playlist-repeat-song-symbolic",
      playlist: "media-playlist-repeat-symbolic"
    },
    controls: {
      FALLBACK_ICON: "audio-x-generic-symbolic",
      PLAY: "media-playback-start-symbolic",
      PAUSE: "media-playback-pause-symbolic",
      PREV: "media-skip-backward-symbolic",
      NEXT: "media-skip-forward-symbolic",
      CLOSE: "window-close-symbolic"
    }
  },
  system: {
    cpu: "org.gnome.SystemMonitor-symbolic",
    ram: "drive-harddisk-solidstate-symbolic",
    temp: "temperature-symbolic"
  },
  launcher: {
    allapps: "nix-snowflake-symbolic",
    search: "system-search-symbolic",
    utility: "applications-utilities-symbolic",
    system: "emblem-system-symbolic",
    education: "applications-science-symbolic",
    development: "applications-engineering-symbolic",
    network: "network-wired-symbolic",
    office: "x-office-document-symbolic",
    game: "applications-games-symbolic",
    multimedia: "applications-multimedia-symbolic",
    hyprland: "hyprland-symbolic",
    clear: "fox-symbolic"
  },
  wsicon: {
    ws1: "dragon-symbolic",
    ws2: "fox-symbolic",
    ws3: "snake-symbolic",
    ws4: "flaming-claw-symbolic"
  }
};
var icons_default = Icon2;
application_default.add_icons(`${default7.get_user_data_dir()}/icons/Astal`);

// sass:/home/topsykrets/.config/ags/style/main.scss
var main_default = '* {\n  all: unset;\n  font-family: "Liberation Mono";\n  font-size: 10pt;\n}\n\n.bar {\n  color: #08204C;\n  background: none;\n  min-height: 8px;\n}\n.barleft {\n  min-width: 100px;\n}\n.barcenter {\n  min-width: 100px;\n}\n.barright {\n  min-width: 100px;\n}\n\n/* --- AppTitleTicker --- */\n.AppTitleTicker {\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 1rem;\n  border-top: 2px solid #0f9bff;\n  min-width: 50px;\n  padding: 0rem 0.5rem;\n}\n.AppTitleTicker icon {\n  color: rgb(0, 0, 255);\n  font-size: 1rem;\n}\n.AppTitleTicker label {\n  color: rgb(255, 140, 0);\n  font-weight: bold;\n}\n.AppTitleTicker:hover icon {\n  color: rgb(255, 140, 0);\n  animation: spin 1s linear infinite;\n  /* -gtk-icon-transform: scale(2); */\n}\n.AppTitleTicker:hover label {\n  color: rgb(0, 0, 255);\n}\n\n/* --- Clock --- */\n.clock {\n  background: rgba(0, 0, 0, 0.5);\n  color: rgb(255, 140, 0);\n  border-top: 2px solid #0f9bff;\n  font-weight: bold;\n  border-radius: 1rem;\n  padding: 0rem 0.5rem;\n}\n.clock label {\n  font-size: 1rem;\n}\n.clock icon {\n  color: rgb(0, 0, 255);\n}\n.clock:hover {\n  color: rgb(0, 0, 255);\n}\n.clock:hover icon {\n  color: rgb(255, 140, 0);\n  animation: spin 1s linear infinite;\n}\n\n/* --- sysinfo --- */\n.sysinfo {\n  background: rgba(0, 0, 0, 0.5);\n  border-top: 2px solid #0f9bff;\n  color: rgb(255, 140, 0);\n  font-weight: bold;\n  border-radius: 1rem;\n  padding: 0rem 0.5rem;\n}\n.sysinfo .volumebtn {\n  color: rgb(255, 140, 0);\n}\n.sysinfo .volumebtn icon,\n.sysinfo .volumebtn image {\n  font-size: 1.15rem;\n}\n.sysinfo .volumebtn button:hover {\n  color: rgb(0, 0, 255);\n}\n\n.brightness {\n  color: rgb(255, 140, 0);\n  margin-bottom: 0.25rem;\n  padding: 0.5rem;\n  border: 2px solid #0f9bff;\n  border-radius: 2rem;\n}\n.brightness icon {\n  font-size: 1.25rem;\n}\n\n.calendarbox {\n  background: rgba(0, 0, 0, 0.8);\n  border-radius: 2rem;\n  border: 2px solid #0f9bff;\n  padding: 1rem;\n}\n\n.dashcal {\n  border-top: 2px solid #0f9bff;\n  border-radius: 3rem 3rem 0rem 0rem;\n  padding: 0.5rem 2.5rem;\n}\n\n.calendar {\n  font-family: Liberation Mono;\n}\n.calendar-grid {\n  border-radius: 2rem;\n  padding: 0.25rem;\n  color: rgb(255, 140, 0);\n}\n.calendar-grid label {\n  margin: 3px;\n}\n.calendar-header {\n  color: rgb(155, 255, 15);\n  margin: 0rem 1rem;\n  padding-bottom: 1rem;\n}\n.calendar-days {\n  color: #27D8DE;\n  border-bottom: 2px solid #0f9bff;\n  border-radius: 2rem;\n  font-size: 1.5rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.calendar-day {\n  color: rgb(255, 140, 0);\n  margin: 0.1rem 0.25rem;\n  padding: 0.2rem 0.6rem;\n  border-radius: 2rem;\n  font-size: 1.25rem;\n  font-weight: 100;\n}\n.calendar-today {\n  background: radial-gradient(rgb(0, 0, 0) 25%, rgb(15, 155, 255) 100%);\n  color: red;\n  border-radius: 2rem;\n  font-weight: bolder;\n}\n\n.calendar-year-label,\n.calendar-month-label {\n  font-size: 1.5rem;\n  color: rgb(255, 140, 0);\n}\n\n.calendar.year.label,\n.calendar.month.label {\n  color: rgb(255, 140, 0);\n}\n.calendar.year.arrow-left,\n.calendar.month.arrow-left {\n  color: rgb(255, 0, 0);\n  font-size: 1.5rem;\n}\n.calendar.year.arrow-right,\n.calendar.month.arrow-right {\n  color: rgb(155, 255, 15);\n  font-size: 1.5rem;\n}\n.calendar.year:hover,\n.calendar.month:hover {\n  color: rgb(0, 0, 255);\n}\n\n.calendar.return-today {\n  color: rgb(255, 140, 0);\n  background: linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgb(0, 0, 0) 50%, rgba(0, 0, 0, 0.5) 100%);\n  border-radius: 2rem;\n  min-width: 50px;\n  min-height: 30px;\n}\n.calendar.return-today image {\n  font-size: 1.25rem;\n  padding: 0.25rem 1.5rem;\n}\n.calendar.return-today:hover {\n  background: linear-gradient(0deg, rgba(0, 0, 55, 0.5) 0%, rgb(0, 0, 255) 15%, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 255) 85%, rgba(0, 0, 55, 0.5) 100%);\n}\n.calendar.return-today:hover image {\n  color: rgb(155, 255, 15);\n  animation: spin 1s infinite;\n}\n\n.cliphist.contentgrid {\n  background: url("assets/groot.png");\n  background-color: black;\n  background-size: auto auto;\n  background-position: center;\n  background-repeat: no-repeat;\n  border-radius: 3rem 0rem 0rem 3rem;\n  border: 2px solid #0f9bff;\n  border-right: unset;\n  box-shadow: 1rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n  padding: 0rem 1rem;\n}\n.cliphist.header {\n  margin: 1rem;\n  background: none;\n  border-bottom: 2px solid #0f9bff;\n  border-left: 2px solid #0f9bff;\n  border-right: 2px solid #0f9bff;\n  border-radius: 2rem;\n  color: rgb(255, 140, 0);\n  padding: 0.5rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.cliphist.header .clear_hist {\n  background: rgb(15, 155, 255);\n  color: rgb(255, 140, 0);\n  border-radius: 2rem;\n}\n.cliphist.header .clear_hist icon {\n  font-size: 2rem;\n  margin: -0.25rem;\n}\n.cliphist.header .clear_hist:hover {\n  color: rgb(15, 155, 255);\n  background: rgb(255, 0, 0);\n}\n.cliphist.header .search {\n  border-radius: 2rem;\n  padding: 0rem 0.5rem;\n}\n.cliphist.header .search selection {\n  color: black;\n  background-color: rgb(15, 155, 255);\n}\n.cliphist.item {\n  all: unset;\n  padding: 0rem 0.75rem;\n  min-height: 1.5rem;\n  margin-bottom: 0.5rem;\n  border-bottom: 2px solid rgb(0, 0, 255);\n}\n.cliphist.item:last-child {\n  border-bottom: none;\n}\n.cliphist.item icon {\n  font-size: 2rem;\n  color: rgb(255, 140, 0);\n  border-radius: 10rem;\n}\n.cliphist.item label {\n  color: rgb(255, 140, 0);\n  font-weight: normal;\n  font-size: 1.25rem;\n}\n.cliphist.item.active, .cliphist.item:focus, .cliphist.item:hover {\n  background-color: rgba(0, 0, 0, 0.8);\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n}\n.cliphist.item.active label, .cliphist.item:focus label, .cliphist.item:hover label {\n  text-shadow: 0.3rem 0.3rem 0.5rem rgb(15, 155, 255);\n}\n.cliphist.item.active icon, .cliphist.item:focus icon, .cliphist.item:hover icon {\n  -gtk-icon-shadow: 0.3rem 0.3rem 0.5rem rgb(15, 155, 255);\n  animation: spin 1s linear infinite;\n}\n.cliphist scrollbar.vertical {\n  transition: 200ms;\n  background-color: rgba(23, 23, 23, 0.3);\n  margin: 0.5rem 0rem;\n}\n.cliphist scrollbar.vertical:hover {\n  background-color: rgba(23, 23, 23, 0.7);\n}\n.cliphist scrollbar.vertical:hover slider {\n  background-color: rgb(255, 140, 0);\n  min-width: 0.5rem;\n}\n.cliphist scrollbar.vertical slider {\n  background-color: rgba(15, 155, 255, 0.5);\n  border-radius: 2rem;\n  min-width: 0.4rem;\n  min-height: 2rem;\n  transition: 200ms;\n}\n\n.dashboard {\n  font-weight: bold;\n}\n.dashboard.topCenter {\n  border-radius: 2rem;\n  background: rgba(0, 0, 0, 0.5);\n  margin: 0.25rem;\n}\n.dashboard.leftSide {\n  border-radius: 2rem;\n  background: rgba(0, 0, 0, 0.8);\n  border: 2px solid #0f9bff;\n  padding: 0.5rem;\n  margin: 0.25rem;\n}\n.dashboard.rightSide {\n  border-radius: 2rem;\n  background: rgba(0, 0, 0, 0.8);\n  border: 2px solid #0f9bff;\n  padding: 0.5rem;\n  margin: 0.25rem;\n}\n.dashboard.power .powerprofiles {\n  all: unset;\n}\n.dashboard.power .powerprofiles button {\n  border: 2px solid #0f9bff;\n  border-width: 5px;\n  border-radius: 2rem;\n  padding: 0.45rem 0.65rem;\n  margin: 0rem 0.5rem;\n}\n.dashboard.power .powerprofiles button:first-child {\n  color: lime;\n}\n.dashboard.power .powerprofiles button:first-child:hover {\n  border-left: 5px solid lime;\n  border-right: 5px solid lime;\n  border-top: 2px solid #0f9bff;\n  border-bottom: 2px solid #0f9bff;\n  border-width: 5px;\n  background: linear-gradient(0deg, lime 0%, rgba(0, 0, 0, 0) 50%, lime 100%);\n}\n.dashboard.power .powerprofiles button:nth-child(2) {\n  color: yellow;\n}\n.dashboard.power .powerprofiles button:nth-child(2):hover {\n  border-left: 5px dashed yellow;\n  border-right: 5px dashed yellow;\n  border-top: 2px solid #0f9bff;\n  border-bottom: 2px solid #0f9bff;\n  border-width: 5px;\n  background: linear-gradient(0deg, rgb(255, 255, 0) 0%, rgba(0, 0, 0, 0) 50%, rgb(255, 255, 0) 100%);\n}\n.dashboard.power .powerprofiles button:last-child {\n  color: red;\n}\n.dashboard.power .powerprofiles button:last-child:hover {\n  border-left: 5px dotted red;\n  border-right: 5px dotted red;\n  border-top: 2px solid #0f9bff;\n  border-bottom: 2px solid #0f9bff;\n  border-width: 5px;\n  background: linear-gradient(0deg, rgb(255, 0, 0) 0%, rgba(0, 0, 0, 0) 50%, rgb(255, 0, 0) 100%);\n}\n.dashboard.power .powerprofiles button label {\n  font-weight: bold;\n  margin-top: 0.25rem;\n}\n.dashboard.power .powerprofiles button image {\n  font-size: 1.5rem;\n}\n.dashboard.power .powerprofiles .power-saver {\n  border-left-color: lime;\n  border-right-color: lime;\n}\n.dashboard.power .powerprofiles .balanced {\n  border-left-color: yellow;\n  border-left-style: dashed;\n  border-right-color: yellow;\n  border-right-style: dashed;\n}\n.dashboard.power .powerprofiles .performance {\n  border-left-color: red;\n  border-left-style: dotted;\n  border-right-color: red;\n  border-right-style: dotted;\n}\n.dashboard.power .sessioncontrols {\n  all: unset;\n}\n.dashboard.power .sessioncontrols button {\n  border-radius: 5rem;\n  border-left: 0.5rem solid #0f9bff;\n  border-right: 0.5rem solid #0f9bff;\n  background: linear-gradient(0deg, rgba(0, 0, 255, 0.5) 0%, rgb(0, 0, 255) 15%, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 255) 85%, rgba(0, 0, 255, 0.5) 100%);\n  padding: 0.5rem;\n  margin: 0rem 0.5rem;\n}\n.dashboard.power .sessioncontrols button:first-child icon, .dashboard.power .sessioncontrols button:nth-child(2) icon, .dashboard.power .sessioncontrols button:nth-child(3) icon, .dashboard.power .sessioncontrols button:last-child icon {\n  font-size: 1.5rem;\n}\n.dashboard.power .sessioncontrols button label,\n.dashboard.power .sessioncontrols button icon {\n  color: rgb(255, 140, 0);\n  font-size: 1.25rem;\n}\n.dashboard.power .sessioncontrols button label {\n  font-size: 1rem;\n}\n.dashboard.power .sessioncontrols button:hover icon, .dashboard.power .sessioncontrols button:focus icon, .dashboard.power .sessioncontrols button:active icon {\n  animation: spin 1s infinite;\n}\n.dashboard.power .sessioncontrols button:hover {\n  border-left: 0.5rem dashed red;\n  border-right: 0.5rem dashed red;\n  background: linear-gradient(0deg, rgba(255, 0, 0, 0.5) 0%, rgb(255, 0, 0) 15%, rgba(0, 0, 0, 0) 50%, rgb(255, 0, 0) 85%, rgba(255, 0, 0, 0.5) 100%);\n}\n.dashboard.power .sessioncontrols button:hover label {\n  color: rgb(0, 0, 255);\n}\n.dashboard.power .sessioncontrols button:focus, .dashboard.power .sessioncontrols button:active {\n  border-left: 0.5rem dashed rgb(255, 255, 0);\n  border-right: 0.5rem dashed rgb(255, 255, 0);\n  background: linear-gradient(0deg, rgba(255, 255, 0, 0.5) 0%, rgb(255, 255, 0) 15%, rgba(0, 0, 0, 0) 50%, rgb(255, 255, 0) 85%, rgba(255, 255, 0, 0.5) 100%);\n}\n.dashboard.power .sessioncontrols button:focus label, .dashboard.power .sessioncontrols button:active label {\n  color: rgb(0, 0, 255);\n}\n\n.launcher.container {\n  padding-right: 1rem;\n}\n.launcher.contentgrid {\n  background: url("assets/groot.png");\n  background-color: black;\n  background-size: auto auto;\n  background-position: center;\n  background-repeat: no-repeat;\n  border-radius: 0rem 3rem 3rem 0rem;\n  border: 2px solid #0f9bff;\n  border-left: unset;\n  box-shadow: 1rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.launcher.search {\n  margin: 1rem;\n  background: none;\n  border-bottom: 2px solid #0f9bff;\n  border-left: 2px solid #0f9bff;\n  border-right: 2px solid #0f9bff;\n  border-radius: 2rem;\n  color: rgb(255, 140, 0);\n  padding: 0.5rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.launcher.search selection {\n  color: black;\n  background-color: rgb(15, 155, 255);\n}\n.launcher.app {\n  all: unset;\n  padding: 0rem 0.75rem;\n  min-width: 7rem;\n  min-height: 3rem;\n  border-bottom: 1px solid rgba(0, 0, 155, 0.7);\n}\n.launcher.app:last-child {\n  border-bottom: none;\n}\n.launcher.app icon {\n  font-size: 2rem;\n  color: rgb(255, 140, 0);\n  border-radius: 10rem;\n}\n.launcher.app label {\n  color: rgb(255, 140, 0);\n  font-weight: normal;\n  font-size: 1.25rem;\n}\n.launcher.app.active, .launcher.app:focus, .launcher.app:hover {\n  background-color: rgba(0, 0, 0, 0.8);\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n}\n.launcher.app.active label, .launcher.app:focus label, .launcher.app:hover label {\n  text-shadow: 0.3rem 0.3rem 0.5rem rgb(15, 155, 255);\n}\n.launcher.app.active icon, .launcher.app:focus icon, .launcher.app:hover icon {\n  -gtk-icon-shadow: 0.3rem 0.3rem 0.5rem rgb(15, 155, 255);\n  animation: spin 1s linear infinite;\n}\n.launcher .switcher {\n  color: rgb(255, 140, 0);\n  padding: 0.5rem 0rem;\n  padding-left: 0.75rem;\n}\n.launcher .switcher button {\n  background: none;\n}\n.launcher .switcher button.active {\n  background-color: black;\n  border-radius: 2rem;\n  border: 2px solid #0f9bff;\n}\n.launcher .switcher button.active icon {\n  background: linear-gradient(0deg, rgba(0, 0, 0, 0.25) 0%, rgba(15, 155, 255, 0.5) 50%, rgba(0, 0, 0, 0.25) 100%);\n  border-radius: 3rem 0rem 0rem 3rem;\n}\n.launcher .switcher button:focus-visible, .launcher .switcher button:focus, .launcher .switcher button:hover {\n  background: linear-gradient(0deg, rgba(0, 0, 55, 0.5) 0%, rgb(0, 0, 255) 15%, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 255) 85%, rgba(0, 0, 55, 0.5) 100%);\n  background-color: black;\n  border-radius: 2rem;\n}\n.launcher .switcher button icon {\n  padding: 10px;\n  color: rgb(255, 140, 0);\n  font-size: 2rem;\n}\n.launcher scrollbar.vertical {\n  transition: 200ms;\n  background-color: rgba(23, 23, 23, 0.3);\n  margin: 0.5rem 0rem;\n}\n.launcher scrollbar.vertical:hover {\n  background-color: rgba(23, 23, 23, 0.7);\n}\n.launcher scrollbar.vertical:hover slider {\n  background-color: rgb(255, 140, 0);\n  min-width: 0.5rem;\n}\n.launcher scrollbar.vertical slider {\n  background-color: rgba(15, 155, 255, 0.5);\n  border-radius: 2rem;\n  min-width: 0.4rem;\n  min-height: 2rem;\n  transition: 200ms;\n}\n\n.ticker.container {\n  border-top: 2px solid #0f9bff;\n  border-radius: 3rem;\n  padding: 0rem 0.5rem;\n  background: rgba(0, 0, 0, 0.5);\n  font-weight: bold;\n  min-width: 1rem;\n}\n.ticker.nomedia {\n  color: rgb(255, 140, 0);\n}\n.ticker tooltip {\n  font-weight: bold;\n  padding: 10px;\n}\n.ticker:hover .ticker.track {\n  color: rgb(0, 0, 255);\n}\n.ticker:hover .ticker.artist {\n  color: rgb(255, 140, 0);\n}\n.ticker:hover icon {\n  animation: spin 1s infinite;\n}\n.ticker.artist {\n  color: rgb(15, 155, 255);\n  font-size: 1rem;\n}\n.ticker.track {\n  font-size: 1rem;\n  color: rgb(255, 140, 0);\n}\n.ticker.icon {\n  color: red;\n}\n\n.tickerbox {\n  background-size: contain;\n  background-repeat: no-repeat;\n  background-position: center;\n}\n\n.player {\n  background: rgba(0, 0, 0, 0.5);\n  padding: 0px;\n  border: 2px solid #0f9bff;\n  border-radius: 3rem;\n  min-width: 400px;\n  min-height: 100px;\n  padding-left: 2.5rem;\n  padding-right: 0.25rem;\n  padding-top: 0.5rem;\n  box-shadow: inset -0.75rem 0rem 1rem 0rem rgba(0, 0, 0, 0.5), inset 0rem 0rem 0rem 0rem rgba(0, 0, 0, 0.5), inset 0rem 0rem 0rem 0rem rgba(0, 0, 0, 0.5);\n}\n.player .mediainfo {\n  padding-left: 0rem;\n  margin-left: 6rem;\n  margin-right: 2rem;\n}\n.player .playercontrols {\n  margin-top: -1rem;\n  margin-bottom: 0.75rem;\n}\n.player .positioncontainer {\n  margin-left: 0.5rem;\n}\n\n.trackposition, .tracklength {\n  color: rgb(255, 140, 0);\n  text-shadow: 0.1rem 0.1rem rgba(0, 0, 0, 0.5);\n}\n.trackimg {\n  background-size: cover;\n  background-position: center;\n  background-repeat: no-repeat;\n  border-radius: 3rem 0rem 0rem 3rem;\n  margin-right: 0.25rem;\n}\n\n.playicon {\n  color: rgb(255, 140, 0);\n  -gtk-icon-style: symbolic;\n  -gtk-icon-shadow: 0.3rem 0.3rem 0.2rem rgba(0, 0, 0, 0.5);\n}\n\n.trackinfo {\n  min-width: 250px;\n}\n\n.tracktitle {\n  font-size: 1.2em;\n  font-weight: bold;\n  color: rgb(255, 140, 0);\n  text-shadow: 0.1rem 0.1rem rgba(0, 0, 0, 0.5);\n}\n\n.artist {\n  font-size: 1.1rem;\n  color: rgb(15, 155, 255);\n  text-shadow: 0.1rem 0.1rem rgba(0, 0, 0, 0.5);\n}\n\n.player button {\n  color: #cdd6f4;\n  border: 2px solid rgba(0, 0, 0, 0);\n}\n.player button icon {\n  font-size: 1.5rem;\n  margin: 0rem 0.25rem;\n}\n.player button.playicon {\n  -gtk-icon-shadow: 0rem 0.2rem 0.25rem rgba(0, 0, 0, 0.5);\n}\n.player button.playicon:hover {\n  -gtk-icon-shadow: 0rem 0.2rem 0.25rem rgb(15, 155, 255);\n}\n.player button.previous {\n  -gtk-icon-shadow: -0.2rem 0.2rem rgba(0, 0, 0, 0.5);\n}\n.player button.previous:hover {\n  color: red;\n  -gtk-icon-shadow: -0.2rem 0.2rem rgb(0, 0, 255);\n}\n.player button.play-pause {\n  margin: 0rem 0.25rem;\n  -gtk-icon-shadow: 0.1rem 0.3rem rgba(0, 0, 0, 0.5);\n}\n.player button.play-pause:hover {\n  color: yellow;\n  -gtk-icon-shadow: 0.1rem 0.3rem rgb(255, 0, 0);\n}\n.player button.next {\n  -gtk-icon-shadow: 0.2rem 0.2rem rgba(0, 0, 0, 0.5);\n}\n.player button.next:hover {\n  color: rgb(0, 0, 255);\n  -gtk-icon-shadow: 0.2rem 0.2rem yellow;\n}\n.player button.close {\n  margin-right: -0.3rem;\n  border-radius: 3rem 0rem 0rem 3rem;\n  background: rgb(15, 155, 255);\n  color: rgb(255, 140, 0);\n  opacity: 0.1;\n  box-shadow: -0.5rem 0rem 1rem 0.5rem rgb(0, 0, 0);\n}\n.player button.close:hover {\n  color: red;\n  opacity: 1;\n}\n\n.notif .outerbox {\n  background: rgba(0, 0, 0, 0.8);\n  border-radius: 2rem;\n  padding: 0.35rem;\n}\n.notif.panel {\n  padding: 0rem 0.5rem;\n  padding-bottom: 0.25rem;\n}\n.notif.panel .header {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n  margin-bottom: 0.5rem;\n  padding: 0.25rem 0rem;\n}\n.notif.panel .header label {\n  font-size: 1.1rem;\n  color: rgb(255, 140, 0);\n}\n.notif.panel .header button {\n  color: rgb(255, 140, 0);\n}\n.notif.panel .header button icon {\n  font-size: 1.1rem;\n}\n.notif.panel .header button:hover icon {\n  color: rgb(0, 0, 255);\n}\n.notif .titlebox {\n  border-bottom: 2px solid #0f9bff;\n  border-radius: 2rem;\n  padding: 0rem 1rem;\n  margin-bottom: 0.5rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.notif .titlebox .title {\n  font-size: 1.1rem;\n  font-weight: bolder;\n}\n.notif .titlebox .subtitle {\n  color: rgb(255, 140, 0);\n  font-size: 1rem;\n  font-weight: normal;\n}\n.notif .body {\n  color: rgb(155, 255, 15);\n  font-size: 0.9rem;\n  font-weight: normal;\n  padding: 0rem 1rem;\n}\n.notif .icondatetime {\n  padding: 0.5rem;\n}\n.notif .icondatetime icon {\n  font-size: 2.5rem;\n}\n.notif .icondatetime .datetime {\n  padding: 0.25rem;\n  font-weight: normal;\n}\n.notif .icondatetime .datetime label {\n  color: rgb(15, 155, 255);\n  font-size: 0.8rem;\n}\n.notif .actions button {\n  border: 2px solid #0f9bff;\n  border-radius: 2rem;\n  margin: 0 0.4rem;\n  margin-top: 0.8rem;\n  font-size: 1.35rem;\n  padding: 0.1rem;\n}\n.notif .actions button:first-child {\n  margin-left: 0.25rem;\n}\n.notif .actions button:last-child {\n  margin-right: 0.25rem;\n}\n.notif .actions button:hover {\n  background-color: #08204C;\n}\n.notif .actions button:hover label {\n  font-weight: bolder;\n  color: rgb(255, 0, 0);\n}\n.notif .level2.outerbox {\n  border: 3px dotted rgb(255, 0, 0);\n}\n.notif .level2 .title {\n  color: rgb(255, 0, 0);\n}\n.notif .level2 .body {\n  color: rgb(155, 255, 15);\n}\n.notif .level2 .icondatetime icon {\n  color: rgb(255, 0, 0);\n}\n.notif .level2 .icondatetime .datetime label {\n  color: rgb(15, 155, 255);\n}\n.notif .level1.outerbox {\n  border: 3px dashed rgb(15, 155, 255);\n}\n.notif .level1 .title {\n  color: rgb(255, 140, 0);\n}\n.notif .level1 .body {\n  color: rgb(155, 255, 15);\n}\n.notif .level1 .icondatetime icon {\n  color: rgb(15, 155, 255);\n}\n.notif .level1 .icondatetime .datetime label {\n  color: rgb(15, 155, 255);\n}\n.notif .levelundefined.outerbox,\n.notif .level0.outerbox {\n  border: 3px groove white;\n}\n.notif .levelundefined .title,\n.notif .level0 .title {\n  color: rgb(255, 140, 0);\n}\n.notif .levelundefined .body,\n.notif .level0 .body {\n  color: rgb(155, 255, 15);\n}\n.notif .levelundefined .icondatetime icon,\n.notif .level0 .icondatetime icon {\n  color: white;\n}\n\n.close-button {\n  font-size: 1.5rem;\n  margin-left: 0.25rem;\n}\n\n@keyframes lowBlink {\n  0% {\n    color: #ff0000;\n  }\n  50% {\n    color: #ffff00;\n  }\n  100% {\n    color: #000066;\n  }\n}\n.battery {\n  border: none;\n  color: rgb(255, 140, 0);\n  font-size: 0.5rem;\n}\n.battery icon.charging {\n  color: yellow;\n}\n.battery icon.discharging {\n  color: red;\n}\n.battery.low {\n  animation: lowBlink 3s infinite;\n}\n.battery.low label {\n  animation: lowBlink 2s infinite;\n}\n.battery.low icon {\n  animation: lowBlink 2s infinite;\n}\n.battery:hover {\n  color: rgb(0, 0, 255);\n}\n.battery trough {\n  border-radius: 10rem;\n  min-width: 75px;\n}\n.battery trough block {\n  min-height: 10px;\n  border: 1px solid rgb(15, 155, 255);\n  border-radius: 10rem;\n  margin: 0px 0.25px;\n}\n.battery trough block.empty {\n  background: linear-gradient(90deg, red, black 100%);\n}\n.battery trough block.filled {\n  background: linear-gradient(90deg, black, lime 100%);\n}\n\n.tray {\n  background: rgba(0, 0, 0, 0.8);\n  border: 2px solid #0f9bff;\n  border-radius: 2rem;\n  padding: 0.25rem;\n}\n.tray > * {\n  border: 2px solid rgba(0, 0, 0, 0);\n  background-color: transparent;\n  font-weight: bold;\n}\n.tray button image,\n.tray button icon {\n  color: rgb(255, 140, 0);\n  font-size: 1.5rem;\n  border-radius: 2rem;\n}\n.tray button:hover {\n  background-color: #1e1e2e;\n  border-radius: 2rem;\n  border: 2px solid #0f9bff;\n}\n\nmenu > menuitem {\n  background: rgb(0, 0, 0);\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  color: rgb(255, 140, 0);\n  margin: 0.5px;\n  padding: 5px;\n}\nmenu > menuitem:hover {\n  color: rgb(0, 0, 255);\n  border-right: 2px solid #0f9bff;\n  border-left: 2px solid #0f9bff;\n  border-bottom: none;\n  font-weight: bolder;\n  border-color: rgb(255, 0, 0);\n}\nmenu > menuitem:hover icon,\nmenu > menuitem:hover image {\n  color: rgb(255, 0, 0);\n}\nmenu > menuitem icon,\nmenu > menuitem image {\n  color: rgb(255, 140, 0);\n}\nmenu > menuitem:disabled {\n  color: gray;\n  background: rgba(39, 38, 38, 0.5);\n  border: none;\n}\n\n.audio-mixer {\n  color: rgb(255, 140, 0);\n}\n.audio-mixer.header {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n  margin-bottom: 0.5rem;\n  padding: 0.25rem 0rem;\n}\n.audio-mixer.settings-button {\n  color: rgb(255, 140, 0);\n}\n.audio-mixer.container {\n  background: rgba(0, 0, 0, 0.5);\n  border-radius: 2.5rem;\n  border: 2px solid #0f9bff;\n  padding: 1rem;\n}\n\n.muted {\n  color: red;\n}\n.muted icon {\n  color: red;\n}\n\n.volume-indicator:hover {\n  color: rgb(0, 0, 255);\n}\n\n.volumemixer .menu {\n  all: unset;\n}\n.volumemixer .menu.app-mixer .title {\n  background: rgba(0, 0, 0, 0.5);\n  box-shadow: inset 0.25rem 0.25rem 1rem rgb(0, 0, 0);\n  font-size: 1.25rem;\n  font-weight: bold;\n  margin-top: 0.25rem;\n  border-radius: 3rem;\n  padding: 0.25rem 0.75rem;\n  color: rgb(15, 155, 255);\n}\n.volumemixer .menu.app-mixer .icon {\n  margin-right: 0.5rem;\n  margin-top: 0.25rem;\n}\n.volumemixer .menu.sink-selector {\n  color: rgb(255, 140, 0);\n}\n.volumemixer .menu.sink-selector .title {\n  background: rgba(0, 0, 0, 0.5);\n  box-shadow: inset 0.25rem 0.25rem 1rem rgb(0, 0, 0);\n  font-size: 1.25rem;\n  font-weight: bold;\n  margin-top: 0.25rem;\n  border-radius: 3rem;\n  padding: 0.25rem 0.75rem;\n  color: rgb(15, 155, 255);\n}\n.volumemixer .menu.sink-selector .icon {\n  margin-right: 0.5rem;\n  margin-top: 0.25rem;\n  color: rgb(15, 155, 255);\n}\n\n.mixeritem {\n  color: rgb(255, 140, 0);\n  margin-right: 0.65rem;\n}\n.mixeritemicon {\n  color: rgb(255, 140, 0);\n  margin-right: 0.25rem;\n  margin-top: 0.25rem;\n}\n.mixeritemlabel {\n  color: rgb(255, 140, 0);\n  margin-top: 0.25rem;\n}\n.mixeritem:last-child {\n  margin-bottom: 0.5rem;\n}\n\n.sinkitembox {\n  margin-top: 0.25rem;\n}\n.sinkitemicon {\n  margin-right: 0.25rem;\n  color: rgb(255, 140, 0);\n}\n.sinkitemlabel {\n  margin-top: 0.25rem;\n  color: rgb(255, 140, 0);\n}\n.sinkitem:last-child {\n  margin-bottom: 0.5rem;\n}\n\n.hyprworkspaces {\n  background: rgba(0, 0, 0, 0.5);\n  border-top: 2px solid #0f9bff;\n  border-radius: 1rem;\n  margin-left: 0.5rem;\n  padding: 0rem 0.5rem;\n}\n.hyprworkspaces .urgent {\n  color: rgb(255, 0, 0);\n}\n.hyprworkspaces .urgent:hover icon {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces .urgent:hover label {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces .occupied {\n  color: rgb(15, 155, 255);\n}\n.hyprworkspaces .occupied:hover icon {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces .occupied:hover label {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces .focused {\n  all: unset;\n  background-image: radial-gradient(circle at center, rgb(0, 0, 0), rgb(255, 140, 0) 1.5rem);\n  border: 1px solid rgb(15, 155, 255);\n  border-radius: 2rem;\n  padding: 0.2rem;\n  color: rgb(155, 255, 15);\n}\n.hyprworkspaces .focused:hover icon {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces .focused:hover label {\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces button {\n  transition: all 2s cubic-bezier(0.5, 2, 0, 1);\n  color: rgb(255, 140, 0);\n}\n.hyprworkspaces button icon {\n  font-size: 0.8rem;\n}\n.hyprworkspaces button label {\n  font-size: 0.9rem;\n}\n.hyprworkspaces button:first-child {\n  margin-right: 0.25rem;\n}\n.hyprworkspaces button:nth-child(1n+0) {\n  margin: 0rem 0.25rem;\n}\n.hyprworkspaces button:last-child {\n  margin-left: 0.25rem;\n}\n.hyprworkspaces button:hover icon {\n  animation: spin 1s linear infinite;\n  color: rgb(0, 0, 255);\n}\n.hyprworkspaces button:hover label {\n  color: rgb(0, 0, 255);\n}\n\n.riverworkspaces {\n  background: rgba(0, 0, 0, 0.5);\n  border-top: 2px solid #0f9bff;\n  border-radius: 1rem;\n  padding: 0rem 0.5rem;\n}\n.riverworkspaces .urgent {\n  color: rgb(255, 0, 0);\n}\n.riverworkspaces .urgent:hover icon {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces .urgent:hover label {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces .occupied {\n  color: rgb(15, 155, 255);\n}\n.riverworkspaces .occupied:hover icon {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces .occupied:hover label {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces .focused {\n  all: unset;\n  border-bottom: 1px solid rgb(15, 155, 255);\n  border-radius: 2rem;\n  padding: 0rem 0.2rem;\n  color: rgb(155, 255, 15);\n}\n.riverworkspaces .focused:hover icon {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces .focused:hover label {\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces button {\n  color: rgb(255, 140, 0);\n}\n.riverworkspaces button icon {\n  font-size: 0.8rem;\n}\n.riverworkspaces button label {\n  font-size: 0.9rem;\n}\n.riverworkspaces button:first-child {\n  margin-right: 0.25rem;\n}\n.riverworkspaces button:nth-child(1n+0) {\n  margin: 0rem 0.25rem;\n}\n.riverworkspaces button:last-child {\n  margin-left: 0.25rem;\n}\n.riverworkspaces button:hover icon {\n  animation: spin 1s linear infinite;\n  color: rgb(0, 0, 255);\n}\n.riverworkspaces button:hover label {\n  color: rgb(0, 0, 255);\n}\n\n.sessioncontrols.window {\n  all: unset;\n  background: rgba(0, 0, 0, 0.5);\n}\n.sessioncontrols.window.container {\n  color: rgb(15, 155, 255);\n  font-size: 2rem;\n  font-weight: bold;\n  min-width: 5rem;\n}\n.sessioncontrols.window.box {\n  background: rgba(0, 0, 0, 0.5);\n  border-top: 2px solid #0f9bff;\n  border-bottom: 2px solid #0f9bff;\n  border-radius: 4rem;\n  border-width: 0.5rem;\n  padding: 2rem;\n}\n.sessioncontrols.window button {\n  border-radius: 5rem;\n  min-width: 10rem;\n  min-height: 10rem;\n  border-left: 0.5rem solid #0f9bff;\n  border-right: 0.5rem solid #0f9bff;\n  background: linear-gradient(0deg, rgba(0, 0, 255, 0.5) 0%, rgb(0, 0, 255) 15%, rgba(0, 0, 0, 0) 50%, rgb(0, 0, 255) 85%, rgba(0, 0, 255, 0.5) 100%);\n  padding: 0.5rem;\n  margin: 0rem 2rem;\n}\n.sessioncontrols.window button:first-child icon, .sessioncontrols.window button:nth-child(2) icon, .sessioncontrols.window button:nth-child(3) icon, .sessioncontrols.window button:last-child icon {\n  min-width: 2em;\n  min-height: 2em;\n  font-size: 3rem;\n}\n.sessioncontrols.window button label,\n.sessioncontrols.window button icon {\n  color: rgb(255, 140, 0);\n  font-size: 2rem;\n}\n.sessioncontrols.window button label {\n  font-size: 1.75rem;\n}\n.sessioncontrols.window button:hover icon, .sessioncontrols.window button:focus icon, .sessioncontrols.window button:active icon {\n  animation: spin 1s infinite;\n}\n.sessioncontrols.window button:hover {\n  border-left: 0.5rem dashed red;\n  border-right: 0.5rem dashed red;\n  background: linear-gradient(0deg, rgba(255, 0, 0, 0.5) 0%, rgb(255, 0, 0) 15%, rgba(0, 0, 0, 0) 50%, rgb(255, 0, 0) 85%, rgba(255, 0, 0, 0.5) 100%);\n}\n.sessioncontrols.window button:hover label {\n  color: rgb(0, 0, 255);\n}\n.sessioncontrols.window button:focus, .sessioncontrols.window button:active {\n  border-left: 0.5rem dashed rgb(255, 255, 0);\n  border-right: 0.5rem dashed rgb(255, 255, 0);\n  background: linear-gradient(0deg, rgba(255, 255, 0, 0.5) 0%, rgb(255, 255, 0) 15%, rgba(0, 0, 0, 0) 50%, rgb(255, 255, 0) 85%, rgba(255, 255, 0, 0.5) 100%);\n}\n.sessioncontrols.window button:focus label, .sessioncontrols.window button:active label {\n  color: rgb(0, 0, 255);\n}\n\n.bluetooth.devicelist-header {\n  color: rgb(255, 140, 0);\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  padding: 0.25rem 1rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.bluetooth.devicelist-header.controls {\n  border: unset;\n  box-shadow: unset;\n  padding: unset;\n}\n.bluetooth.devicelist-header.controls button.power-on {\n  color: rgb(155, 255, 15);\n}\n.bluetooth.devicelist-header.controls button.power-off {\n  color: rgb(255, 0, 0);\n}\n.bluetooth.devicelist-header.controls button:hover label {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-header.controls button:hover icon {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-header .refreshing {\n  color: rgb(155, 255, 15);\n}\n.bluetooth.devicelist-header .refreshing icon {\n  animation: spin 1s infinite linear;\n}\n.bluetooth.devicelist-inner {\n  color: rgb(255, 140, 0);\n  padding: 0.25rem;\n}\n.bluetooth.devicelist-inner.controls {\n  all: unset;\n  background: transparent;\n  border-radius: 2rem;\n  border-left: 2px solid #0f9bff;\n  padding: 0rem 0.5rem;\n  box-shadow: -0.75rem 0rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.bluetooth.devicelist-inner.controls icon {\n  font-size: 1.25rem;\n}\n.bluetooth.devicelist-inner.controls button {\n  all: unset;\n}\n.bluetooth.devicelist-inner.controls button:hover label {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-inner.controls button:hover icon {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-inner.items {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n}\n.bluetooth.devicelist-inner.items button label {\n  color: rgb(255, 140, 0);\n}\n.bluetooth.devicelist-inner.items button icon {\n  color: rgb(255, 140, 0);\n}\n.bluetooth.devicelist-inner.items button:hover label {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-inner.items button:hover icon {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.devicelist-inner.items.itemicon {\n  color: rgb(155, 255, 15);\n}\n.bluetooth.devicelist-inner.items.connected {\n  border-color: rgb(155, 255, 15);\n}\n.bluetooth.devicelist-inner.items.connected label {\n  color: rgb(155, 255, 15);\n}\n.bluetooth.barbutton:hover {\n  color: rgb(0, 0, 255);\n}\n.bluetooth.barbutton-label {\n  color: rgb(15, 155, 255);\n}\n\n.network.barbutton {\n  color: rgb(255, 140, 0);\n}\n.network.barbutton:hover {\n  color: rgb(0, 0, 255);\n}\n.network .ethernet.container {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  color: rgb(255, 140, 0);\n  padding: 0.5rem 1rem;\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.network .ethernet.dim {\n  opacity: 0.7;\n}\n\n.network .wifi.container {\n  color: rgb(255, 140, 0);\n  padding: 0.5rem 1rem;\n}\n.network .wifi entry {\n  box-shadow: inset 0px 0px 7px rgba(15, 155, 255, 0.8);\n  border-radius: 2rem;\n  border: 1px solid rgb(15, 155, 255);\n  padding: 0.1rem 0.75rem;\n}\n.network .wifi entry selection {\n  color: rgb(0, 0, 255);\n  background: rgba(255, 140, 0, 0.7);\n}\n.network .wifi.header {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  color: rgb(255, 140, 0);\n  box-shadow: 0rem 0.5rem 0.5rem -0.25rem rgba(15, 155, 255, 0.8);\n  padding: 0.25rem 1rem;\n}\n.network .wifi.header button.enabled {\n  color: rgb(155, 255, 15);\n}\n.network .wifi.header button.disabled {\n  color: grey;\n}\n.network .wifi.header button:hover {\n  color: rgb(0, 0, 255);\n}\n.network .wifi.connected {\n  background: transparent;\n  border-bottom: 2px solid rgb(155, 255, 15);\n  border-radius: 2rem;\n  padding: 0.25rem 0.5rem;\n}\n.network .wifi.connected label {\n  color: rgb(155, 255, 15);\n}\n.network .wifi.connected.controls {\n  all: unset;\n  background: transparent;\n  border-radius: 2rem;\n  border-left: 2px solid #0f9bff;\n  padding: 0rem 0.5rem;\n  box-shadow: -0.75rem 0rem 0.35rem -0.25rem rgba(15, 155, 255, 0.8);\n}\n.network .wifi.connected.controls icon {\n  font-size: 1rem;\n}\n.network .wifi.connected.controls button {\n  all: unset;\n}\n.network .wifi.connected.controls button:hover icon {\n  color: rgb(255, 0, 0);\n}\n\n.corner {\n  background: linear-gradient(0deg, rgb(0, 0, 0) 0%, rgb(15, 155, 255) 54%, rgb(0, 0, 0) 100%);\n  border-radius: 1rem;\n  margin: 3rem 10rem;\n}\n\n.angleRight {\n  color: #0f9bff;\n  background: rgba(0, 0, 0, 0.5);\n  border: 2px solid #0f9bff;\n}\n.angleLeft {\n  color: #0f9bff;\n  background: rgba(0, 0, 0, 0.5);\n  border: 2px solid #0f9bff;\n}\n\n.angleLarge {\n  color: #0f9bff;\n  background: rgba(0, 0, 0, 0.5);\n  border: 2px solid #0f9bff;\n  border-width: 0.5rem;\n}\n\n.spacer {\n  min-width: 10px;\n}\n\n.Slider {\n  min-width: 15rem;\n}\n.Slider trough {\n  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.25) 30%, rgb(0, 255, 0) 50%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 100%);\n  border-radius: 20rem;\n  min-height: 12px;\n}\n.Slider highlight {\n  background: linear-gradient(0deg, rgba(0, 255, 0, 0.25) 0%, rgba(0, 0, 255, 0.75) 30%, rgb(0, 255, 255) 50%, rgba(0, 0, 255, 0.75) 70%, rgba(0, 255, 0, 0.25) 100%);\n  border-radius: 20rem;\n  min-width: 16px;\n}\n.Slider slider {\n  min-height: 15px;\n  min-width: 15px;\n  border-radius: 20px;\n  background-color: blue;\n  border: none;\n  box-shadow: 0px 0px 4px white;\n}\n\n.stackSidebar,\n.stackSwitcher {\n  color: rgb(255, 140, 0);\n}\n.stackSidebar .needsAttention,\n.stackSwitcher .needsAttention {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n  border-color: red;\n}\n.stackSidebar button,\n.stackSwitcher button {\n  border-radius: 2rem;\n  padding: 0rem 0.5rem;\n}\n.stackSidebar button:checked,\n.stackSwitcher button:checked {\n  border-radius: 2rem;\n  border-bottom: 2px solid #0f9bff;\n}\n.stackSidebar button:hover,\n.stackSwitcher button:hover {\n  box-shadow: inset 0px -2px 6px #0f9bff;\n}\n\n.stackSidebar {\n  background-color: rgb(255, 0, 0);\n  min-height: 10rem;\n  min-width: 2rem;\n}\n\nspinner {\n  color: rgb(155, 255, 15);\n  animation: spin 1s linear infinite;\n}\n\n@keyframes lowBlink {\n  0% {\n    color: #ff0000;\n  }\n  50% {\n    color: #ffff00;\n  }\n  100% {\n    color: #000066;\n  }\n}\n.BarBTN {\n  background: rgba(0, 0, 0, 0.5);\n  border-top: 2px solid #0f9bff;\n  border-radius: 1rem;\n  -gtk-icon-style: symbolic;\n}\n.BarBTN icon {\n  font-size: 1.15rem;\n}\n.BarBTN:hover {\n  color: rgb(0, 0, 255);\n}\n.BarBTN:hover icon {\n  animation: spin 1s infinite;\n}\n\n.BarBTN2 {\n  font-size: 1.4rem;\n  -gtk-icon-style: symbolic;\n}\n.BarBTN2:hover {\n  color: rgb(0, 0, 255);\n  animation: spin 1s infinite;\n}\n\ntooltip * {\n  all: unset;\n  background-color: transparent;\n  border: none;\n}\ntooltip > * > * {\n  background: black;\n  border-radius: 2rem;\n  border: 0.1rem solid rgba(0, 0, 0, 0);\n  color: rgb(255, 140, 0);\n  padding: 0.75rem;\n  margin: 4px;\n  box-shadow: 0 0 5px 0 rgb(15, 155, 255);\n}';

// ../../../../../../usr/share/astal/gjs/src/jsx/jsx-runtime.ts
function isArrowFunction(func) {
  return !Object.hasOwn(func, "prototype");
}
function jsx(ctor2, { children, ...props }) {
  children ??= [];
  if (!Array.isArray(children))
    children = [children];
  children = children.filter(Boolean);
  if (typeof ctor2 === "string")
    return ctors[ctor2](props, children);
  if (children.length === 1)
    props.child = children[0];
  else if (children.length > 1)
    props.children = children;
  if (isArrowFunction(ctor2))
    return ctor2(props);
  return new ctor2(props);
}
var ctors = {
  box: Box,
  button: Button,
  centerbox: CenterBox,
  circularprogress: CircularProgress,
  drawingarea: DrawingArea,
  entry: Entry,
  eventbox: EventBox,
  // TODO: fixed
  // TODO: flowbox
  icon: Icon,
  label: Label,
  levelbar: LevelBar,
  // TODO: listbox
  overlay: Overlay,
  revealer: Revealer,
  scrollable: Scrollable,
  slider: Slider,
  stack: Stack,
  switch: Switch,
  window: Window
};

// app.tsx
function ClipHistItem(entry2) {
  const [id, ..._content] = entry2.split("	");
  const content = _content.join(" ").trim();
  let imageRevealer = Variable(false);
  let clickCount = 0;
  const createButton = (id2, content2, onClick) => /* @__PURE__ */ jsx("button", { className: "cliphist item", on_click: onClick, children: /* @__PURE__ */ jsx(
    "label",
    {
      label: `${id2} - ${content2}`,
      xalign: 0,
      valign: default5.Align.CENTER,
      halign: default5.Align.START,
      ellipsize: Pango.EllipsizeMode.END,
      widthRequest: winwidth(0.15)
    }
  ) });
  const button = createButton(id, content, () => {
    clickCount++;
    if (clickCount === 1) {
      imageRevealer.set(!imageRevealer.get());
    }
    if (clickCount === 2) {
      application_default.toggle_window("cliphist");
      execAsync(`${default7.get_user_config_dir()}/ags/scripts/cliphist.sh --copy-by-id ${id}`);
      clickCount = 0;
      entry2.set_text("");
    }
  });
  button.connect("focus-out-event", () => {
    clickCount = 0;
  });
  return /* @__PURE__ */ jsx("box", { vertical: true, visible: true, children: button });
}
var entry = /* @__PURE__ */ jsx(
  "entry",
  {
    className: "search",
    placeholder_text: "Search",
    hexpand: true,
    halign: default5.Align.FILL,
    valign: default5.Align.CENTER,
    activates_default: true,
    focusOnClick: true,
    onChanged: ({ text }) => {
      const searchText = (text ?? "").toLowerCase();
      list.children.forEach((item) => {
        item.visible = item.attribute.content.toLowerCase().includes(searchText);
      });
    }
  }
);
var list = /* @__PURE__ */ jsx("box", { vertical: true, spacing: 5 });
var output;
var entries;
var clipHistItems;
var widgets;
async function repopulate() {
  output = await execAsync(`${default7.get_user_config_dir()}/ags/scripts/cliphist.sh --get`).then((str) => str).catch((err) => {
    print(err);
    return "";
  });
  entries = output.split("\n").filter((line) => line.trim() !== "");
  clipHistItems = entries.map((entry2) => {
    let [id, ...content] = entry2.split("	");
    return { id: id.trim(), content: content.join(" ").trim(), entry: entry2 };
  });
  widgets = clipHistItems.map((item) => ClipHistItem(item.entry));
  list.children = widgets;
}
repopulate();
function ClipHistWidget() {
  const scrollableList = /* @__PURE__ */ jsx(
    "scrollable",
    {
      halign: default5.Align.FILL,
      valign: default5.Align.FILL,
      vexpand: true,
      children: list
    }
  );
  const header = () => {
    const clear = /* @__PURE__ */ jsx(
      "button",
      {
        className: "clear_hist",
        valign: default5.Align.CENTER,
        on_clicked: () => {
          execAsync(`cliphist wipe`).then(repopulate).catch(console.error);
          entry.set_text("");
        },
        children: /* @__PURE__ */ jsx("icon", { icon: icons_default.cliphist.delete, halign: default5.Align.FILL, valign: default5.Align.FILL })
      }
    );
    const refresh = /* @__PURE__ */ jsx(
      "button",
      {
        className: "clear_hist",
        valign: default5.Align.CENTER,
        onClicked: () => {
          repopulate();
          entry.set_text("");
        },
        children: /* @__PURE__ */ jsx("icon", { icon: icons_default.ui.refresh, halign: default5.Align.FILL, valign: default5.Align.FILL })
      }
    );
    return /* @__PURE__ */ jsx("box", { className: "cliphist header", children: [entry, clear, refresh] });
  };
  const theGrid = new Grid({
    className: "cliphist contentgrid",
    halign: default5.Align.FILL,
    valign: default5.Align.FILL,
    hexpand: true,
    vexpand: true,
    visible: true
  });
  theGrid.attach(header(), 1, 1, 1, 1);
  theGrid.attach(scrollableList, 1, 2, 1, 1);
  return /* @__PURE__ */ jsx("box", { orientation: default5.Orientation.VERTICAL, className: "cliphist container", halign: default5.Align.FILL, valign: default5.Align.FILL, children: theGrid });
}
function cliphist() {
  const eventHandler = /* @__PURE__ */ jsx(
    "eventbox",
    {
      halign: default5.Align.FILL,
      valign: default5.Align.FILL,
      onClick: (_, event) => {
        const win = application_default.get_window("cliphist");
        if (event.button === default6.BUTTON_PRIMARY && win?.visible) {
          win.visible = false;
        }
      },
      widthRequest: winwidth(0.75),
      heightRequest: winheight(0.75)
    }
  );
  const masterGrid = new Grid({
    className: "cliphist mastergrid",
    halign: default5.Align.FILL,
    valign: default5.Align.FILL,
    hexpand: true,
    vexpand: true,
    visible: true
  });
  masterGrid.attach(eventHandler, 1, 1, 1, 1);
  masterGrid.attach(ClipHistWidget(), 2, 1, 1, 1);
  return /* @__PURE__ */ jsx(
    "window",
    {
      name: "cliphist",
      className: "cliphistory",
      application: application_default,
      layer: default2.Layer.OVERLAY,
      exclusivity: default2.Exclusivity.NORMAL,
      keymode: default2.Keymode.ON_DEMAND,
      visible: false,
      anchor: default2.WindowAnchor.TOP | default2.WindowAnchor.BOTTOM | default2.WindowAnchor.RIGHT,
      onKeyPressEvent: (_, event) => {
        const win = application_default.get_window("cliphist");
        if (event.get_keyval()[1] === default6.KEY_Escape && win?.visible) {
          win.visible = false;
          entry.set_text("");
        }
      },
      children: masterGrid
    }
  );
}
application_default.start({
  css: main_default,
  main() {
    cliphist();
  }
});
