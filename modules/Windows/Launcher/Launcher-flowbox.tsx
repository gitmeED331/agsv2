/**
 * MIT License
 *
 * Copyright (c) 2024 TopsyKrets
 */

import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { bind, execAsync, GLib, Variable } from "astal";
import AstalApps from "gi://AstalApps";
import Pango from "gi://Pango";
import Icon, { Icons } from "../../lib/icons";
import { winwidth, winheight } from "../../lib/screensizeadjust";
import { Stack, FlowBox, FlowBoxChild, Grid, SearchEntry } from "../../Astalified/index";
import Calculator from "./Calculator";
import FavoritesBar from "./FavoritesBar";
import ClickToClose from "../../lib/ClickToClose";

const background = `${SRC}/assets/groot-thin-right.png`;

const Apps = new AstalApps.Apps({
    nameMultiplier: 2,
    entryMultiplier: 0,
    executableMultiplier: 2,
    minScore: 2,
});

const Applications = bind(Apps, "list").as((apps) => apps.sort((a, b) =>
    a.get_name().localeCompare(b.get_name())
));

let query = "";
const filterContext = new Variable({
    query: "",
    selectedCategory: null,
});

const favorites = Applications.get().filter((app) => ["Zed", "Code - OSS", "deezer-enhanced", "Floorp", "KeePassXC"].includes(app.get_name()));

/* keep for looking up app names */
// console.log(Applications.map(app => app.get_name()));

function createAppButton(app: AstalApps.Application) {
    function validateIcon(iconName: string | null): boolean {
        if (!iconName) return false;

        const iconTheme = Gtk.IconTheme.get_default();

        if (iconTheme.has_icon(iconName)) return true;

        const iconPath = GLib.find_program_in_path(iconName);
        if (iconPath && GLib.file_test(iconPath, GLib.FileTest.EXISTS)) return true;

        return false;
    }

    const iconName = app.get_icon_name();
    const validIcon = validateIcon(iconName);

    const categories = getCategories(app).join(",").toLowerCase();

    const child = (
        <FlowBoxChild
            key={app.get_name()}
            name={app.get_name().toLowerCase()}
        >
            <button
                className="launcher app"
                tooltip_text={app.get_description()}
                on_clicked={() => {
                    app.launch();
                    App.toggle_window("launcher");
                }}
                onKeyPressEvent={(_, event) => {
                    if (event.get_keyval()[1] === Gdk.KEY_Return) {
                        app.launch();
                        App.toggle_window("launcher");
                    }
                }}
            >
                <box
                    vertical={false}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.FILL}
                    spacing={5}
                    widthRequest={winwidth(0.15)}
                >
                    {validIcon && (
                        <icon
                            icon={iconName}
                            halign={Gtk.Align.CENTER}
                            valign={Gtk.Align.CENTER}
                        />
                    )}
                    <label
                        label={app.get_name()}
                        halign={Gtk.Align.CENTER}
                        valign={Gtk.Align.CENTER}
                        ellipsize={Pango.EllipsizeMode.END}
                        maxWidthChars={30}
                        lines={1}
                        wrap={true}
                        xalign={0}
                        yalign={0}
                    />
                </box>
            </button>
        </FlowBoxChild>
    );

    (child as any).category = categories;

    return child;
}

let flowbox: Gtk.FlowBox | null = null;

function createFlowbox(appList: typeof Applications) {

    if (!flowbox) (
        flowbox = <FlowBox
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.START}
            selection_mode={Gtk.SelectionMode.NONE}
            vexpand
            setup={(self) => {

                self.set_filter_func((child) => {
                    const appName = child.get_name()?.toLowerCase();
                    const app = Applications.get().find((a) => a.get_name().toLowerCase() === appName);

                    if (!app) return false;

                    const matchesQuery = filterContext.query
                        ? app.get_name().toLowerCase().includes(filterContext.query.toLowerCase())
                        : true;

                    const matchesCategory = filterContext.selectedCategory
                        ? getCategories(app).includes(filterContext.selectedCategory)
                        : true;

                    return matchesQuery && matchesCategory;
                });
            }}
        >
            {appList.get().map(createAppButton)}
        </FlowBox> as Gtk.FlowBox
    )
    return flowbox
}

const createScrollablePage = (appList: typeof Applications) => (
    <scrollable
        visible={true}
        vscroll={Gtk.PolicyType.AUTOMATIC}
        hscroll={Gtk.PolicyType.NEVER}
        vexpand={true}
        hexpand={true}
        halign={Gtk.Align.FILL}
        valign={Gtk.Align.FILL}
        heightRequest={winheight(0.9)}
        css={`
			padding: 1rem;
		`}
    >
        {createFlowbox(appList)}
    </scrollable>
);

function getCategories(app: any): string[] {
    const mainCategories = [
        "AudioVideo", "Audio", "Video", "Development", "Education", "Game",
        "Graphics", "Network", "Office", "Science", "Settings", "System", "Utility"
    ];
    const categoryMap: Record<string, string> = {
        Audio: "Multimedia",
        AudioVideo: "Multimedia",
        Video: "Multimedia",
        Graphics: "Multimedia",
        Science: "Education",
        Settings: "System",
    };

    const substitute = (cat: string): string => categoryMap[cat] ?? cat;

    return (
        app.app
            .get_categories()
            ?.split(";")
            .filter((c) => mainCategories.includes(c))
            .map(substitute)
            .filter((c, i, arr) => arr.indexOf(c) === i) ?? []
    );
}
const uniqueCategories = Array.from(new Set(Applications.get().flatMap((app) => getCategories(app)))).sort((a, b) => a.localeCompare(b));

const handleCalculatorCommand = (query: string) => {
    const expression = query.slice(6).trim();

    if (expression) {
        const existingChild = (theStack as Stack).get_child_by_name("calculator");
        if (existingChild) {
            (theStack as Stack).remove(existingChild);
        }

        const calculatorPage = (
            <box vertical={true} spacing={10} hexpand={true} vexpand={true} name="calculator">
                <Calculator expression={expression} />
            </box>
        );

        (theStack as Stack).add_named(calculatorPage, "calculator");
        (theStack as Stack).set_visible_child_name("calculator");
    }
};

let currentQuery = "";
const entry = (
    <entry
        className="launcher search"
        placeholder_text="Search apps, TERM:: for terminal commands, CALC:: for calculator..."
        primary_icon_name={Icon.launcher.search}
        primary_icon_activatable={false}
        primary_icon_sensitive={false}
        secondary_icon_name={Icon.launcher.clear}
        secondary_icon_sensitive={true}
        secondary_icon_activatable={true}
        secondary_icon_tooltip_text="Clear search"
        hexpand
        vexpand={false}
        halign={Gtk.Align.FILL}
        valign={Gtk.Align.CENTER}
        activates_default
        focusOnClick
        on_changed={(self) => {
            const query = self.get_text().trim();
            filterContext.query = query;

            if (query.startsWith("CALC::") && (theStack as Stack).get_visible_child_name() !== "calculator") {
                (theStack as Stack).set_visible_child_name("calculator");
                return;
            }

            if (!query.startsWith("TERM::") && !query.startsWith("CALC::")) {
                (flowbox as Gtk.FlowBox).set_filter_func((child: Gtk.FlowBoxChild) =>
                    (child as any).name.toLowerCase().includes(query.toLowerCase())
                );
                (flowbox as Gtk.FlowBox).invalidate_filter();
            }
        }}
        on_key_press_event={(self, event) => {
            const keyval = event.get_keyval()[1];
            const state = event.get_state()[1];
            const query = self.get_text().trim();

            if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
                if (query.startsWith("TERM::")) {
                    const command = query.slice(6).trim();
                    if (command) {
                        const isShiftPressed = state & Gdk.ModifierType.SHIFT_MASK;
                        const cmd = isShiftPressed
                            ? `alacritty --hold --directory=$HOME -e ${command}`
                            : command;

                        execAsync(cmd);
                        self.set_text("");
                        App.toggle_window("launcher");
                    }
                }
                if (query.startsWith("CALC::")) {
                    handleCalculatorCommand(query);
                    (theStack as Stack).set_visible_child_name("calculator");
                }
            }
        }}
    />
);

entry.connect("icon-press", (_, event) => {
    (entry as Gtk.Entry).set_text("");
    filterContext.query = "";
    (theStack as Stack).set_visible_child_name("All Apps");

    (flowbox as Gtk.FlowBox).invalidate_filter();
});

const allAppsPage = (appList: typeof Applications) => (
    < box key="All Apps" name="All Apps" halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} >
        {createScrollablePage(appList)}
    </box>
);


function calculatorPage() {
    const expression = query.slice(6).trim();
    return <Calculator expression={expression} />;
}

const theStack = (
    <Stack
        className={"launcher stack"}
        transitionDuration={300}
        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
        halign={Gtk.Align.FILL}
        valign={Gtk.Align.FILL}
        hhomogeneous={true}
        vhomogeneous={false}
        visible={true}
        hexpand={false}
        vexpand={true}
        setup={(self) => {
            self.add_named(allAppsPage(Applications), "All Apps");
            self.add_named(calculatorPage(), "calculator");
        }}
    />
);

const Switcher = () => {
    const handleSwitch = (name: any) => {
        if (name === "All Apps") {
            filterContext.query = "";
            filterContext.selectedCategory = null;

            if (flowbox) {
                flowbox.set_filter_func(() => true);
                flowbox.invalidate_filter();
            }

            (entry as Gtk.SearchEntry).set_text("");
            if ((theStack as Stack).get_visible_child_name() !== "All Apps") {
                (theStack as Stack).set_visible_child_name("All Apps");
            }
        } else if (uniqueCategories.map((c) => c.toLowerCase()).includes(name)) {
            filterContext.selectedCategory = name;

            if (flowbox) {
                flowbox.set_filter_func((child: Gtk.FlowBoxChild) => {
                    const category = child.category;
                    return category.includes(name);
                });
                flowbox.invalidate_filter();
            }

            query = "";
            (entry as Gtk.SearchEntry).set_text("");
            if ((theStack as Stack).get_visible_child_name() !== "All Apps") {
                (theStack as Stack).set_visible_child_name("All Apps");
            }
        }
    };

    const allAppsClassName = () => {
        return Variable.derive(
            [bind(filterContext, "selectedCategory"), bind(filterContext, "query")],
            (selectedCategory, query) => {
                const classList = [];
                if (!selectedCategory && !query) {
                    classList.push("active");
                }
                return classList.join(" ");
            }
        );
    };

    const allAppsButton = (
        < button
            className={allAppsClassName().toString()}

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
        </button >
    );

    const categoryClassName = () => {
        return Variable.derive(
            [bind(filterContext, "selectedCategory"), bind(filterContext, "query")],
            (selectedCategory, query) => {
                const classList = [];
                if (selectedCategory && !query) {
                    classList.push("active");
                }
                return classList.join(" ");
            }
        );
    };
    const categoryButtons = uniqueCategories.map((category) => {
        const iconName = Icon.launcher[category.toLowerCase() as keyof typeof Icon.launcher] || Icon.launcher.system;

        return (
            <button
                className={categoryClassName().toString()}
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
            </button >
        );
    });

    return (
        <box className={"launcher switcher"} vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.FILL}>
            {[allAppsButton, categoryButtons]}
        </box>
    );
};

function Launcherflowbox({ monitor }: { monitor: number }) {
    const contentGrid = (
        <Grid
            className={"launcher contentgrid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
            hexpand={true} vexpand={true} visible={true}
            css={`
				background-image: url("${background}");
				background-size: contain;
				background-repeat: no-repeat;
				background-position: center;
				background-color: rgba(0, 0, 0, 1);
			`}
            setup={(self) => {
                self.attach(entry, 0, 0, 2, 1);
                self.attach(<FavoritesBar favorites={favorites} />, 0, 1, 2, 1);
                self.attach(Switcher(), 0, 2, 1, 1);
                self.attach(theStack, 1, 2, 1, 1);
            }}
        />
    );

    const masterGrid = (
        <Grid
            className={"launcher containergrid"} halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
            hexpand={true} vexpand={true} visible={true}
            setup={(self) => {
                self.attach(contentGrid, 1, 1, 1, 1);
                self.attach(ClickToClose(1, 0.8, 0.8, "launcher"), 2, 1, 1, 1);
            }}
        />
    );

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

App.connect("window-toggled", (_, win) => {
    if (win.name === "launcher") {
        if (win.visible === false) {
            query = "";
            filterContext.query = "";
            filterContext.selectedCategory = null;

            (entry as Gtk.Entry).set_text("");
            (theStack as Stack).set_visible_child_name("All Apps");
            if (flowbox) {
                flowbox.set_filter_func(() => true);
                flowbox.invalidate_filter();
            }
        }
        if (win.visible === true) {
            flowbox
        }
    }
});


export default Launcherflowbox;
