import { App, bind, Gdk, Gtk, Variable } from "astal";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../../lib/icons";
import { winwidth } from "../../../lib/screensizeadjust";
import Hyprland from "gi://AstalHyprland";
import AstalApps from "gi://AstalApps";

const Applications = AstalApps.Apps.new();

const hyprland = Hyprland.get_default();

function AppTitleTicker() {
	// const client = bind(hyprland, "focusedClient");
	const focusedIcon = Variable<string>("");
	const focusedTitle = Variable<string>("");
	const focusedClass = Variable<string>("");

	let lastFocused: string | undefined;

	const updateVars = (client: Hyprland.Client | null | undefined = hyprland.get_focused_client()) => {
		lastFocused = client?.get_address();
		const app = Applications.query(client?.get_class() ?? "", false)[0];

		focusedIcon.set(app.icon_name);
		focusedTitle.set(client?.get_title() ?? "");
		focusedClass.set(client?.get_class() ?? "");
		const id = client?.connect("notify::title", (c) => {
			if (c.get_address() !== lastFocused) {
				c.disconnect(id);
			}
			focusedTitle.set(c.get_title());
			focusedClass.set(c.get_class());
			focusedIcon.set(c.get_icon_name());
		});
	};

	updateVars();
	hyprland.connect('notify::focused-client', () => updateVars());
	hyprland.connect('client-removed', () => updateVars());
	hyprland.connect('client-added', () => {
		updateVars(hyprland.get_client(JSON.parse(hyprland.message('j/activewindow')).address));
	});

	return (
		<button
			className={"AppTitleTicker"}
			visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
			onClick={(_, event) => {
				const win = App.get_window("overview");
				switch (event.button) {
					case Gdk.BUTTON_PRIMARY:
						if (win) {
							win.visible = !win.visible;
						}
						break;
					case Gdk.BUTTON_SECONDARY:
						hyprland.focusedClient.kill();
						break;
					case Gdk.BUTTON_MIDDLE:
						break;
					default:
						break;
				}
			}}
		>
			<box spacing={5}>
				<icon valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} icon={bind(focusedIcon)} />

				<label
					label={bind(focusedTitle)}
					valign={Gtk.Align.CENTER}
					halign={Gtk.Align.CENTER}
					hexpand={true}
					ellipsize={Pango.EllipsizeMode.END} // truncate
					useMarkup={true}
				/>
			</box>

			{/* 						<box spacing={5}>
							{c.class ? (
								<icon
									valign={Gtk.Align.CENTER}
									halign={Gtk.Align.CENTER}
									icon={bind(hyprland, "icon_name")}
								/>
							) : null}
							{c.title || c.class ? (
								<label
									valign={Gtk.Align.CENTER}
									halign={Gtk.Align.CENTER}
									hexpand={true}
									ellipsize={Pango.EllipsizeMode.END} // truncate
									useMarkup={true}
									label={bind(hyprland, "title") || "Desktop"}
								/>
							) : null}
						</box>
					 */}
		</button>
	);
}

export default AppTitleTicker;
