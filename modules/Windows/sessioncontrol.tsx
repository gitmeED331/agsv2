import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync, GLib } from "astal";
import Icon from "../lib/icons.js";
import { winheight, winwidth } from "../lib/screensizeadjust";
import { SessionControls } from "../Widgets/index"
import ClickToClose from "../lib/ClickToClose";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase()

function CTC(eh, w) { return ClickToClose(eh, w, .25, "sessioncontrols") }

function eventHandler(eh: number, width: number, height: number) {
  const eventbox = <eventbox
    halign={Gtk.Align.FILL}
    valign={Gtk.Align.FILL}
    onClick={(_, event) => {
      const win = App.get_window("sessioncontrols");
      if (event.button === Gdk.BUTTON_PRIMARY) {
        if (win && win.visible === true) {
          win.visible = false;
        }
      }
    }}
    widthRequest={winwidth(width)}
    heightRequest={winheight(height)}
  />;
  return eventbox;
}

const theGrid = new Gtk.Grid({
  halign: Gtk.Align.FILL,
  valign: Gtk.Align.FILL,
  hexpand: true,
  vexpand: true,
  visible: true,
});

theGrid.attach(SessionControls(), 2, 2, 1, 1);
// theGrid.attach(ClickToClose(1, 1, .25, "sessioncontrols"), 1, 1, 3, 1);
theGrid.attach(CTC(1, 1), 1, 1, 3, 1);
theGrid.attach(CTC(2, .2), 1, 2, 1, 1);
theGrid.attach(CTC(3, .2), 3, 2, 1, 1);
theGrid.attach(CTC(4, 1), 1, 3, 3, 1);

export default ({ monitor }: { monitor: number }) => {
  <window
    name={"sessioncontrols"}
    className={"sessioncontrols window"}
    anchor={
      Astal.WindowAnchor.TOP |
      Astal.WindowAnchor.BOTTOM |
      Astal.WindowAnchor.LEFT |
      Astal.WindowAnchor.RIGHT
    }
    layer={Astal.Layer.OVERLAY}
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.EXCLUSIVE}
    visible={false}
    application={App}
    onKeyPressEvent={(_, event) => {
      if (event.get_keyval()[1] === Gdk.KEY_Escape) {
        App.toggle_window("sessioncontrols");
      }
    }}
  >
    {theGrid}
  </window>;
};
