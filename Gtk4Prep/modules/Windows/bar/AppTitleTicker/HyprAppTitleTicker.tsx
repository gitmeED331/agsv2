import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, Variable } from "astal";
import Pango from "gi://Pango";
import Icon from "../../../lib/icons";
import AstalHyprland from "gi://AstalHyprland";

const hyprland = AstalHyprland.get_default();

function AppTitleTicker() {

	const focusedIcon = Variable<string>('');
	const focusedTitle = Variable<string>('');

	const appIcon = (
		<icon
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			icon={bind(focusedIcon)}
		// icon={bind(hyprland, "focusedClient").as((client) => client?.get_class())}
		/>
	);

	const appTitle = (
		<label
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			hexpand={true}
			ellipsize={Pango.EllipsizeMode.END}
			useMarkup={true}
			label={bind(focusedTitle)}
		// label={bind(hyprland, "focusedClient").as((client) => client?.get_title() || client?.get_class())}
		/>
	);

	function updateAppInfo() {
		const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
			if (client !== null && client !== undefined) {
				appIcon.visible = true;
				focusedIcon.set(client?.get_class())
				focusedTitle.set(client?.get_title() || client?.get_class())
			} else {
				appIcon.visible = false;
				focusedTitle.set("Desktop")
			}
		};

		hyprland.connect('notify::focused-client', () => updateApp(hyprland.focusedClient));
		hyprland.connect('client-removed', () => updateApp(hyprland.focusedClient));
		hyprland.connect('client-added', () => {
			updateApp(hyprland.get_client(JSON.parse(hyprland.message('j/activewindow')).address));
		})

		updateApp(hyprland.focusedClient);
	}

	updateAppInfo();

	return (
		<button
			className={"AppTitleTicker"}
			// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
			visible={true}
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
				{[appIcon, appTitle]}
			</box>
		</button>
	);
}

export default AppTitleTicker;
