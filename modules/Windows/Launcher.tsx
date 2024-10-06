import { App, bind, Widget, Astal, Gtk, Gdk, Variable } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon from "../lib/icons";
import { winwidth, winheight } from "../lib/screensizeadjust";
import { Stack } from "../Astalified/Stack";
import { Grid } from "../Astalified/Grid";

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
					app.launch();
					App.toggle_window("launcher");
				}}
			>
				<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} spacing={5} widthRequest={winwidth(0.15)}>
					<icon icon={app.icon_name} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />
					<label label={app.name} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} ellipsize={Pango.EllipsizeMode.END} maxWidthChars={30} lines={1} wrap={true} xalign={0} yalign={0} />
				</box>
			</button>
		);
		grid.attach(appButton, index % 1, Math.floor(index / 1), 1, 1);
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
			<box halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true} visible={true}>
				{createAppGrid(appList)}
			</box>
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

const SearchInput = () => {
	return (
		<entry
			className={"launcher search input"}
			placeholder_text="Search applications..."
			primary_icon_name={Icon.launcher.search}
			on_changed={(entry) => {
				query = entry.get_text();
				Search(query);
			}}
			on_activate={() => {
				Search(query);
			}}
			hexpand={true}
			halign={Gtk.Align.FILL}
			valign={Gtk.Align.CENTER}
		/>
	);
};

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
	const allAppsButton = (
		<button
			className={bind(theStack, "visible_child_name").as((name) => (name === "All Apps" ? "active" : ""))}
			onClick={() => {
				theStack.set_visible_child_name("All Apps");
			}}
			onKeyPressEvent={(_, event) => {
				if (event.get_keyval()[1] === Gdk.KEY_Return) {
					theStack.set_visible_child_name("All Apps");
				}
			}}
			tooltip_text={"All Apps"}
		>
			<icon icon={Icon.launcher.system} />
		</button>
	);

	const categoryButtons = uniqueCategories.map((category) => {
		const iconName = Icon.launcher[category.toLowerCase()] || Icon.launcher.system;
		return (
			<button
				className={bind(theStack, "visible_child_name").as((name) => (name === category.toLowerCase() ? "active" : ""))}
				key={category}
				onClick={() => {
					theStack.set_visible_child_name(category.toLowerCase());
				}}
				onKeyPressEvent={(_, event) => {
					if (event.get_keyval()[1] === Gdk.KEY_Return) {
						theStack.set_visible_child_name(category.toLowerCase());
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
	return (
		<window
			name={"launcher"}
			className={"launcher"}
			anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
			layer={Astal.Layer.OVERLAY}
			exclusivity={Astal.Exclusivity.NORMAL}
			keymode={Astal.Keymode.ON_DEMAND}
			visible={false}
			application={App}
			clickThrough={false}
		>
			<eventbox
				className={"launcher container"}
				onKeyPressEvent={(_, event) => {
					const keyVal = event.get_keyval()[1];

					if (keyVal === Gdk.KEY_Escape) {
						App.toggle_window("launcher");
					}
				}}
			>
				<box vertical={true} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}>
					<SearchInput />

					<box vertical={false} halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true} spacing={10}>
						<Switcher />
						{theStack}
					</box>
				</box>
			</eventbox>
		</window>
	);
}
