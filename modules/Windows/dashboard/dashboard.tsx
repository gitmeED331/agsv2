import { Astal, Gtk, App, Gdk } from "astal";
import { winheight, winwidth } from "../../lib/screensizeadjust";
import Mpris from "gi://AstalMpris";
import { Grid } from "../../Astalified/index";

// --- imported widgets ---
import { Player, Tray, } from "../../Widgets/index";
import LeftSide, { dashboardLeftStack } from "./LeftSide";
import RightSide, { dashboardRightStack } from "./RightSide";

const player = Mpris.Player.new("Deezer");

function eventHandler(eh: number, width: number, height: number) {
	const eventbox = <eventbox
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
		widthRequest={winwidth(width)}
		heightRequest={winheight(height)}
	/>;
	return eventbox;
}

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
		content.attach(thePlayer, 1, 0, 3, 1);
	} else { content.remove_row(1) }

	content.attach(eventHandler(1, .25, .1), 0, 0, 1, 2) // left side
	content.attach(LeftSide(), 1, 1, 1, 1)
	content.attach(Tray(), 2, 1, 1, 1)
	content.attach(RightSide(), 3, 1, 1, 1)
	content.attach(eventHandler(2, .25, .1), 4, 0, 1, 2) // right side
	content.attach(eventHandler(3, 1, .5), 0, 2, 5, 1) // bottom

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

// App.connect("window-toggled", (_, win) => {
// 	if (win.name === "dashboard") {
// 		dashboardLeftStack.set_visible_child_name("calendar")
// 		dashboardRightStack.set_visible_child_name("notifications")
// 	}
// })

export default Dashboard;
