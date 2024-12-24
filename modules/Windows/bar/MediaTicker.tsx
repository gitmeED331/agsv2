import { Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Variable, execAsync } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";

import TrimTrackTitle from "../../lib/TrimTrackTitle";
import Icon from "../../lib/icons";
import { Stack } from "../../Astalified/index";
/**
 * @param {string} cover_art - Cover image path.
 */
const blurCoverArtCss = async (cover_art: string): Promise<string> => {
	/**
	 * Generate CSS background style for music player.
	 * @param {string} bg - Background image path.
	 * @param {string} color - Dominant color extracted from the image.
	 * @returns {string} CSS background style.
	 */
	const playerBGgen = (bg: string, color: string): string =>
		`background-image: radial-gradient(circle at left, rgba(0, 0, 0, 0), ${color} 12rem), url('${bg}');
         background-position: left top, left top;
         background-size: contain;
         transition: all 0.7s ease;
         background-repeat: no-repeat;`;

	if (cover_art) {
		const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
		return playerBGgen(cover_art, color);
	}
	return "background-color: #0e0e1e";
};

/** @param {import('types/service/mpris').MprisPlayer} player */

function tickerButton(player: Mpris.Player) {
	const CustomLabel = ({ info }: { info: "tracks" | "artists" }) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			label: info === "tracks" ? TrimTrackTitle(title) : artist || "Unknown Artist",
			classname: `ticker ${info}`,
		}))();

		return (
			<label
				className={Bindings.as((b) => b.classname)}
				label={Bindings.as((b) => b.label)}
				hexpand
				wrap={false}
				// maxWidthChars={35}
				ellipsize={Pango.EllipsizeMode.END}
				halign={CENTER}
				valign={CENTER}
				onDestroy={(self) => {
					self.destroy();
				}}
			/>
		);
	};

	function theTooltip() {
		async function setup(box: Widget.Box) {
			box.css = await blurCoverArtCss(player.cover_art);
			box.hook(player, "notify::cover-art", async () => {
				box.css = await blurCoverArtCss(player.cover_art);
			});
		}
		return (
			<box vertical spacing={10} setup={setup} widthRequest={350}>
				<CustomLabel info="tracks" />
				<CustomLabel info="artists" />
			</box>
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
					App.toggle_window(`mediaplayerwindow${App.get_monitors()[0].get_model()}`);
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
			hasTooltip
			onQueryTooltip={(self, x, y, kbtt, tooltip) => {
				tooltip.set_custom(theTooltip());
				return true;
			}}
		>
			<box visible spacing={5} halign={CENTER} valign={CENTER}>
				<CustomLabel info="tracks" />
				<icon
					className={"ticker icon"}
					hexpand={false}
					halign={CENTER}
					valign={CENTER}
					tooltip_text={bind(player, "identity")}
					icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
				/>
				<CustomLabel info="artists" />
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
						noMediaLabel = <label className={"ticker nomedia"} name={"no-media"} hexpand={true} wrap={false} halign={CENTER} valign={CENTER} label={"No Media"} />;
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

				mpris.get_players()?.forEach((p) => self.add_named(tickerButton(p), p.busName));

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
					const visiblePages = self.get_children().filter((child) => child.visible);

					if (visiblePages.length === 0) {
						addNoMediaPage();
					} else if (visiblePages.length >= 1) {
						const currentChild = self.get_visible_child_name();
						const currentIndex = visiblePages.findIndex((child) => child.name === currentChild);
						const nextIndex = (currentIndex + 1) % visiblePages.length;
						self.set_visible_child_name(visiblePages[nextIndex].name);
					}
				}, 7500);
			}}
		/>
	);

	return (
		<box className={"ticker container"} halign={CENTER} valign={CENTER} vertical>
			{theStack}
		</box>
	);
}
