import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync } from "astal";
import { GridCalendar } from "../Widgets/index";
import { winheight, winwidth } from "../lib/screensizeadjust";

export default function Calendar() {
  return (
    <window
      name={"calendar"}
      className={"window calendar"}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.TOP}
      layer={Astal.Layer.OVERLAY}
      exclusivity={Astal.Exclusivity.NORMAL}
      keymode={Astal.Keymode.EXCLUSIVE}
      visible={false}
      application={App}
    >
      <eventbox
        onKeyPressEvent={(_, event) => {
          if (event.get_keyval()[1] === Gdk.KEY_Escape) { App.toggle_window("calendar") }
        }}
      >
        <box className={"calendarbox"} >
          <GridCalendar />
        </box>
      </eventbox>
    </window>
  );
}
