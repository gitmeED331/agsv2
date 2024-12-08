import { Gdk } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Hyprland from "gi://AstalHyprland";
import Icon from "../../../lib/icons";

const monitorID = Gdk.Display.get_default()!.get_n_monitors() - 1

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

// --- workspaces ---
export default function Workspaces() {
	const hyprland = Hyprland.get_default();

	function workspaceButton(id: number) {
		return bind(ws(id)).as((ws) => {
			const Bindings = Variable.derive(
				[bind(hyprland, "focusedWorkspace"), bind(ws, "clients")],
				(focused, clients) => ({
					classname: `
                  		${focused === ws ? "focused" : ""}
                  		${clients.length > 0 ? "occupied" : ""}
                  		workspacebutton
                	`,
					visible: id <= 4 || clients.length > 0 || focused === ws,
					content: Icon.wsicon[`ws${id}` as keyof typeof Icon.wsicon] ? (
						<icon
							icon={Icon.wsicon[`ws${id}` as keyof typeof Icon.wsicon]}
							halign={CENTER}
							valign={CENTER}
						/>
					) : (
						<label
							label={String(id)}
							halign={CENTER}
							valign={CENTER}
						/>
					),
				})
			)();

			return (
				<button
					className={Bindings.as(c => c.classname)}
					visible={Bindings.as(v => v.visible)}
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

					{Bindings.get().content}
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
