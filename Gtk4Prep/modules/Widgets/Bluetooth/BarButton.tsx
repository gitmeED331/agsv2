import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { Variable, bind } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";
import { dashboardRightStack } from "../../Windows/dashboard/RightSide";

const Bluetooth = AstalBluetooth.get_default();

let btreveal = Variable(false);

const BluetoothWidget = () => {
  const updateLabel = (btLabel) => {
    const btEnabled = Bluetooth.is_powered;
    const btDevices = Bluetooth.is_connected;
    const label = btEnabled && btDevices.length ? ` (${btDevices.length})` : btEnabled ? "On" : "Off";
    btLabel.label = label;
  };

  Bluetooth.connect('notify::enabled', updateLabel);
  Bluetooth.connect('notify::connected_devices', updateLabel);

  return (
    <box
      className={"bluetooth barbutton content"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      visible={true}
    >
      {bind(Bluetooth, "is_powered").as((showLabel) => (
        <box>
          <icon
            className={"bluetooth barbutton-icon"}
            icon={bind(Bluetooth, "is_powered").as((v) => v ? Icon.bluetooth.enabled : Icon.bluetooth.disabled)}
          />
          <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
            clickThrough={true}
            reveal_child={bind(btreveal)}
          >
            <label
              className={"bluetooth barbutton-label"}
              setup={updateLabel}
            />
          </revealer>
        </box>
      ))}
    </box>
  );
};

function BluetoothButton() {
  return (
    <button
      className={"bluetooth barbutton"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const dashTab = "bluetooth"
          const win = App.get_window("dashboard");
          const dashboardTab = dashboardRightStack.get_visible_child_name() === dashTab;
          const setDashboardTab = dashboardRightStack.set_visible_child_name(dashTab);
          if (win) {
            if (win.visible === true && !dashboardTab) { setDashboardTab }
            else if (win.visible === true && dashboardTab) { win.visible = !win.visible; }
            else { win.visible = !win.visible }
          }
        }
        if (event.button === Gdk.BUTTON_SECONDARY) {
          btreveal.set(!btreveal.get())
        }
      }}
    >
      <BluetoothWidget />
    </button >
  );
}
export default BluetoothButton;
