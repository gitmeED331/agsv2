import { Astal, Gdk, App } from "astal/gtk3";
import { GLib } from "astal";
import { SessionControls } from "../Widgets/index";
import ClickToClose from "../lib/ClickToClose";
import { Grid } from "../Astalified/index";

const wm = GLib.getenv("XDG_CURRENT_DESKTOP")?.toLowerCase();

function CTC(eh: number, w: number) {
	return ClickToClose(eh, w, 0.25, "sessioncontrols");
}

const theGrid = <Grid halign={FILL} valign={FILL} hexpand={true} vexpand={true} visible={true}
	setup={(self) => {
		self.attach(SessionControls(), 2, 2, 1, 1);

		self.attach(CTC(1, 1), 1, 1, 3, 1);
		self.attach(CTC(2, 0.2), 1, 2, 1, 1);
		self.attach(CTC(3, 0.2), 3, 2, 1, 1);
		self.attach(CTC(4, 1), 1, 3, 3, 1);
	}}
/>;



export default (monitor: Gdk.Monitor) => {
	<window
		name={"sessioncontrols"}
		className={"sessioncontrols window"}
		gdkmonitor={monitor}
		anchor={TOP | BOTTOM | LEFT | RIGHT}
		layer={Astal.Layer.OVERLAY}
		exclusivity={Astal.Exclusivity.IGNORE}
		keymode={Astal.Keymode.EXCLUSIVE}
		visible={false}
		application={App}
		onKeyPressEvent={(_, event) => {
			if (event.get_keyval()[1] === Gdk.KEY_Escape) {
				App.toggle_window("sessioncontrols");
			}
		}}
	>
		{theGrid}
	</window>;
};
