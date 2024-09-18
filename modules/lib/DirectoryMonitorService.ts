import { Astal, Widget, App, Gtk, Gdk, GLib, Gio, monitorFile } from "astal"

const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

const css = `${GLib.get_user_config_dir()}/astal-gjs/dist/style.css`
const scss = `${GLib.get_user_config_dir()}/astal-gjs/src/style/main.scss`

class DirectoryMonitorService {
  static {
    Astal.register(this, {}, {});
  }

  constructor() {
    super();
    this.recursiveDirectoryMonitor(STYLEDIR);
  }

  recursiveDirectoryMonitor(STYLEDIR) {

    monitorFile(STYLEDIR, (_, eventType) => {
      if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
        this.emit("changed");
      }
    }, "directory");

    const directory = Gio.File.new_for_path(STYLEDIR);
    const enumerator = directory.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);

    let fileInfo;
    while ((fileInfo = enumerator.next_file(null)) !== null) {
      const childPath = STYLEDIR + "/" + fileInfo.get_name();
      if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
        this.recursiveDirectoryMonitor(childPath);
      }
    }
  }
}

const service = new DirectoryMonitorService();
export default service;
