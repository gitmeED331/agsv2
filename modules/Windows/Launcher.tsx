import { App, bind, execAsync, Astal, Gtk, Gdk } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../lib/icons";
import { winwidth, winheight } from "../lib/screensizeadjust";
import { Grid, Stack } from "../Astalified/index";

const Apps = new AstalApps.Apps({
	include_entry: true,
	include_executable: true,
	include_description: true,
});
const Applications = Apps.get_list();

const sortedApplications = Applications.sort((a, b) => {
	return a.get_name().localeCompare(b.get_name());
});

function createAppGrid(appList, app) {
	const columnCount = 1;
	appList = appList.sort((a, b) => {
		return a.get_name().localeCompare(b.get_name());
	});

	const grid = new Grid({
		hexpand: true,
		vexpand: true,
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
	});

	appList.forEach((app, index) => {
		const appButton = (
			<button
				className={"launcher app"}
				name={app.get_name()}
				tooltip_text={app.get_description()}
				on_clicked={() => {
					entry.set_text("");
					app.launch();
					App.toggle_window("launcher");
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						entry.set_text("");
						app.launch();
						App.toggle_window("launcher");
					}
				}}
			>
				<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={5} widthRequest={winwidth(0.15)}>
					<icon icon={app.icon_name || Icon.missing} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
					<label label={app.name || "missing"} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
				</box>
			</button>
		);
		grid.attach(appButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
	});

	return grid;
}

function createScrollablePage(appList) {
	return (
		<scrollable
			vscroll={Gtk.PolicyType.AUTOMATIC}
			hscroll={Gtk.PolicyType.NEVER}
			vexpand={true}
			hexpand={true}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			visible={true}
			heightRequest={winheight(0.9)}
			css={`
				padding: 1rem;
			`}
		>
			{createAppGrid(appList)}
		</scrollable>
	);
}

function getCategories(app) {
	const mainCategories = ["AudioVideo", "Audio", "Video", "Development", "Education", "Game", "Graphics", "Network", "Office", "Science", "Settings", "System", "Utility"];
	const substitute = (cat) => {
		const map = {
			Audio: "Multimedia",
			AudioVideo: "Multimedia",
			Video: "Multimedia",
			Graphics: "Multimedia",
			Science: "Education",
			Settings: "System",
		};
		return map[cat] ?? cat;
	};
	return (
		app.app
			.get_categories()
			?.split(";")
			.filter((c) => mainCategories.includes(c))
			.map(substitute)
			.filter((c, i, arr) => i === arr.indexOf(c)) ?? []
	);
}

const uniqueCategories = Array.from(new Set(Applications.flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

function getRelevanceScore(appName, appDescription, query) {
	appName = appName.toLowerCase();
	appDescription = appDescription?.toLowerCase() ?? "";
	query = query.toLowerCase();

	let score = 0;

	if (appName === query) score += 5;
	else if (appName.startsWith(query)) score += 3;
	else if (appName.includes(query)) score += 2;

	if (appDescription.includes(query)) score += 1;

	return score;
}

let query = "";
function Search(query) {
	const results = Applications.filter((app) => getRelevanceScore(app.get_name(), app.get_description(), query) > 0);

	const sortedResults = results.sort((a, b) => {
		const scoreA = getRelevanceScore(a.get_name(), a.get_description(), query);
		const scoreB = getRelevanceScore(b.get_name(), b.get_description(), query);
		return scoreB - scoreA;
	});

	let searchResultsPage = theStack.get_child_by_name("search_results");

	if (sortedResults.length > 0) {
		if (searchResultsPage) {
			theStack.remove(searchResultsPage);
		}

		searchResultsPage = createScrollablePage(sortedResults);
		theStack.add_named(searchResultsPage, "search_results");
		theStack.set_visible_child_name("search_results");
	} else {
		theStack.set_visible_child_name("All Apps");
	}
}

function SearchWindows(query) {
	const windows = getActiveWindows();
	const results = windows.filter((win) => win.title.includes(query));
}

const handleTerminalCommand = (query, state, self) => {
	const command = query.slice(3).trim();

	if (command) {
		const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
		const cmd = isShiftPressed ? `kitty --hold --directory=$HOME -e ${command}` : command;

		execAsync(cmd);

		self.set_text("");
		App.toggle_window("launcher");
	}
};

const handleWindowSearch = (query) => {
	const windowQuery = query.slice(3).trim();
	if (windowQuery) {
		SearchWindows(windowQuery);
	}
};

let currentQuery = "";

const entry = (
	<entry
		className={"input"}
		placeholder_text="Search apps, C:: for teriminal commands..."
		on_changed={(self) => {
			const query = self.get_text().trim();
			currentQuery = query;
			if (!query.startsWith("C::") && !query.startsWith("W::")) {
				Search(query);
			}
		}}
		onKeyPressEvent={(self, event) => {
			const keyval = event.get_keyval()[1];
			const state = event.get_state()[1];
			const query = currentQuery.trim();

			if (keyval === Gdk.KEY_Return) {
				switch (true) {
					case query.startsWith("C::"):
						handleTerminalCommand(query, state, self);
						break;

					case query.startsWith("W::"):
						handleWindowSearch(query);
						break;

					default:
						break;
				}
			}
		}}
		hexpand={true}
		halign={Gtk.Align.FILL}
		valign={Gtk.Align.CENTER}
		tooltip_text={"Search applications, or use C:: for terminal, W:: for windows"}
		activates_default={true}
		focusOnClick={true}
	/>
);
const SearchInput = () => {
	const icon = (<icon icon={Icon.launcher.search} />);

	const clear = (
		<button
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					entry.set_text("");
					theStack.set_visible_child_name("All Apps");
				}
			}}
			tooltip_text={"Clear search"}
			visible={bind(entry, "text").as((text) => text.length > 0)}
			halign={Gtk.Align.END}
		>
			<icon icon={Icon.launcher.clear} />
		</button>
	);

	const SIGrid = new Grid({
		hexpand: true,
		vexpand: true,
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.CENTER,
		columnSpacing: 5,
		className: "launcher search",
	});

	SIGrid.attach(icon, 1, 1, 1, 1);
	SIGrid.attach(entry, 2, 1, 1, 1);
	SIGrid.attach(clear, 3, 1, 1, 1);

	return <box className={""}>{SIGrid}</box>;
};

const allAppsPage = (
	<box key="All Apps" name="All Apps" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
		{createScrollablePage(sortedApplications)}
	</box>
);

const categoryPages = uniqueCategories.map((category) => {
	const sortedAppsInCategory = Applications.filter((app) => getCategories(app).includes(category)).sort((a, b) => a.get_name().localeCompare(b.get_name()));

	return (
		<box key={category} name={category.toLowerCase()} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
			{createScrollablePage(sortedAppsInCategory)}
		</box>
	);
});
const theStack = new Stack({
	className: "launcher stack",
	transitionType: Gtk.StackTransitionType.SLIDE_LEFT_RIGHT,
	transitionDuration: 300,
	halign: Gtk.Align.FILL,
	valign: Gtk.Align.FILL,
	hhomogeneous: true,
	vhomogeneous: false,
	visible: true,
	hexpand: false,
	vexpand: true,
});

[allAppsPage, ...categoryPages].forEach((page) => {
	theStack.add_named(page, page.name);
});

const Switcher = () => {
	const handleSwitch = (name) => {
		theStack.set_visible_child_name(name);
		query = "";
		entry.set_text("");
	};

	const allAppsButton = (
		<button
			className={bind(theStack, "visible_child_name").as((name) => (name === "All Apps" ? "active" : ""))}
			onClick={(_, event) => {
				if (event.button === Gdk.BUTTON_PRIMARY) {
					handleSwitch("All Apps");
				}
			}}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					handleSwitch("All Apps");
				}
			}}
			tooltip_text={"All Apps"}
		>
			<icon icon={Icon.launcher.allapps} />
		</button>
	);

	const categoryButtons = uniqueCategories.map((category) => {
		const iconName = Icon.launcher[category.toLowerCase()] || Icon.launcher.system;

		return (
			<button
				className={bind(theStack, "visible_child_name").as((name) => (name === category.toLowerCase() ? "active" : ""))}
				key={category}
				onClick={(_, event) => {
					if (event.button === Gdk.BUTTON_PRIMARY) {
						handleSwitch(category.toLowerCase());
					}
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						handleSwitch(category.toLowerCase());
					}
				}}
				tooltip_text={category}
			>
				<icon icon={iconName} />
			</button>
		);
	});

	return (
		<box className={"launcher switcher"} vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
			{allAppsButton}
			{categoryButtons}
		</box>
	);
};

export default function Launcher() {
	const eventHandler = (
		<eventbox
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.FILL}
			onClick={(_, event) => {
				const win = App.get_window("launcher");
				if (event.button === Gdk.BUTTON_PRIMARY) {
					if (win && win.visible === true) {
						query = "";
						win.visible = false;
					}
				}
			}}
			widthRequest={winwidth(0.8)}
			heightRequest={winheight(0.8)}
		/>
	);

	const theGrid = new Grid({
		className: "launcher contentgrid",
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hexpand: true,
		vexpand: true,
		visible: true,
	});

	theGrid.attach(SearchInput(), 0, 0, 2, 1);
	theGrid.attach(Switcher(), 0, 1, 1, 1);
	theGrid.attach(theStack, 1, 1, 1, 1);

	const masterGrid = new Grid({
		className: "launcher containergrid",
		halign: Gtk.Align.FILL,
		valign: Gtk.Align.FILL,
		hexpand: true,
		vexpand: true,
		visible: true,
	});

	masterGrid.attach(theGrid, 0, 0, 1, 1);
	masterGrid.attach(eventHandler, 1, 0, 1, 1);

	return (
		<window
			name={"launcher"}
			className={"launcher window"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			clickThrough={false}
			onKeyPressEvent={(_, event) => {
				const win = App.get_window("launcher");
				if (event.get_keyval()[1] === Gdk.KEY_Escape) {
					if (win && win.visible === true) {
						query = "";
						win.visible = false;
					}
				}
			}}
		>
			{masterGrid}
		</window>
	);
}
