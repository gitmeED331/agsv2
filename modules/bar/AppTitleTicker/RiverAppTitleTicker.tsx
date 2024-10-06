import { App, bind, Gtk, GLib, Gdk, execAsync } from "astal";
import Pango from "gi://Pango";
import { Icons } from "../../lib/icons";

import AstalRiver from "gi://AstalRiver";
const river = AstalRiver.get_default()!;

function AppTitleTicker() {
	return (
		<button
			className={"AppTitleTicker"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("overview");
					if (win) {
						win.visible = !win.visible;
					}
				}

				if (event.button === Gdk.BUTTON_SECONDARY) {
					execAsync(`riverctl focus-view close`);
				}
			}}
		>
			<box spacing={5}>
				{/* <icon valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} icon={bind(river, "focused_view").as((i) => i)} /> */}
				<label valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} hexpand={true} ellipsize={Pango.EllipsizeMode.END} label={bind(river, "focused_view").as(v => v || "Desktop")} />

			</box>
		</button>
	);
}

export default AppTitleTicker;
