import { App, Widget, Variable, Gtk, bind, Gdk } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalBluetooth from "gi://AstalBluetooth";

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
          const win = App.get_window("dashboard");
          if (win && win.visible !== true) {
            win.visible = !win.visible;
            // `RightStack.set_visible_child_name("bluetooth"`
          }
          // if (win && win.visible === true) (StackSetVisibleChild("bluetooth"))
        } else if (event.button === Gdk.BUTTON_SECONDARY) {
          btreveal.set(!btreveal.get())
        }
      }}
    >
      <BluetoothWidget />
    </button>
  );
}
export default BluetoothButton;
