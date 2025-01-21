import { Astal, Gtk, App, Gdk } from "astal/gtk3";
import { bind } from "astal";
import { Grid } from "../../Astalified/index";
import PopupWindow from "../../lib/popupwindow";
import Mpris from "gi://AstalMpris";
// --- imported widgets ---
import { Tray } from "../../Widgets/index";
// import playerStack, { dashboardPlayerStack } from "../../Widgets/MediaPlayer";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";
import Player from "../../test";

export default function Dashboard(monitor: Gdk.Monitor) {
	const WINDOWNAME = `dashboard${monitor.get_model()}`;
	const mpr = Mpris.get_default();
	const spotify = Mpris.Player.new("spotify");
	// App.connect("window-toggled", () => {
	// 	const win = App.get_window(WINDOWNAME);
	// 	if (win && win.name === WINDOWNAME) {
	// 		dashboardLeftStack.set_visible_child_name("calendar");
	// 		dashboardRightStack.set_visible_child_name("notifications");
	// 		if (
	// 			dashboardPlayerStack.get_visible_child_name() !== "org.mpris.MediaPlayer2.Deezer" &&
	// 			dashboardPlayerStack.get_visible_child_name() !== "no-media" &&
	// 			(dashboardPlayerStack as any).length > 0
	// 		) {
	// 			dashboardPlayerStack.set_visible_child_name("org.mpris.MediaPlayer2.Deezer");
	// 		}
	// 	}
	// });

	const Content = (
		<Grid
			className={"dashboard grid"}
			halign={CENTER}
			valign={START}
			hexpand
			vexpand
			visible={true}
			column_spacing={5}
			row_spacing={5}
			rowHomogeneous={false}
			columnHomogeneous={false}
			setup={(self) => {
				// top
				// self.attach(playerStack(), 0, 0, 3, 1);
				self.attach(
					<revealer revealChild={bind(spotify, "entry").as((pl) => pl ? true : false)} transitionType={REVEAL_SLIDE_RIGHT} transitionDuration={150}>
						<Player p={spotify} />
					</revealer>,
					0,
					0,
					3,
					1,
				);
				// main
				self.attach(LeftSide(), 0, 1, 1, 1);
				self.attach(Tray(), 1, 1, 1, 1);
				self.attach(RightSide(), 2, 1, 1, 1);
			}}
		/>
	);

	// return <PopupWindow
	// 	name={WINDOWNAME}
	// 	exclusivity={Astal.Exclusivity.NORMAL}
	// 	xcoord={0.2455}
	// 	ycoord={0}
	// 	child={Content}
	// 	transition={REVEAL_SLIDE_DOWN}
	// />

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
			onButtonPressEvent={(_, event) => {
				App.toggle_window(WINDOWNAME);
			}}
		>
			<eventbox
				onButtonPressEvent={(_, event) => {
					return true;
				}}
				halign={CENTER}
				valign={START}
			>
				{Content}
			</eventbox>
		</window>
	);
}
