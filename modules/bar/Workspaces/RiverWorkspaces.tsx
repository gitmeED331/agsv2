import { Widget, App, bind, execAsync, Gtk, Gdk, Variable } from "astal";
import AstalRiver from "gi://AstalRiver";


const river = AstalRiver.River.get_default()!;
const display = Gdk.Screen.get_default()

const output = river.get_output(display?.get_monitor_plug_name(0) || "eDP-1");

function classname(i) {
	if (output == null) return new Variable("");
	const cname = Variable.derive([bind(output, "focused_tags"), bind(output, "urgent_tags"), bind(output, "occupied_tags")], (isFocused, isUrgent, isOccupied) => {
		const classList = ["workspacebutton"];
		if ((isOccupied & (1 << (i - 1))) !== 0) {
			classList.push("occupied");
		}
		if ((isFocused & (1 << (i - 1))) !== 0) {
			classList.push("focused");
		}
		if ((isUrgent & (1 << (i - 1))) !== 0) {
			classList.push("urgent");
		}
		return classList.join(" ");
	});
	return cname
}

const WorkspaceButton = (i) => {
	return (
		<button
			className={bind(classname(i))}
			visible={true}
			valign={Gtk.Align.CENTER}
			halign={Gtk.Align.CENTER}
			cursor="pointer"
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					output.focused_tags = 1 << (i - 1);
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					output.focused_tagss ^= (1 << (i - 1));
				}
			}}
		>
			<label label={`${i}`} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
		</button>
	);
};

function Workspaces() {
	const workspaceButtons = Array.from({ length: 6 }, (_, i) => i + 1).map(i => WorkspaceButton(i, output));

	return (
		<box className="riverworkspaces" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
			{workspaceButtons}
		</box>
	);
}

export default Workspaces;

