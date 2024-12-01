import { Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";
import { Stack } from "../../Astalified/index";

function tickerButton(player: Mpris.Player) {
	const CustomLabel = ({ action }: { action: "tracks" | "artists" }) => {
		const Bindings = Variable.derive(
			[bind(player, "title"), bind(player, "artist")],
			(title, artist) => ({
				label: action === "tracks" ? TrimTrackTitle(title) : artist || "Unknown Artist",
				classname: `ticker ${action}`
			})
		)();

		return (
			<label
				className={Bindings.as(b => b.classname)}
				label={Bindings.as(b => b.label)}
				hexpand
				wrap={false}
				// maxWidthChars={35}
				ellipsize={Pango.EllipsizeMode.END}
				halign={CENTER}
				valign={CENTER}
				onDestroy={(self) => { self.destroy() }}
			/>
		);
	}

	return (
		<button
			name={player.busName}
			vexpand={false}
			hexpand
			cursor={"pointer"}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					const win = App.get_window("mediaplayerwindow");
					if (win) {
						win.visible = !win.visible;
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					player.play_pause();
				}

				// if (event.button === Gdk.BUTTON_MIDDLE) {
				// }
			}}
			onScroll={(_, { delta_y }) => {
				delta_y < 0 ? player.previous() : player.next();
			}}
		>
			<box visible spacing={5} halign={CENTER} valign={CENTER}>
				<CustomLabel action="tracks" />
				<icon
					className={"ticker icon"} hexpand={false} halign={CENTER} valign={CENTER}
					tooltip_text={bind(player, "identity")} icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
				/>
				<CustomLabel action="artists" />
			</box>
		</button>
	);
}

export default function MediaTickerButton() {
	const mpris = Mpris.get_default();
	const theStack = (
		<Stack
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
			transition_duration={2000}
			homogeneous={false}
			setup={(self) => {

				const addNoMediaPage = () => {
					let noMediaLabel = self.get_child_by_name("no-media");
					if (!noMediaLabel) {
						noMediaLabel = (
							<label
								className={"ticker nomedia"}
								name={"no-media"}
								hexpand={true}
								wrap={false}
								halign={CENTER}
								valign={CENTER}
								label={"No Media"}
							/>
						);
						self.add_named(noMediaLabel, "no-media");
					}
					noMediaLabel.visible = true;
					self.set_visible_child_name("no-media");
				};

				const removeNoMediaPage = () => {
					const noMediaChild = self.get_child_by_name("no-media");
					if (noMediaChild) {
						noMediaChild.visible = false;
					}
				};

				const updateNoMediaState = () => {
					const players = mpris.get_players();
					players.length === 0 ? addNoMediaPage() : removeNoMediaPage();
				};

				mpris.get_players()?.forEach((p) =>
					self.add_named(tickerButton(p), p.busName)
				);

				updateNoMediaState();

				mpris.connect("player-added", (_, p) => {
					const childName = p.busName;
					if (!self.get_child_by_name(childName)) {
						self.add_titled(tickerButton(p), childName, childName.toUpperCase());
					}
					updateNoMediaState();
				});

				mpris.connect("player-closed", (_, p) => {
					const childName = p.busName;
					const child = self.get_child_by_name(childName);
					if (child) {
						child.destroy();
					}

					updateNoMediaState();
				});

				setInterval(() => {
					const visiblePages = self
						.get_children()
						.filter((child) => child.visible);

					if (visiblePages.length === 0) {
						addNoMediaPage();
					} else if (visiblePages.length >= 1) {
						const currentChild = self.get_visible_child_name();
						const currentIndex = visiblePages.findIndex(
							(child) => child.name === currentChild
						);
						const nextIndex = (currentIndex + 1) % visiblePages.length;
						self.set_visible_child_name(visiblePages[nextIndex].name);
					}
				}, 7500);
			}}
		/>
	);

	return (
		<box className={"ticker container"} halign={CENTER} valign={CENTER}>
			{theStack}
		</box>
	);
}
