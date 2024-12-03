import { Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, Variable } from "astal";
import Pango from "gi://Pango";
import AstalRiver from "gi://AstalRiver";

export default function AppTitleTicker() {
	const river = AstalRiver.get_default()!;

	const CustomButton = ({ action, ...props }: { action: "focused" } & Widget.ButtonProps) => {
		// const focusedIcon = Variable<string>("");
		// const focusedTitle = Variable<string>("");

		const Bindings = Variable.derive([bind(river, "focused_view")], (focused) => ({
			primarycmd: {
				focused: focused
					? () => {
							const win = App.get_window("overview");
							if (win) {
								win.visible = !win.visible;
							}
						}
					: "",
			}[action],
			secondarycmd: {
				focused: focused ? () => execAsync(`riverctl focus-view close`) : "",
			}[action],
			// icon: {
			// focused: focused ? Icons(focused.as(i => i)) : Icon.ui.desktop,
			// }[action],
			label: {
				focused: focused ? focused : "Desktop",
			}[action],
		}))();

		return (
			<button
				className={"AppTitleTicker"}
				// visible={bind(focusedTitle).as(i => i !== "" ? true : false)}
				visible={true}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						// 	Bindings.get().primarycmd();
					}
					if (event.button === Gdk.BUTTON_SECONDARY) {
						Bindings.get().secondarycmd;
					}
				}}
				{...props}
			>
				<box spacing={5}>
					{/* <icon icon={Bindings.as((i) => i.icon)} valign={CENTER} halign={CENTER} /> */}
					<label label={Bindings.as((l) => l.label)} valign={CENTER} halign={CENTER} ellipsize={Pango.EllipsizeMode.END} useMarkup={true} />
				</box>
			</button>
		);
	};

	// function updateAppInfo() {
	// 	const updateApp = (client: AstalHyprland.Client | null | undefined = hyprland.get_focused_client()) => {
	// 		if (client) {
	// 			appIcon.visible = true;
	// 			focusedIcon.set(Icons(client.get_class()) || client.get_class());
	// 			focusedTitle.set(client.get_title() || client.get_class() || "Unknown App");
	// 		} else {
	// 			appIcon.visible = false;
	// 			focusedTitle.set("Desktop");
	// 		}
	// 	};

	// 	hyprland.connect("notify::focused-client", () => updateApp(hyprland.focusedClient));
	// 	hyprland.connect("client-removed", () => updateApp(hyprland.focusedClient));
	// 	hyprland.connect("client-added", () => {
	// 		updateApp(hyprland.get_client(JSON.parse(hyprland.message("j/activewindow")).address));
	// 	});

	// 	updateApp(hyprland.focusedClient);
	// }

	// updateAppInfo();

	return <CustomButton action={"focused"} />;
}
