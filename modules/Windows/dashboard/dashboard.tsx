import { Astal, Gtk, App, Gdk } from "astal/gtk3";
import { Grid } from "../../Astalified/index";
import ClickToClose from "../../lib/ClickToClose";

// --- imported widgets ---
import { Tray } from "../../Widgets/index";
import playerStack, { dashboardPlayerStack } from "../../Widgets/MediaPlayer";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";

Gdk.Screen.get_default();

export default function Dashboard(monitor: Gdk.Monitor) {
	const WINDOWNAME = `dashboard${monitor}`;

	App.connect("window-toggled", (_, win) => {
		if (win.visible === false && win.name === WINDOWNAME) {
			dashboardLeftStack.set_visible_child_name("calendar");
			dashboardRightStack.set_visible_child_name("notifications");
			if (dashboardPlayerStack.get_visible_child_name() !== "org.mpris.MediaPlayer2.Deezer"
				&& dashboardPlayerStack.get_visible_child_name() !== "no-media" && (dashboardPlayerStack as any).length > 0) {
				dashboardPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
			}
		}
	});
	return (
		<window
			name={WINDOWNAME}
			className={"dashboard window"}
			gdkmonitor={monitor}
			anchor={TOP | LEFT | RIGHT | BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window(WINDOWNAME);
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						win.visible = false;
					}
				}
			}}
		>
			<Grid
				className={"dashboard grid"}
				halign={FILL}
				valign={FILL}
				hexpand
				vexpand
				visible={true}
				column_spacing={5}
				row_spacing={5}
				rowHomogeneous={false}
				columnHomogeneous={false}
				setup={(self) => {
					// top
					self.attach(playerStack(), 1, 0, 3, 1);

					// main
					self.attach(<ClickToClose id={1} width={0.25} height={0.2} windowName={WINDOWNAME} halign={FILL} valign={FILL} />, 0, 1, 1, 1); // left side
					self.attach(LeftSide(), 1, 1, 1, 1);
					self.attach(Tray(), 2, 1, 1, 1);
					self.attach(RightSide(), 3, 1, 1, 1);
					self.attach(<ClickToClose id={2} width={0.25} height={0.2} windowName={WINDOWNAME} halign={FILL} valign={FILL} />, 4, 1, 1, 1); // right side

					// bottom
					self.attach(<ClickToClose id={3} width={1} height={0.75} windowName={WINDOWNAME} halign={FILL} valign={FILL} />, 0, 2, 5, 1); // bottom
				}}
			/>
		</window>
	);

}
