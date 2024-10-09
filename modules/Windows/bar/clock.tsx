import { App, Gtk, Variable, Astal, bind, Gdk } from "astal";
import { dashboardLeftStack } from "../dashboard/LeftSide";
import { dashboardRightStack } from "../dashboard/RightSide";

export default function Clock() {
  const time = Variable("").poll(1000, 'date "+%H:%M:%S"');
  const date = Variable("").poll(1000, 'date "+%a %b %d"');
  return (
    <button
      className="clock"
      cursor="pointer"
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("dashboard");
          if (win) {
            const isLeftVisible = dashboardLeftStack.get_visible_child_name() !== "calendar";
            const isRightVisible = dashboardRightStack.get_visible_child_name() !== "notifications";
            if (!win.visible || isLeftVisible || isRightVisible) {
              dashboardLeftStack.set_visible_child_name("calendar");
              dashboardRightStack.set_visible_child_name("notifications");
              win.visible = !win.visible;
            }
            else { win.visible = !win.visible }
          }
        }
        // else if (event.button === Gdk.BUTTON_SECONDARY) {

        // } else if (event.button === Gdk.BUTTON_MIDDLE) {

        // }
      }}
    >
      <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={5}>
        <label label={bind(date)} />
        <icon icon="nix-snowflake-symbolic" />
        <label label={bind(time)} />
      </box>
    </button>
  );
}
