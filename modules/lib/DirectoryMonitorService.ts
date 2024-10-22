import { Astal, Widget, App, Gtk, Gdk } from "astal/gtk3"
import { GLib, Gio, monitorFile } from "astal"
import GObject, { register, property, signal } from "astal/gobject"

const STYLEDIR = `${SRC}/style`

const css = `${SRC}/style.css`
const scss = `${SRC}/style/main.scss`

// @property(String)
// declare myProp: string

// @signal(String, Number)
// declare mySignal: (a: string, b: number) => void


@register()
class DirectoryMonitorService extends GObject.Object {
  constructor() {
    super();
    this.recursiveDirectoryMonitor(STYLEDIR);
  }

  recursiveDirectoryMonitor(directoryPath: string) {
    try {
      const directory = Gio.File.new_for_path(directoryPath);
      const monitor = directory.monitor_directory(Gio.FileMonitorFlags.NONE, null);

      monitor.connect("changed", (_, file, otherFile, eventType) => {
        if (eventType === Gio.FileMonitorEvent.CHANGES_DONE_HINT) {
          this.emit("changed");
        }
      });

      const enumerator = directory.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);
      let fileInfo;
      while ((fileInfo = enumerator.next_file(null)) !== null) {
        const childPath = `${directoryPath}/${fileInfo.get_name()}`;
        if (fileInfo.get_file_type() === Gio.FileType.DIRECTORY) {
          this.recursiveDirectoryMonitor(childPath);
        }
      }
    } catch (error) {
      console.error(`Error monitoring directory: ${directoryPath}`, error);
    }
  }
}

const service = new DirectoryMonitorService();
export default service;