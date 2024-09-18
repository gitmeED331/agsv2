import { GObject, Gio, Widget, Astal, readFile, monitorFile, } from "astal";
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class BrightnessService extends GObject.Object {
  _screenValue = 0;
  _maxValue = 0;
  _brightnessFile;
  _interface;
  _path;
  _brightnessPath;
  _maxPath;

  static _init() {
    GObject.registerClass(this, {
      "screen-changed": ["float"],
      "screen-value": ["float", "rw"],
    });
  }

  screen_value() {
    return this._screenValue;
  }

  set screen_value(percent) {
    percent = clamp(percent, 0, 1);
    const fileStream = this._brightnessFile.open_readwrite(null);
    this._screenValue = percent;
    const stream = new Gio.DataOutputStream({
      close_base_stream: true,
      base_stream: fileStream.get_output_stream()
    });
    stream.put_string(Math.floor(percent * this._maxValue).toString(), null);
    fileStream.close(null);
    this.emit("screen-changed", this._screenValue);
    this.notify("screen-value");
  }

  _readBrightness(file) {
    const brightness = Number(readFile(file));
    this._screenValue = brightness / this._maxValue;
    this.emit("screen-changed", this._screenValue);
    this.notify("screen-value");
  }

  constructor() {
    super();
    BrightnessService._init();
    this._interface = exec("sh -c 'ls -w1 /sys/class/backlight | head -1'");
    this._path = `/sys/class/backlight/${this._interface}`;
    this._brightnessPath = `${this._path}/brightness`;
    this._maxPath = `${this._path}/max_brightness`;
    const maxFile = Gio.File.new_for_path(this._maxPath);
    this._maxValue = Number(readFile(maxFile));
    this._brightnessFile = Gio.File.new_for_path(this._brightnessPath);
    this._readBrightness(this._brightnessFile);
    monitorFile(this._brightnessPath, (file) => {
      this._readBrightness(file);
    });
  }

  connect(event = "screen-changed", callback) {
    return super.connect(event, callback);
  }
}

const service = new BrightnessService();
export default service;
