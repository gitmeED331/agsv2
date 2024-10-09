import { Astal, Gtk, App, Gdk, Widget } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import { Grid } from "../../Astalified/index";

// --- imported widgets ---
import { Player, Tray, } from "../../Widgets/index";
import LeftSide from "./LeftSide";
import RightSide from "./RightSide";

const player = Mpris.Player.new("Deezer");

const Lhandler = (
	<eventbox
		halign={Gtk.Align.START}
		valign={Gtk.Align.FILL}
		onClick={(_, event) => {
			const win = App.get_window("dashboard");
			if (event.button === Gdk.BUTTON_PRIMARY) {
				if (win && win.visible === true) {
					win.visible = false;

				}
			}
		}}
		widthRequest={winwidth(.25)}
		heightRequest={winheight(.1)}
	/>
)
const Rhandler = (
	<eventbox
		halign={Gtk.Align.START}
		valign={Gtk.Align.FILL}
		onClick={(_, event) => {
			const win = App.get_window("dashboard");
			if (event.button === Gdk.BUTTON_PRIMARY) {
				if (win && win.visible === true) {
					win.visible = false;

				}
			}
		}}
		widthRequest={winwidth(.25)}
		heightRequest={winheight(.1)}
	/>
)

const bottomhandler = (
	<eventbox
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.FILL}
		onClick={(_, event) => {
			const win = App.get_window("dashboard");
			if (event.button === Gdk.BUTTON_PRIMARY) {
				if (win && win.visible === true) {
					win.visible = false;

				}
			}
		}}
		widthRequest={winwidth(1)}
		heightRequest={winheight(.5)}
	/>
)

function Dashboard() {
	const content = new Grid({
		className: "dashboard grid",
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hexpand: true,
		vexpand: true,
		visible: true,
		baseline_row: 1,
		column_spacing: 5,
		row_spacing: 5,
	});

	const thePlayer = <Player player={player} />

	if (thePlayer) {
		content.insert_row(1);
		content.attach(thePlayer, 2, 1, 3, 1);
	} else { content.remove_row(1) }

	content.attach(Lhandler, 1, 1, 1, 2) // left side
	content.attach(LeftSide(), 2, 2, 1, 1)
	content.attach(Tray(), 3, 2, 1, 1)
	content.attach(RightSide(), 4, 2, 1, 1)
	content.attach(Rhandler, 5, 1, 1, 2) // right side
	content.attach(bottomhandler, 1, 3, 5, 1) // bottom

	return (
		<window
			name={"dashboard"}
			className={"dashboard window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			application={App}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("dashboard");
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) { win.visible = false; }
				}
			}}
		>
			{content}
		</window>
	);
}
export default Dashboard;
