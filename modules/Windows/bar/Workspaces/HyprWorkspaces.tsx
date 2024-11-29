import { Gdk } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import Icon from "../../../lib/icons";

const dispatch = (arg: string | number) => {
	execAsync(`hyprctl dispatch workspace ${arg}`);
};
const moveSilently = (arg: string | number) => {
	execAsync(`hyprctl dispatch movetoworkspacesilent ${arg}`);
};

// --- signal handler ---
function ws(id: number) {
	const hyprland = Hyprland.get_default();
	const getWorkspace = () => hyprland.get_workspace(id) ?? Hyprland.Workspace.dummy(id, null);

	return Variable(getWorkspace())
		.observe(hyprland, "workspace-added", getWorkspace)
		.observe(hyprland, "workspace-removed", getWorkspace)
}
// --- end signal handler ---

const monitorID = Gdk.Display.get_default()!.get_n_monitors() - 1

// --- workspaces ---
function Workspaces() {
	const hyprland = Hyprland.get_default();

	function workspaceButton(id: number) {
		return bind(ws(id)).as((ws) => {
			// bind(hyprland.monitors[monitorID], "activeWorkspace")
			// ${ active === ws ? "active" : "" }
			const classname = Variable.derive(
				[bind(hyprland, "focusedWorkspace"),
				bind(ws, "clients")],
				(focused, clients) => `
				${focused === ws ? "focused" : ""}
                ${clients.length > 0 ? "occupied" : ""}
                workspacebutton
            `
			)();

			const isVisible = Variable.derive(
				[bind(hyprland, "focusedWorkspace"), bind(ws, "clients")],
				(focused, clients) => id <= 4 || clients.length > 0 || focused === ws
			)();

			const wsIcon = Icon.wsicon;
			// @ts-expect-error
			const wsIconLabel = wsIcon[`ws${id}`] ? (
				// @ts-expect-error
				<icon icon={wsIcon[`ws${id}`]} halign={CENTER} valign={CENTER} />
			) : (
				<label label={`${id}`} halign={CENTER} valign={CENTER} />
			);
			return (
				<button
					className={classname}
					visible={isVisible}
					valign={CENTER}
					halign={CENTER}
					cursor="pointer"
					onClick={(_, event) => {
						switch (event.button) {
							case Gdk.BUTTON_PRIMARY:
								dispatch(id);
								break;
							case Gdk.BUTTON_SECONDARY:
								moveSilently(id);
								break;
							// case Gdk.BUTTON_MIDDLE:
							// 	break;
							default:
								break;
						}
					}}
				>

					{wsIconLabel}
				</button >
			);
		});
	}

	const workspaceButtons = [...Array(10).keys()].map((id) => workspaceButton(id + 1));

	return (
		<box
			className="hyprworkspaces"
			halign={CENTER}
			valign={CENTER}
			// spacing={10}
			hexpand={true}
		>
			{
				workspaceButtons.map((button, index) => (
					button
				))
			}
		</ box >
	)
}

export default Workspaces;