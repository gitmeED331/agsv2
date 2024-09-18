import { App, Astal, execAsync, Gdk, Gtk } from "astal";
import Icon, { Icons } from "../lib/icons.js";
import { winheight } from "../lib/screensizeadjust";
import { SessionControls } from "../Widgets/index"


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
  >
    <eventbox
      onClick={() => App.toggle_window("sessioncontrols")}
      onKeyPressEvent={(_, event) => {
        if (event.get_keyval()[1] === Gdk.KEY_Escape) {
          App.toggle_window("sessioncontrols");
        }
      }}
      widthRequest={winheight(1)}
      heightRequest={winheight(1)}
    >
      <SessionControls />
    </eventbox>
  </window>;
};
