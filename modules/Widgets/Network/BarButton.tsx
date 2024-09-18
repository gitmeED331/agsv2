import { bind, Gdk, Gtk, Widget, App, Astal, Variable, Binding } from "astal";
import Icon, { Icons } from "../../lib/icons";
import AstalNetwork from "gi://AstalNetwork";

const network = AstalNetwork.get_default();
const Wired = network.wired;
const Wifi = network.wifi;

let netreveal = Variable(false);

const NetworkWidget = () => {
  const wifiIcon = (
    <icon
      className={"barbutton wifi icon"}
      icon={bind(Wifi, "icon_name")}
    />
  );

  const wifiLabel = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      clickThrough={true}
      reveal_child={bind(netreveal)}
    >
      <label
        className={"barbutton wifi label"}
        label={"--"} // Default label, will be updated dynamically
      />
    </revealer >
  );

  const updateWifiLabel = () => {
    const wifi = network.wifi;
    wifiLabel.label = wifi && wifi.ssid ? `${wifi.ssid.substring(0, 7)}` : "--";
  };

  // Initial label setup
  updateWifiLabel();

  // Watch for changes in WiFi state
  network.connect('notify::wifi', updateWifiLabel);

  const wifiIndicator = (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      visible={bind(network, "wifi").as((showLabel) => !!showLabel)}
    >
      {[wifiIcon, wifiLabel]}
    </box>
  );

  const wiredIcon = (
    <icon
      className={"barbutton wired icon"}
      icon={bind(Wired, "icon_name")}
    />
  );

  const wiredLabel = (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      clickThrough={true}
      reveal_child={bind(netreveal)}
    >
      <label
        className={"network wired label"}
        label={"Wired"}
      />
    </revealer>
  );

  const wiredIndicator = (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      visible={bind(network, "wired").as((showLabel) => !!showLabel)}
    >
      {[wiredIcon, wiredLabel]}
    </box>
  );

  return (
    <box
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      className={"barbutton box"}
      visible={true}
    >
      {bind(network, "primary").as((w) => w === AstalNetwork.Primary.WIRED ? wiredIndicator : wifiIndicator)}
    </box>
  );
};

function NetworkButton() {
  return (
    <button
      className={"network barbutton"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      onClick={(_, event) => {
        if (event.button === Gdk.BUTTON_PRIMARY) {
          const win = App.get_window("dashboard");
          if (win) {
            win.visible = !win.visible;
          }
        }
        if (event.button === Gdk.BUTTON_SECONDARY) {
          netreveal.set(!netreveal.get())
        }
      }}
    >
      <NetworkWidget />
    </button>
  )
};

export default NetworkButton;
