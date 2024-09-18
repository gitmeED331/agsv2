import { App, bind, Gtk, Gdk } from "astal";
import Pango from "gi://Pango";
import { Icons } from "../lib/icons";

import Hyprland from "gi://AstalHyprland";
const hyprland = Hyprland.get_default();

function AppTitleTicker() {
  return (
    <button
      className={"AppTitleTicker"}
      visible={bind(hyprland, "focusedClient").as(Boolean)}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("overview");
          if (win) {
            win.visible = !win.visible;
          }
        }

        if (event.button === Gdk.BUTTON_SECONDARY)
          hyprland.focusedClient.kill();
      }}
    >
      <box>
        {bind(hyprland, "focusedClient").as((c) =>
          !c ? (
            <box>No Client focused</box>
          ) : (
            <box spacing={5}>
              <icon
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                icon={bind(c, "class").as((i) => Icons(i))}
              />
              <label
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                hexpand={true}
                ellipsize={Pango.EllipsizeMode.END}
                label={bind(c, "title")}
              />
            </box>
          ),
        )}
      </box>
    </button>
  );
}
export default AppTitleTicker;
