import { App, Widget, Astal, execAsync, exec, bind, Gtk, Gdk, GObject } from "astal";
import Icon, { Icons } from "../lib/icons";
import AstalPowerProfiles from "gi://AstalPowerProfiles";

const powerprofile = AstalPowerProfiles.get_default();

const SysButton = (action: string, label: string) => (
  <button
    onClick={(_, event) => {
      if (event.button === Gdk.BUTTON_PRIMARY) {
        (powerprofile.activeProfile = action);
        currentBrightness();
      }
    }}
    className={bind(powerprofile, "activeProfile").as((c) => (c === action ? c : ""))}
  >
    <box vertical={true}>
      <icon icon={Icon.powerprofile[action]} />
      <label label={label} visible={label !== ""} />
    </box>
  </button>
);
function currentBrightness() { return parseInt(exec("light -G").trim()) }
function PowerProfiles() {

  return (
    <box
      className={"powerprofiles container"}
      name={"powerprofiles"}
      vertical={false}
      vexpand={false}
      hexpand={false}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    >
      {SysButton("power-saver", "Saver")}
      {SysButton("balanced", "Balanced")}
      {SysButton("performance", "Performance")}
    </box>
  );
}

export default PowerProfiles;
