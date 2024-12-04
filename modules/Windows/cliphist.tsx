import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { execAsync, exec, Variable, bind } from "astal";
import Pango from "gi://Pango";
import { Grid } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";

const background = `${SRC}/assets/groot-thin-left.png`;

function ClipHistItem(entry: any) {
	const [id, ..._content] = entry.split("\t");
	const content = _content.join(" ").trim();

	const fileUriPattern = /^file:\/\/(.+\.(jpg|jpeg|png|gif|bmp|webp))$/i;
	const filePathMatch = content.match(fileUriPattern);
	const isImage = Boolean(filePathMatch);
	const filePath = isImage ? filePathMatch[0] : "";

	let imageReveal = Variable(false);

	function revealer() {
		return (
			<revealer transition_type={REVEAL_SLIDE_DOWN} reveal_child={bind(imageReveal)}>
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

	const idLabel = <label className={"idlabel"} label={id} valign={CENTER} halign={START} ellipsize={Pango.EllipsizeMode.END} />;
	const contentLabel = <label className={"contentlabel"} label={content} valign={CENTER} halign={START} ellipsize={Pango.EllipsizeMode.END} wrap wrapMode={Pango.WrapMode.WORD_CHAR} lines={3} />;

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
					execAsync(`bash -c "cliphist decode ${id} | wl-copy"`);
					console.log("decoding: ", id, " content: ", content);

					// App.toggle_window("cliphist");
				}
			}}
		>
			<Grid
				columnSpacing={10}
				setup={(self) => {
					self.attach(idLabel, 0, 0, 1, 1);
					self.attach(contentLabel, 1, 0, 1, 1);
					if (isImage && filePath) {
						self.attach(revealer(), 0, 1, 2, 1);
					}
				}}
			/>
		</button>
	);

	const button = createButton(id, content);

	button.connect("focus-out-event", () => {
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

let query = ""

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
		}}
	/> as Gtk.Entry
);

const list = await execAsync("cliphist list");
function ClipHistWidget() {
	const scrollableList = (
		<scrollable halign={FILL} valign={FILL} vexpand={true}>
			<box expand vertical>
				{
					list.split("\n").map((l) => ClipHistItem(l))
				}
			</box>
		</scrollable>
	);

	const header = () => {
		const clear = (
			<button
				className="clear_hist"
				valign={CENTER}
				on_clicked={async () => {
					await execAsync("cliphist wipe");
					query = ("");
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
					query = "";
					input.set_text("");

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

	return (
		<box orientation={Gtk.Orientation.VERTICAL} className="cliphist container" halign={FILL} valign={FILL}>
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
		</box>
	);
}

export default function cliphist(monitor: Gdk.Monitor) {
	return (
		<window
			name={"cliphist"}
			className={"cliphist"}
			gdkmonitor={monitor}
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
			<Grid
				className={"cliphist mastergrid"}
				halign={FILL}
				valign={FILL}
				hexpand={true}
				vexpand={true}
				visible={true}
				setup={(self) => {
					self.attach(<ClickToClose id={1} width={0.75} height={0.75} windowName="cliphist" />, 1, 1, 1, 1);
					self.attach(ClipHistWidget(), 2, 1, 1, 1);
				}}
			/>
		</window>
	);
}

App.connect("window-toggled", async (_, win) => {
	if (win.name === "cliphist") {
		input.set_text("");
		input.grab_focus();

	}
});
