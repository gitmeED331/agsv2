import { App, Widget, Gdk } from "astal/gtk3";
import { bind, execAsync, GLib } from "astal";

function toggleWindowWithMonitor(windowName: string) {
    const monitor = Gdk.Monitor;

    const windowWithMonitor = `${windowName}${monitor}`;

    execAsync(`ags toggle ${windowWithMonitor}`)
}

