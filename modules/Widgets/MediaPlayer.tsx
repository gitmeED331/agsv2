/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 *
 */

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { bind, execAsync } from "astal";
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

	const TrackInfo = (
		<box className={"trackinfo"} valign={CENTER} halign={CENTER} hexpand={true} vertical={true} spacing={5}>
			<label
				className={"tracktitle"}
				wrap={false}
				hexpand={true}
				halign={CENTER}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={35}
				label={bind(player, "title").as((title) => TrimTrackTitle(title) || "Unknown Title")}
			/>
			<label
				className={"artist"}
				wrap={false}
				hexpand={true}
				halign={CENTER}
				ellipsize={Pango.EllipsizeMode.END}
				maxWidthChars={30}
				label={bind(player, "artist").as((artist) => artist || "Unknown Artist")}
			/>
		</box>
	);

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
				hexpand={false}
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
				halign={FILL}
			/>
		);

		const lengthLabel = <label className={"tracklength"} halign={START} label={bind(player, "length").as(lengthStr)} />;

		const positionLabel = <label className={"trackposition"} halign={END} label={bind(player, "position").as(lengthStr)} />;

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
				<centerbox halign={FILL} valign={CENTER} startWidget={lengthLabel} endWidget={positionLabel} />
			</box>
		);
	}

	const PlayerIcon = (
		<button
			className={"playicon"}
			onClick={(_, event) => {
				const dwin = App.get_window("dashboard");
				const mpwin = App.get_window("mediaplayerwindow");

				if (event.button === Gdk.BUTTON_PRIMARY) {
					execAsync(player.entry);
					if (dwin && dwin.visible === true) {
						App.toggle_window("dashboard");
					} else if (mpwin && mpwin.visible === true) {
						App.toggle_window("mediaplayerwindow");
					}
				}
			}}
		>
			<icon
				hexpand={true}
				halign={END}
				valign={CENTER}
				tooltip_text={bind(player, "identity")}
				icon={bind(player, "entry").as((entry) => entry || Icon.mpris.controls.FALLBACK_ICON)}
			/>
		</button>
	);

	const PlayerControls = (
		<box className={"playercontrols"} vexpand={false} hexpand={false} halign={CENTER} valign={CENTER} spacing={20}>
			<button className={"previous"} valign={CENTER} onClick={() => player.previous()} visible={bind(player, "can_go_previous")}>
				<icon icon={Icon.mpris.controls.PREV} />
			</button>
			<button className={"play-pause"} valign={CENTER} onClick={() => player.play_pause()} visible={bind(player, "can_play")}>
				<icon icon={bind(player, "playbackStatus").as((s) => (s === Mpris.PlaybackStatus.PLAYING ? Icon.mpris.controls.PAUSE : Icon.mpris.controls.PLAY))} />
			</button>
			<button className={"next"} valign={CENTER} onClick={() => player.next()} visible={bind(player, "can_go_next")}>
				<icon icon={Icon.mpris.controls.NEXT} />
			</button>
		</box>
	);

	const CloseIcon = (
		<button
			className={"close"}
			valign={CENTER}
			onClick={() => {
				execAsync(`bash -c 'killall "${player.entry}"'`);
			}}
		>
			<icon icon={Icon.mpris.controls.CLOSE} />
		</button>
	);

	const mediaInfoGrid = (
		<Grid
			halign={CENTER}
			valign={CENTER}
			hexpand={true}
			vexpand={true}
			visible={true}
			rowSpacing={10}
			setup={(self) => {
				self.attach(TrackInfo, 0, 0, 1, 1);
				self.attach(PlayerIcon, 1, 0, 1, 1);
				self.attach(TrackPosition(), 0, 1, 2, 1);
				self.attach(PlayerControls, 0, 2, 2, 1);
			}}
		/>
	);

	return (
		<box className={"player"} name={player.entry} vertical={false} hexpand={true} spacing={5} halign={CENTER} valign={START} setup={setup}>
			{[mediaInfoGrid, CloseIcon]}
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
			// setup={(self) => {
			// 	mpris.get_players()?.forEach((p) => self.add_titled(Player(p), p.busName, p.entry.toUpperCase()));

			// 	mpris.connect("player-added", (_, p) => {
			// 		self.add_titled(Player(p), p.busName, p.entry.toUpperCase());
			// 	});

			// 	mpris.connect("player-closed", (_, p) => {
			// 		self.get_child_by_name(p.busName)?.destroy();
			// 	});
			// }}
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

	const switcher = <StackSwitcher stack={theStack} className={"playerswitcher"} visible={bind(mpris, "players").as((a) => a.length > 1)} halign={CENTER} spacing={10} te />;

	return (
		<box halign={CENTER} valign={CENTER} vertical={true} visible={bind(mpris, "players").as((a) => a.length > 0)}>
			{[switcher, theStack]}
		</box>
	);
}
