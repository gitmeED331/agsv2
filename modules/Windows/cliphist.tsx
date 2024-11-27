import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { execAsync, Variable, bind } from "astal";
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

function ClipHistItem(entry: any) {
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
					className={"imagePreview"}
					halign={FILL}
					valign={START}
					css={`
						background-image: url("${isImage ? filePath : null}");
					`}
					widthRequest={filePath ? 300 : 0}
					heightRequest={filePath ? 200 : 0}
				/>
			</revealer>
		);
	}

	const idLabel = <label className={"idlabel"} label={`${id}`} xalign={0} valign={CENTER} halign={START} ellipsize={Pango.EllipsizeMode.END} />;
	const contentLabel = (
		<label className={"contentlabel"} label={`${content}`} xalign={0} valign={CENTER} halign={START} ellipsize={Pango.EllipsizeMode.END} wrap={true} lines={2} />
	);

	const grid = (
		<Grid
			attribute={{ content, id }}
			columnSpacing={10}
			setup={(self) => {
				self.attach(idLabel, 0, 0, 1, 1);
				self.attach(contentLabel, 1, 0, 1, 1);
				if (isImage && filePath) {
					self.attach(revealer(), 0, 1, 2, 1);
				}
			}}
		/>
	);

	const createButton = (id: string, content: string) => (
		<button
			className="cliphist item"
			valign={START}
			halign={FILL}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					if (isImage && filePath) {
						imageReveal.set(!imageReveal.get());
					}
				}
				if (event.button === Gdk.BUTTON_SECONDARY) {
					App.toggle_window("cliphist");
					copyById(id);
				}
			}}
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

	button.connect("destroy", (_, id) => {
		button.disconnect(id);
	});

	return button;
}

const input = (
	<entry
		className="search"
		placeholder_text="Search"
		hexpand={true}
		halign={FILL}
		valign={CENTER}
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
	try {
		output = await getClipboardHistory();
		entries = output
			.split("\n")
			.map((line) => line.trim()) // Trim whitespace from each line once
			.filter((line) => line); // Filter out any empty lines

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

		widgets = [...clipHistItems, ...list.children];
		list.children = widgets;

		console.log("Total items added:", widgets.length);
	} catch (error) {
		console.error("Error in repopulate:", error);
	}
}

repopulate();

async function getClipboardHistory() {
	return await execAsync("cliphist list");
}

async function clearClipboardHistory() {
	await execAsync("cliphist wipe");
}

async function copyById(id: string) {
	return await execAsync(`cliphist decode "${id}" | wl-copy`);
}

function ClipHistWidget() {
	const scrollableList = (
		<scrollable halign={FILL} valign={FILL} vexpand={true}>
			{list}
		</scrollable>
	);
	const header = () => {
		const clear = (
			<button
				className="clear_hist"
				valign={CENTER}
				on_clicked={() => {
					clearClipboardHistory();
					entrySet.clear();
					list.children = [];
				}}
			>
				<icon icon={Icon.cliphist.delete} halign={FILL} valign={FILL} />
			</button>
		);
		const refresh = (
			<button
				className="refresh_hist"
				valign={CENTER}
				onClicked={async () => {
					entrySet.clear();
					list.children = [];
					(input as Gtk.Entry).set_text("");
					await repopulate();
				}}
			>
				<icon icon={Icon.ui.refresh} halign={FILL} valign={FILL} />
			</button>
		);
		return (
			<box className="cliphist header" spacing={5}>
				{[input, clear, refresh]}
			</box>
		);
	};

	const theGrid = (
		<Grid
			className={"cliphist contentgrid"}
			halign={FILL}
			valign={FILL}
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
			setup={(self) => {
				self.attach(header(), 0, 0, 1, 1);
				self.attach(scrollableList, 0, 1, 1, 1);
			}}
		/>
	);

	return (
		<box orientation={Gtk.Orientation.VERTICAL} className="cliphist container" halign={FILL} valign={FILL}>
			{theGrid}
		</box>
	);
}

function cliphist({ monitor }: { monitor: number }) {
	const masterGrid = (
		<Grid
			className={"cliphist mastergrid"}
			halign={FILL}
			valign={FILL}
			hexpand={true}
			vexpand={true}
			visible={true}
			setup={(self) => {
				self.attach(ClickToClose(1, 0.75, 0.75, "cliphist"), 1, 1, 1, 1);
				self.attach(ClipHistWidget(), 2, 1, 1, 1);
			}}
		/>
	);

	return (
		<window
			name={"cliphist"}
			className={"cliphist"}
			application={App}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.EXCLUSIVE}
			keymode={Astal.Keymode.EXCLUSIVE}
			visible={false}
			anchor={TOP | BOTTOM | RIGHT | LEFT}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("cliphist");
				if (event.get_keyval()[1] === Gdk.KEY_Escape && win?.visible) {
					win.visible = false;
				}
			}}
		>
			{masterGrid}
		</window>
	);
}

App.connect("window-toggled", async (_, win) => {
	if (win.name === "cliphist") {
		(input as Gtk.Entry).set_text("");
		input.grab_focus();
		await repopulate();
	}
});

export default cliphist;
