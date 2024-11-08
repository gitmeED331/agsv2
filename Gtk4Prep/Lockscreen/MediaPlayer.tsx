/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk4";
import { bind, execAsync, GLib, Variable } from "astal";
import Mpris from "gi://AstalMpris";
import Pango from "gi://Pango";
import { Grid } from "../modules/Astalified/index";
import Icon from "../modules/lib/icons";
import TrimTrackTitle from "../modules/lib/TrimTrackTitle";
import { CircularProgress } from "../../../../../usr/share/astal/gjs/gtk4/widget";

const player = Mpris.Player.new("Deezer"); //"Deezer"  "vlc" "mpv" "spotify"

function TrackInfo() {
	const title = (
		<label
			className="tracktitle"
			wrap={false}
			hexpand={true}
			halign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			maxWidthChars={35}
			label={bind(player, "title").as((title) => TrimTrackTitle(title))}
		/>
	);

	const artist = (
		<label
			className="trackartist"
			wrap={false}
			hexpand={true}
			halign={Gtk.Align.CENTER}
			ellipsize={Pango.EllipsizeMode.END}
			maxWidthChars={30}
			label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
		/>
	);
	return (
		<box className="trackinfo" valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER} hexpand={true} vertical={true} spacing={5}>
			{title}
			{artist}
		</box>
	);
}

/** @param {number} length */
function lengthStr(length: number) {
	const min = Math.floor(length / 60);
	const sec = Math.floor(length % 60);
	const sec0 = sec < 10 ? "0" : "";
	return `${min}:${sec0}${sec}`;
}

function TrackPosition() {
	const position = bind(player, "position").as((n) => parseInt(n.toString()));
	const length = bind(player, "length").as((n) => parseInt(n.toString()));
	const trackPercent = Variable.derive([position, length], (position, length) => {
		return (position / length).toFixed(2);
	});
	const lengthLabel = <label className="tracklength" halign={Gtk.Align.START} label={bind(player, "length").as(lengthStr)} />;

	const positionLabel = <label className="trackposition" halign={Gtk.Align.END} label={bind(player, "position").as(lengthStr)} />;

	return (
		<box className="positioncontainer" valign={Gtk.Align.CENTER} halign={Gtk.Align.FILL} hexpand={true} vertical={true} spacing={5} visible={bind(player, "length").as((length) => length > 0)}>
			<circularprogress className="circularprogress" value={Number(trackPercent())} startAt={0.75} endAt={-0.25} rounded={true} inverted={false}>
				<box vertical valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
					{[lengthLabel, positionLabel]}
				</box>
			</circularprogress>
		</box>
	);
}

function PlayerIcon() {
	return (
		<icon
			hexpand={true}
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.CENTER}
			tooltip_text={bind(player, "identity")}
			icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
		/>
	);
}

function PlayerControls() {
	const playPause = (
		<button className="play-pause" valign={Gtk.Align.CENTER} onClicked={() => player.play_pause()} visible={bind(player, "can_play")}>
			<icon icon={bind(player, "playbackStatus").as((s) => (s === Mpris.PlaybackStatus.PLAYING ? Icon.mpris.controls.PAUSE : Icon.mpris.controls.PLAY))} />
		</button>
	);

	const prev = (
		<button className="previous" valign={Gtk.Align.CENTER} onClicked={() => player.previous()} visible={bind(player, "can_go_previous")}>
			<icon icon={Icon.mpris.controls.PREV} />
		</button>
	);

	const next = (
		<button className="next" valign={Gtk.Align.CENTER} onClicked={() => player.next()} visible={bind(player, "can_go_next")}>
			<icon icon={Icon.mpris.controls.NEXT} />
		</button>
	);
	return (
		<box className="playercontrols" vexpand={false} hexpand={false} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} spacing={15}>
			{[prev, playPause, next]}
		</box>
	);
}

/**
 * @param {string} cover_art - Cover image path.
 */
const blurCoverArtCss = async (cover_art: string): Promise<string> => {
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

function trackTime() {
	const position = bind(player, "position").as(lengthStr);
	const totalLength = bind(player, "length").as(lengthStr);

	return (
		<label className="tracklength" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
			{position}/{totalLength}
		</label>
	);
}

function Player({ player }: { player: Mpris.Player }) {
	async function setup(wid: Widget.Box) {
		wid.css = await blurCoverArtCss(player.cover_art);
		wid.hook(player, "notify::cover-art", async () => {
			wid.css = await blurCoverArtCss(player.cover_art);
		});
	}

	const position = bind(player, "position").as((n) => parseInt(n.toString()));
	const length = bind(player, "length").as((n) => parseInt(n.toString()));
	const trackPercent = Variable.derive([position, length], (position, length) => {
		return (position / length).toFixed(2);
	});

	const mediaInfoGrid = new Grid({
		className: "mediainfo",
		halign: Gtk.Align.CENTER,
		valign: Gtk.Align.CENTER,
		hexpand: true,
		vexpand: true,
		visible: true,
		rowSpacing: 10,
	});

	mediaInfoGrid.attach(PlayerIcon(), 0, 0, 1, 1);
	mediaInfoGrid.attach(TrackInfo(), 0, 1, 1, 1);
	mediaInfoGrid.attach(trackTime(), 0, 2, 2, 1);
	mediaInfoGrid.attach(PlayerControls(), 0, 3, 2, 1);

	return (
		<box
			className="outer"
			halign={Gtk.Align.CENTER}
			valign={Gtk.Align.END}
			setup={setup}
			css={`
				border-radius: 50rem;
			`}
		>
			<circularprogress
				className="player"
				hexpand={true}
				halign={Gtk.Align.CENTER}
				valign={Gtk.Align.CENTER}
				visible={bind(player, "available").as((a) => a === true)}
				value={Number(trackPercent())}
				startAt={0.75}
				endAt={-0.25}
				rounded={true}
				inverted={false}
			>
				<box className="inner" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
					{mediaInfoGrid}
				</box>
			</circularprogress>
		</box>
	);
}

export default Player;
