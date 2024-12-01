import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, Binding, execAsync, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import { Grid, StackSwitcher, Stack } from "../Astalified/index";
import Icon from "../lib/icons";
import TrimTrackTitle from "../lib/TrimTrackTitle";

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
function Player(player: Mpris.Player) {
	async function setup(box: Widget.Box) {
		box.css = await blurCoverArtCss(player.cover_art);
		box.hook(player, "notify::cover-art", async () => {
			box.css = await blurCoverArtCss(player.cover_art);
		});
	}

	const TrackInfo = ({ action }: { action: "tracks" | "artists" }) => {

		const Bindings = Variable.derive(
			[bind(player, "title"),
			bind(player, "artist")],
			(title, artist) => ({

				classname: {
					tracks: "tracktitle",
					artists: "artist"
				}[action],

				maxwidthchars: {
					tracks: 35,
					artists: 30
				}[action],

				label: {
					tracks: TrimTrackTitle(title) || "Unknown Title",
					artists: artist || "Unknown Artist"
				}[action],

			})
		)();

		// return <box className={"trackinfo"} valign={CENTER} halign={CENTER} hexpand={true} vertical={true} spacing={5}>
		return <label
			className={Bindings.as(b => b.classname)}
			wrap={false}
			hexpand={true}
			halign={CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			maxWidthChars={Bindings.as(b => b.maxwidthchars)}
			label={Bindings.as(b => b.label)}
		/>
		// </box>
	};

	/** @param {number} length */
	function lengthStr(length: number) {
		const min = Math.floor(length / 60);
		const sec = Math.floor(length % 60);
		const sec0 = sec < 10 ? "0" : "";
		return `${min}:${sec0}${sec}`;
	}

	function TrackPosition() {
		const positionSlider = (
			<slider
				className="position Slider"
				drawValue={false}
				onDragged={({ value }) => {
					if (player.length > 0) {
						const newPosition = (value / player.length) * player.length;
						player.set_position(newPosition);
					}
				}}
				max={bind(player, "length")}
				min={0}
				value={bind(player, "position")}
				halign={CENTER}
			/>
		);

		const Labels = ({ action, ...props }: { action: "length" | "position" } & Widget.LabelProps) => {
			const Bindings = Variable.derive(
				[bind(player, "length"), bind(player, "position")],
				(length, position) => ({

					classname: {
						length: "tracklength",
						position: "trackposition"
					}[action],

					label: {
						length: lengthStr(length),
						position: lengthStr(position)
					}[action],

				})
			)();

			return <label
				className={Bindings.as(b => b.classname)}
				label={Bindings.as(b => b.label)}
				hexpand
				wrap={false}
				// maxWidthChars={35}
				ellipsize={Pango.EllipsizeMode.END}
				halign={CENTER}
				valign={CENTER}
				onDestroy={(self) => { self.destroy() }}
				{...props}
			/>
		}

		return (
			<box
				className={"positioncontainer"}
				valign={CENTER}
				halign={FILL}
				hexpand={true}
				vertical={true}
				spacing={5}
				visible={bind(player, "length").as((length) => (length > 0 ? true : false))}
			>
				{positionSlider}
				<centerbox halign={FILL} valign={CENTER} startWidget={<Labels action="length" />} endWidget={<Labels action="position" />} />
			</box>
		);
	}

	const Controls = ({ action, ...props }: { action: "play_pause" | "activePlay" | "next" | "previous" | "close" } & Widget.ButtonProps) => {

		const bindings = Variable.derive(
			[bind(player, "playbackStatus"), bind(player, "entry"), bind(player, "identity"), bind(player, "can_go_previous"), bind(player, "can_play"), bind(player, "can_go_next")],
			(playbackStatus, entry, identity, can_go_previous, can_play, can_go_next) => ({

				className: {
					activePlay: "playicon",
					play_pause: "play-pause",
					next: "next",
					previous: "previous",
					close: "close"
				}[action],

				tooltip_text: {
					activePlay: identity,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? "Pause" : "Play",
					next: "Next",
					previous: "Previous",
					close: "Close"
				}[action],

				visible: {
					play_pause: can_play,
					activePlay: true,
					next: can_go_next,
					previous: can_go_previous,
					close: true
				}[action],

				command: {
					play_pause: () => player.play_pause(),
					activePlay: () => {
						const dwin = App.get_window("dashboard");
						const mpwin = App.get_window("mediaplayerwindow");
						execAsync(player.entry);
						if (dwin && dwin.visible === true) {
							App.toggle_window("dashboard");
						} else if (mpwin && mpwin.visible === true) {
							App.toggle_window("mediaplayerwindow");
						}
					},
					next: () => player.next(),
					previous: () => player.previous(),
					close: () => {
						execAsync(`bash -c 'killall "${player.entry}"'`)
					}
				}[action],

				icon: {
					activePlay: entry || Icon.mpris.controls.FALLBACK_ICON,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? Icon.mpris.controls.PAUSE : Icon.mpris.controls.PLAY,
					next: Icon.mpris.controls.NEXT,
					previous: Icon.mpris.controls.PREV,
					close: Icon.mpris.controls.CLOSE
				}[action]
			})
		)();

		return <button
			className={bindings.as(b => b.className)}
			tooltip_text={bindings.as(b => b.tooltip_text)}
			visible={bindings.as(b => b.visible)}
			onClick={() => bindings.get().command()}
			onDestroy={(self) => { self.destroy() }}
			{...props}
		>
			<icon icon={bindings.as(b => b.icon)} />
		</button>
	}

	const mediaInfoGrid = (
		<Grid
			halign={FILL}
			valign={CENTER}
			hexpand={true}
			vexpand={true}
			visible={true}
			rowSpacing={10}
			setup={(self) => {
				self.attach(<TrackInfo action="tracks" />, 0, 0, 1, 1);
				self.attach(<TrackInfo action="artists" />, 0, 1, 1, 1);
				self.attach(<Controls action="activePlay" />, 1, 1, 1, 1);
				self.attach(TrackPosition(), 0, 2, 2, 1);
				self.attach(
					<box className={"playercontrols"} vexpand={false} hexpand={false} halign={CENTER} valign={CENTER} spacing={20}>
						<Controls action="previous" />
						<Controls action="play_pause" />
						<Controls action="next" />
					</box>, 0, 3, 2, 1);
			}}
		/>
	);

	return (
		<box className={"player"} name={player.entry} vertical={false} hexpand={true} spacing={5} halign={CENTER} valign={START} setup={setup}>
			{[mediaInfoGrid]}
			<Controls action="close" valign={CENTER} />
		</box>
	);
}

export let dashboardPlayerStack: Gtk.Stack;
export let windowPlayerStack: Gtk.Stack;

export default function playerStack() {
	const mpris = Mpris.get_default();

	const theStack = (
		<stack
			visible={true}
			transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
			transition_duration={2000}
			homogeneous={false}
			setup={(self) => {
				const players = mpris.get_players();
				players?.forEach((p) => {
					if (p?.entry) {
						self.add_titled(Player(p), p.busName, p.entry.toUpperCase());
					} else {
						console.error(`Player entry is invalid:`, p);
					}
				});

				mpris.connect("player-added", (_, p) => {
					if (p?.entry) {
						self.add_titled(Player(p), p.busName, p.entry.toUpperCase());
					} else {
						console.error(`Added player entry is invalid:`, p);
					}
				});

				mpris.connect("player-closed", (_, p) => {
					if (p?.busName) {
						self.get_child_by_name(p.busName)?.destroy();
					}
				});
			}}

		/> as Gtk.Stack
	);

	dashboardPlayerStack = theStack;
	windowPlayerStack = theStack;

	const switcher = <StackSwitcher stack={theStack} className={"playerswitcher"} visible={bind(mpris, "players").as((a) => a.length > 1)} halign={CENTER} spacing={10} valign={CENTER} />;

	return (
		<box halign={CENTER} valign={CENTER} vertical={true} visible={bind(mpris, "players").as((a) => a.length > 0)}>
			{[switcher, theStack]}
		</box>
	);
}
