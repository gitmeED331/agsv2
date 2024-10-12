import { App, Astal, execAsync, Gdk, Gtk, GLib } from "astal";
import Icon, { Icons } from "../lib/icons.js";
import { winheight, winwidth } from "../lib/screensizeadjust";
import { SessionControls } from "../Widgets/index"
import { Grid } from "../Astalified/index";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase()

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

const theGrid = new Grid({
  halign: Gtk.Align.FILL,
  valign: Gtk.Align.FILL,
  hexpand: true,
  vexpand: true,
  visible: true,
});

theGrid.attach(SessionControls(), 2, 2, 1, 1);
theGrid.attach(eventHandler(1, 1, .25), 1, 1, 3, 1);
theGrid.attach(eventHandler(2, .2, .25), 1, 2, 1, 1);
theGrid.attach(eventHandler(3, .2, .25), 3, 2, 1, 1);
theGrid.attach(eventHandler(4, 1, .25), 1, 3, 3, 1);

export default () => {
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
    exclusivity={Astal.Exclusivity.NORMAL}
    keymode={Astal.Keymode.ON_DEMAND}
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
