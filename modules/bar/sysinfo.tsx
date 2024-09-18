import { Astal, Gtk } from "astal";
import {
  VolumeIndicator,
  BatteryButton,
  NetworkButton,
  BluetoothButton,
} from "../Widgets/index";

//const { RoundedAngleEnd } = Roundedges;

export default function SysInfo() {
  return (
    <box
      className={"sysinfo"}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      spacing={5}
    >
      <VolumeIndicator />
      <NetworkButton />
      <BluetoothButton />
      <BatteryButton />
    </box>
  );
}
