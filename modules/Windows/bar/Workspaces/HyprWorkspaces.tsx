import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import Icon from "../../../lib/icons";

const hyprland = Hyprland.get_default();

const dispatch = (arg: string | number) => {
	execAsync(`hyprctl dispatch workspace ${arg}`);
};
const moveSilently = (arg: string | number) => {
	execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};
const openOverview = (arg: string | number) => {
	const win = App.get_window("overview");
	if (win) {
		win.visible = !win.visible;
	}
};

// --- signal handler ---
function ws(id: number) {
	const getWorkspace = () => hyprland.get_workspace(id) || Hyprland.Workspace.dummy(id, null);

	return Variable(getWorkspace()).observe(hyprland, "workspace-added", getWorkspace).observe(hyprland, "workspace-removed", getWorkspace);
}
// --- end signal handler ---

// --- workspaces ---
function Workspaces({ id }: { id: number }) {
	function workspaceButton(id: number) {
		return bind(ws(id)).as((ws) => {
			const className = Variable.derive(
				[bind(hyprland, "focusedWorkspace"), bind(ws, "clients"), bind(hyprland, "urgent")],
				(focused, clients, urgent) => `
                ${focused === ws ? "focused" : ""}
                ${clients.length > 0 ? "occupied" : ""}
				${urgent ? "urgent" : ""}
                workspacebutton
            `,
			);
			const isVisible = Variable.derive([bind(hyprland, "focusedWorkspace"), bind(ws, "clients")], (focused, clients) => id <= 4 || clients.length > 0 || focused === ws);
			const wsIcon = Icon.wsicon;
			const wsIconLabel = wsIcon[`ws${id}`] ? (
				<icon icon={wsIcon[`ws${id}`]} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			) : (
				<label label={`${id}`} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
			);
			return (
				<button
					className={className()}
					visible={isVisible()}
					valign={Gtk.Align.CENTER}
					halign={Gtk.Align.CENTER}
					cursor="pointer"
					onClick={(_, event) => {
						switch (event.button) {
							case Gdk.BUTTON_PRIMARY:
								dispatch(id);
								break;
							case Gdk.BUTTON_SECONDARY:
								moveSilently(id);
								break;
							case Gdk.BUTTON_MIDDLE:
								openOverview(id);
								break;
							default:
								break;
						}
					}}
				>
					<box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
						{wsIconLabel}
					</box>
				</button>
			);
		});
	}

	const workspaceButtons = [...Array(10).keys()].map((id) => workspaceButton(id + 1));

	return (
		<box className="hyprworkspaces" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
			{workspaceButtons}
		</box>
	);
}

export default Workspaces;