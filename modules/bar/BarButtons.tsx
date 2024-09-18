import { App, Gtk, Gdk } from "astal";
import { Icons } from "../lib/icons";
const DashboardButton = () => {
  return (
    <button
      className={"BarBTN"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      css={`
        padding: 0rem 0.25rem;
      `}
      tooltip_text="Dashboard"
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("dashboard");
          if (win) { win.visible = !win.visible; }
        }
      }}
    >
      <icon icon="nix-snowflake-symbolic" />
    </button>
  );
};

const SessionControlButton = () => {
  return (
    <button
      className={"BarBTN"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      css={`
        padding: 0rem 0.25rem;
      `}
      tooltip_text="Power Menu"
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("sessioncontrols");
          if (win) {
            win.visible = !win.visible;
          }
        }
      }}
    >
      <icon icon={Icons("power-symbolic")} />
    </button>
  );
};

export { DashboardButton, SessionControlButton };
