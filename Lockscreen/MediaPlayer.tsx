import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync, GLib, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import { Grid } from "../modules/Astalified/index";
import Icon from "../modules/lib/icons";
import TrimTrackTitle from "../modules/lib/TrimTrackTitle";

/** @param {number} length */
function lengthStr(length: number) {
	const min = Math.floor(length / 60);
	const sec = Math.floor(length % 60);
	const sec0 = sec < 10 ? "0" : "";
	return `${min}:${sec0}${sec}`;
}

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
		`background-image: radial-gradient(circle at center, rgba(0, 0, 0, 0), ${color} 12rem), url('${bg}');
         background-position: center;
         background-size: contain;
         transition: all 0.7s ease;
         background-repeat: no-repeat;
		 border-radius: 50rem;`;

	if (cover_art) {
		const color = await execAsync(`bash -c "convert ${cover_art} -alpha off -crop 5%x100%0+0+0 -colors 1 -unique-colors txt: | head -n2 | tail -n1 | cut -f4 -d' '"`);
		return playerBGgen(cover_art, color);
	}
	return "background-color: #0e0e1e";
};

/** @param {import('types/service/mpris').MprisPlayer} player */
function Player({ player }: { player: Mpris.Player }) {
	async function setup(wid: Widget.Box) {
		wid.css = await blurCoverArtCss(player.cover_art);
		wid.hook(player, "notify::cover-art", async () => {
			wid.css = await blurCoverArtCss(player.cover_art);
		});
	}

	const TrackInfo = ({ info }: { info: "tracks" | "artists" }) => {
		const Bindings = Variable.derive([bind(player, "title"), bind(player, "artist")], (title, artist) => ({
			classname: {
				tracks: "track title",
				artists: "track artist",
			}[info],

			maxwidthchars: {
				tracks: 35,
				artists: 30,
			}[info],

			label: {
				tracks: TrimTrackTitle(title) || "Unknown Title",
				artists: artist || "Unknown Artist",
			}[info],
		}))();

		return (
			<label
				className={Bindings.as((b) => b.classname)}
				wrap={false}
				hexpand={true}
				halign={CENTER}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={Bindings.as((b) => b.maxwidthchars)}
				label={Bindings.as((b) => b.label)}
			/>
		);
	};

	const PlayerControls = ({ btn, ...props }: { btn: "play_pause" | "activePlay" | "next" | "previous" | "close" } & Widget.ButtonProps) => {
		const bindings = Variable.derive(
			[bind(player, "playbackStatus"), bind(player, "entry"), bind(player, "identity"), bind(player, "can_go_previous"), bind(player, "can_play"), bind(player, "can_go_next")],
			(playbackStatus, entry, identity, can_go_previous, can_play, can_go_next) => ({
				className: {
					activePlay: "playicon",
					play_pause: "play-pause",
					next: "next",
					previous: "previous",
					close: "close",
				}[btn],

				tooltip_text: {
					activePlay: identity,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? "Pause" : "Play",
					next: "Next",
					previous: "Previous",
					close: "Close",
				}[btn],

				visible: {
					play_pause: can_play,
					activePlay: true,
					next: can_go_next,
					previous: can_go_previous,
					close: true,
				}[btn],

				command: {
					play_pause: () => player.play_pause(),
					activePlay: () => {
						const dwin = App.get_window(`dashboard${App.get_monitors()[0]}`);
						const mpwin = App.get_window(`mediaplayerwindow${App.get_monitors()[0]}`);
						execAsync(player.entry);
						if (dwin && dwin.visible === true) {
							App.toggle_window(`dashboard${App.get_monitors()[0]}`);
						} else if (mpwin && mpwin.visible === true) {
							App.toggle_window(`mediaplayerwindow${App.get_monitors()[0]}`);
						}
					},
					next: () => player.next(),
					previous: () => player.previous(),
					close: () => {
						execAsync(`bash -c 'killall "${player.entry}"'`);
					},
				}[btn],

				icon: {
					activePlay: entry || Icon.mpris.controls.FALLBACK_ICON,
					play_pause: playbackStatus === Mpris.PlaybackStatus.PLAYING ? Icon.mpris.controls.PAUSE : Icon.mpris.controls.PLAY,
					next: Icon.mpris.controls.NEXT,
					previous: Icon.mpris.controls.PREV,
					close: Icon.mpris.controls.CLOSE,
				}[btn],
			}),
		)();

		return (
			<button
				className={bindings.as((b) => b.className)}
				tooltip_text={bindings.as((b) => b.tooltip_text)}
				visible={bindings.as((b) => b.visible)}
				onClick={() => bindings.get().command()}
				onDestroy={(self) => {
					self.destroy();
				}}
				{...props}
			>
				<icon icon={bindings.as((b) => b.icon)} />
			</button>
		);
	};
	const position = bind(player, "position").as(n => Number(parseInt(n.toString())));
	const length = bind(player, "length").as(n => Number(parseInt(n.toString())));
	const trackPercent = Variable.derive([position, length], (position, length) => {
		return Number((position / length).toFixed(2));
	});

	function trackTime() {
		const Bindings = Variable.derive([bind(player, "position"), bind(player, "length")], (position, length) => ({
			classname: "track length",
			label: `${lengthStr(position)} / ${lengthStr(length)}`,
		}))

		return (
			<label className={bind(Bindings).as((b) => b.classname)} label={bind(Bindings).as((b) => b.label)} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
		);
	}

	const mediaInfoGrid = <Grid
		className={"mediainfo"}
		halign={CENTER}
		valign={CENTER}
		expand
		visible={true}
		rowSpacing={10}
		setup={(self) => {
			self.attach(<TrackInfo info="tracks" />, 0, 0, 1, 1);
			self.attach(<TrackInfo info="artists" />, 0, 1, 1, 1);
			self.attach(trackTime(), 0, 3, 1, 1);
			self.attach(
				<centerbox className={"playercontrols"} vexpand={false} hexpand={false} halign={CENTER} valign={CENTER} spacing={20}>
					<PlayerControls btn="previous" />
					<PlayerControls btn="play_pause" />
					<PlayerControls btn="next" />
				</centerbox>,
				0,
				2,
				1,
				1,
			);
		}}
	/>

	return (
		<box
			className={"player"}
			halign={CENTER}
			valign={CENTER}
			expand={false}
			width_request={350}
			height_request={350}
			setup={setup}
			css={`
				border-radius: 50rem;
			`}
		>
			<circularprogress
				className={"circularprogress"}
				expand
				halign={FILL}
				valign={FILL}
				visible={bind(player, "available").as((a) => a === true)}
				value={bind(trackPercent)}
				startAt={0.75}
				endAt={-0.25}
				rounded={true}
				inverted={false}
			>
				<eventbox className={"inner"} expand halign={FILL} valign={FILL}>
					{mediaInfoGrid}
				</eventbox>
			</circularprogress>
		</box>
	);
}

export default Player;
