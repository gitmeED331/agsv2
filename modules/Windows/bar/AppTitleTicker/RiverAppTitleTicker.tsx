import { Gdk, App } from "astal/gtk3";
import { bind, execAsync } from "astal";
import Pango from "gi://Pango";
import AstalRiver from "gi://AstalRiver";

function AppTitleTicker() {
	const river = AstalRiver.get_default()!;
	return (
		<button
			className={"AppTitleTicker"}
			onClick={(_, event) => {
				const win = App.get_window("overview");
				switch (event.button) {
					case Gdk.BUTTON_PRIMARY:
						if (win) {
							win.visible = !win.visible;
						}
						break;
					case Gdk.BUTTON_SECONDARY:
						execAsync(`riverctl focus-view close`);
						break;
					case Gdk.BUTTON_MIDDLE:
						break; // TODO: Implement middle click behavior
					default:
						break;
				}
			}}
		>
			<box spacing={5}>
				{/* <icon valign={CENTER} halign={CENTER} icon={bind(river, "focused_view").as((i) => i)} /> */}
				<label valign={CENTER} halign={CENTER} hexpand={true} ellipsize={Pango.EllipsizeMode.END} label={bind(river, "focused_view").as((v) => v || "Desktop")} />
			</box>
		</button>
	);
}

export default AppTitleTicker;
