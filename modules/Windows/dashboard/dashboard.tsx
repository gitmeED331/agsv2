import { Astal, Gtk, App, Gdk } from "astal/gtk3";
import { Grid } from "../../Astalified/index";
import ClickToClose from "../../lib/ClickToClose";

// --- imported widgets ---
import { Tray } from "../../Widgets/index";
import playerStack, { dashboardPlayerStack } from "../../Widgets/MediaPlayer";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";

Gdk.Screen.get_default();

function Dashboard(monitor: Gdk.Monitor) {

	return (
		<window
			name={"dashboard"}
			className={"dashboard window"}
			gdkmonitor={monitor}
			anchor={TOP | LEFT | RIGHT | BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("dashboard");
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
				setup={(self) => {
					self.attach(playerStack(), 1, 0, 3, 1);
					self.attach(<ClickToClose id={3} width={0.25} height={0.1} windowName="dashboard" />, 0, 0, 1, 2); // left side
					self.attach(LeftSide(), 1, 1, 1, 1);
					self.attach(Tray(), 2, 1, 1, 1);
					self.attach(RightSide(), 3, 1, 1, 1);
					self.attach(<ClickToClose id={3} width={0.25} height={0.1} windowName="dashboard" />, 4, 0, 1, 2); // right side
					self.attach(<ClickToClose id={3} width={1} height={0.5} windowName="dashboard" />, 0, 2, 5, 1); // bottom
				}}
			/>
		</window>
	);
}

App.connect("window-toggled", (_, win) => {
	if (win.visible === false && win.name === "dashboard") {
		dashboardLeftStack.set_visible_child_name("calendar");
		dashboardRightStack.set_visible_child_name("notifications");
		if (dashboardPlayerStack.get_visible_child_name() !== "org.mpris.MediaPlayer2.Deezer"
			&& dashboardPlayerStack.get_visible_child_name() !== "no-media" && (dashboardPlayerStack as any).length > 0) {
			dashboardPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
		}
	}
});

export default Dashboard;
