import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { Variable, bind, execAsync, GLib } from "astal";
import ClickToClose from "../../lib/ClickToClose";
import { Apps, Applications, AstalApplication } from "./AppAccess";
import ScreenSizing from "../../lib/screensizeadjust";

const text = Variable("");

function Carousel({ apps }: { apps: AstalApplication }) {
    const filteredApps = text((query) => Apps.fuzzy_query(query));
    var currentIndex = Variable(0);
    function AppButton({ app }: { app: AstalApplication }) {
        return (
            <button
                className="launcher app"
                onClicked={() => {
                    app.launch();
                    App.toggle_window("testlauncher");
                }}
            // canFocus={canfocus}
            >
                <box vertical >
                    <icon icon={app.get_icon_name()} valign={CENTER} halign={CENTER} css={`font-size: 64px;`} />
                    <label
                        className="name"
                        truncate
                        valign={CENTER}
                        halign={CENTER}
                        label={app.get_name()}
                        visible={true}
                        css={`font-size: 24px;`}
                    />
                </box>
            </button>
        );
    }
    return (
        <box height_request={100} halign={CENTER}>
            {filteredApps.as((list) => list.length > 0) ?
                <box spacing={6} css={`background-color: blue;`}>
                    {/* {bind(filteredApps.as((list) =>
                        list.map((app, index) =>
                            // index === currentIndex.get() ? <AppButton app={app} canfocus={true} /> : <AppButton app={app} canfocus={false} /> // this works, but you will lose the use of arrow keys
                            <AppButton app={app} />
                        )
                    ))} */}
                    {bind(filteredApps.as((list) =>
                        list.slice(Math.max(0, currentIndex.get() - 1), Math.min(list.length, currentIndex.get() + 3)).map((app) =>
                            <AppButton app={app} />
                        )
                    ))}
                </box>
                : <box
                    halign={Gtk.Align.CENTER}
                    className="not-found"
                    vertical
                    visible={filteredApps.as((list) => list.length === 0)}
                >
                    <icon icon="system-search-symbolic" css={`font-size: 48px;`} />
                    <label label="No match found" />
                </box>
            }
        </box>
    );
}

export default function () {
    return <window
        name={"testlauncher"}
        className={"launcher window"}
        exclusivity={Astal.Exclusivity.NORMAL}
        anchor={TOP | TOP}
        keymode={Astal.Keymode.EXCLUSIVE}
        application={App}
        visible={false}
        onKeyPressEvent={(_, event) => {
            const win = App.get_window("testlauncher");
            if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                if (win && win.visible === true) {
                    text.set("");
                    win.visible = false;
                }
            }
        }}
    >
        <box
            css={`
            background-color: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(0, 0, 0, 0.7);
            border-radius: 10px;
            padding: 10px;
            `}
            vertical
            spacing={5}
        >
            <Carousel apps={Applications[0]} />
            <entry

                placeholderText="Search"
                text={text()}
                onChanged={(self) => text.set(self.text)}
                onActivate={() => {
                    Apps.fuzzy_query(text.get())?.[0].launch();
                    App.toggle_window("testlauncher");
                }}
                setup={self => {
                    App.connect("window-toggled", () => {
                        const win = App.get_window("testlauncher");
                        if (win && win.name == "testlauncher" && win.visible == true) {
                            self.grab_focus()
                        }
                    })
                }}
            />
        </box>
    </window>
};