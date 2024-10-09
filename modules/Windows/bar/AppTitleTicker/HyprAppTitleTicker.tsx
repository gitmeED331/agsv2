import { App, bind, Gdk, Gtk } from "astal";
import Pango from "gi://Pango";
import { Icons } from "../../../lib/icons";
import { winwidth } from "../../../lib/screensizeadjust";
import Hyprland from "gi://AstalHyprland";

const hyprland = Hyprland.get_default();

function AppTitleTicker() {
	const client = bind(hyprland, "focusedClient");

	return (
		<button
			className={"AppTitleTicker"}
			visible={true}
			onClick={(_, event) => {
				const win = App.get_window("overview");
				switch (event.button) {
					case Gdk.BUTTON_PRIMARY:
						if (win) { win.visible = !win.visible; }
						break;
					case Gdk.BUTTON_SECONDARY:
						hyprland.focusedClient.kill();
						break;
					case Gdk.BUTTON_MIDDLE:
						break; // TODO: Implement middle click behavior
					default:
						break;
				}
			}}
		>
			{client.as(c => {
				if (c === null) {
					return <label label="Desktop" />;
				} else {
					return (
						<box spacing={5}>
							{c.class ? (
								<icon
									valign={Gtk.Align.CENTER}
									halign={Gtk.Align.CENTER}
									icon={Icons(c.class)} // Direct access instead of bind
								/>
							) : null}
							{c.title || c.class ? (
								<label
									valign={Gtk.Align.CENTER}
									halign={Gtk.Align.CENTER}
									hexpand={true}
									ellipsize={Pango.EllipsizeMode.END}
									useMarkup={true}
									label={c.title || c.class} // Direct access instead of bind
								/>
							) : null}
						</box>
					);
				}
			})}
		</button>
	);
}

export default AppTitleTicker;
