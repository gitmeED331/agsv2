import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { Variable, bind } from "astal";
import DateTimeLabel from "../modules/lib/datetime";

export default function Clock() {
	const time = Variable("").poll(1000, 'date "+%H:%M:%S"');
	const date = Variable("").poll(3600000, 'date "+%a %b %d"');
	return (
		<box className={"clock"} halign={Gtk.Align.CENTER} valign={Gtk.Align.START} spacing={10}>
			<DateTimeLabel format="%H:%M:%S" interval={500} />
			<icon icon="nix-snowflake-symbolic" valign={CENTER} halign={CENTER} />
			<DateTimeLabel format="%a %b %d" interval={3600000} />
		</box>
	);
}
