/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk4";
import { execAsync, GLib, Variable, bind } from "astal";
import Pango from "gi://Pango";
import { Grid } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";

type EntryObject = {
	id: string;
	content: string;
	entry: string;
};

const background = `${SRC}/assets/groot-thin-left.png`;

function ClipHistItem(entry: string) {
	const [id, ..._content] = entry.split("\t");
	const content = _content.join(" ").trim();
	let clickCount = 0;

	const fileUriPattern = /^file:\/\/(.+\.(jpg|jpeg|png|gif|bmp|webp))$/i;
	const filePathMatch = content.match(fileUriPattern);
	const isImage = Boolean(filePathMatch);
	const filePath = isImage ? filePathMatch[0] : "";

	let imageReveal = Variable(false);

	function revealer() {
		return (
			<revealer transition_type={Gtk.RevealerTransitionType.SLIDE_DOWN} reveal_child={bind(imageReveal)}>
				<box
					cssClasses={"imagePreview"}
					halign={Gtk.Align.FILL}
					valign={Gtk.Align.START}
					css={`
						background-image: url("${isImage ? filePath : null}");
					`}
					widthRequest={filePath ? 300 : 0}
					heightRequest={filePath ? 200 : 0}
				/>
			</revealer>
		);
	}

	const idLabel = <label cssClasses={"idlabel"} label={`${id}`} xalign={0} valign={Gtk.Align.CENTER} halign={Gtk.Align.START} ellipsize={Pango.EllipsizeMode.END} />;
	const contentLabel = (
		<label cssClasses={"contentlabel"} label={`${content}`} xalign={0} valign={Gtk.Align.CENTER} halign={Gtk.Align.START} ellipsize={Pango.EllipsizeMode.END} wrap={true} lines={2} />
	);

	const grid = <Grid attribute={{ content, id }} columnSpacing={10} />;

	grid.attach(idLabel, 0, 0, 1, 1);
	grid.attach(contentLabel, 1, 0, 1, 1);
	if (isImage && filePath) {
		grid.attach(revealer(), 0, 1, 2, 1);
	}

	const createButton = (id: string, content: string) => (
		<button
			cssClasses="cliphist item"
			valign={Gtk.Align.START}
			halign={Gtk.Align.FILL}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					clickCount++;
					if (clickCount === 2) {
						App.toggle_window("cliphist");
						execAsync(`${GLib.get_user_config_dir()}/ags/scripts/cliphist.sh --copy-by-id ${id}`);
						clickCount = 0;
						repopulate();
					}
				}
			}}
			onHover={() => {
				if (isImage && filePath) {
					imageReveal.set(true);
				}
			}}
			onHoverLost={() => imageReveal.set(false)}
		>
			{grid}
		</button>
	);

	const button = createButton(id, content);

	button.connect("focus-out-event", () => {
		clickCount = 0;
		imageReveal.set(false);
	});

	button.connect("focus-in-event", () => {
		if (isImage && filePath) {
			imageReveal.set(true);
		}
	});

	button.connect("destroy", () => {
		button.disconnect(id);
	});

	return button;
}

const input = (
	<entry
		cssClasses="search"
		placeholder_text="Search"
		hexpand={true}
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.CENTER}
		activates_default={true}
		focusOnClick={true}
		widthRequest={winwidth(0.15)}
		onChanged={({ text }) => {
			const searchText = (text ?? "").toLowerCase();
			list.children.forEach((item) => {
				item.visible = item.attribute.content.toLowerCase().includes(searchText);
			});
		}}
	/>
);

const list = <box vertical spacing={5} />;
let output: string;
let entries: string[];
let clipHistItems: EntryObject[];
let widgets: Box<any, any>[];

const entrySet = new Set<string>();

async function repopulate() {
	output = await getClipboardHistory();
	entries = output.split("\n").filter((line) => line.trim() !== "");

	const clipHistItems: Box<any, any>[] = entries
		.map((entry) => {
			const [id, ...contentParts] = entry.split("\t");
			const content = contentParts.join(" ").trim();

			if (entrySet.has(id.trim())) {
				return null;
			}

			entrySet.add(id.trim());
			return ClipHistItem(entry);
		})
		.filter(Boolean) as Box<any, any>[];

	widgets = [...list.children, ...clipHistItems];
	list.children = widgets;

	console.log("Total items added:", widgets.length);
}

async function getClipboardHistory(): Promise<string> {
	return await execAsync("cliphist list");
}

async function clearClipboardHistory(): Promise<void> {
	await execAsync("cliphist wipe");
}

function ClipHistWidget() {
	const scrollableList = (
		<scrollable halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} vexpand={true}>
			{list}
		</scrollable>
	);
	const header = () => {
		const clear = (
			<button
				cssClasses="clear_hist"
				valign={Gtk.Align.CENTER}
				onClicked={() => {
					clearClipboardHistory();
					entrySet.clear();
					list.children = [];
				}}
			>
				<icon icon={Icon.cliphist.delete} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} />
			</button>
		);
		const refresh = (
			<button
				cssClasses="refresh_hist"
				valign={Gtk.Align.CENTER}
				onClicked={async () => {
					entrySet.clear();
					list.children = [];
					await repopulate();
					input.set_text("");
				}}
			>
				<icon icon={Icon.ui.refresh} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} />
			</button>
		);
		return (
			<box cssClasses="cliphist header" spacing={5}>
				{[input, clear, refresh]}
			</box>
		);
	};

	const theGrid = (
		<Grid
			cssClasses={"cliphist contentgrid"}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			css={`
				background-image: url("${background}");
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);
			`}
		/>
	);

	theGrid.attach(header(), 0, 0, 1, 1);
	theGrid.attach(scrollableList, 0, 1, 1, 1);

	return (
		<box orientation={Gtk.Orientation.VERTICAL} cssClasses="cliphist container" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
			{theGrid}
		</box>
	);
}

function cliphist({ monitor }: { monitor: number }) {
	const masterGrid = new Grid({
		cssClasses: "cliphist mastergrid",
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hexpand: true,
		vexpand: true,
		visible: true,
	});

	masterGrid.attach(ClickToClose(1, 0.75, 0.75, "cliphist"), 1, 1, 1, 1);
	masterGrid.attach(ClipHistWidget(), 2, 1, 1, 1);

	return (
		<window
			name={"cliphist"}
			cssClasses={"cliphist"}
			application={App}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.LEFT}
			onKeyPressed={(_, event) => {
				const win = App.get_window("cliphist");
				if (event.get_keyval() === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			{masterGrid}
		</window>
	);
}

App.connect("window-toggled", (_, win) => {
	if (win.name === "cliphist") {
		input.set_text("");
		input.grab_focus();
		repopulate();
	}
});

export default cliphist;
