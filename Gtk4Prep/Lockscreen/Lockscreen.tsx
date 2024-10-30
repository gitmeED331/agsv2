import { Astal, App, Gtk, Gdk } from "astal/gtk4";
import { execAsync, bind, Variable, timeout } from "astal";
import Lock from "gi://GtkSessionLock";
import AstalAuth from "gi://AstalAuth";
import AstalMpris from "gi://AstalMpris";
import { Grid } from "../modules/Astalified/index";

/* Widgets */
import Controls from "./Controls";
import { BatteryButton, BluetoothButton, VolumeIndicator, NetworkButton } from "../modules/Widgets/index";
import Player from "./MediaPlayer";
import { winwidth, winheight } from "../modules/lib/screensizeadjust";
import Clock from "./clock";

const player = AstalMpris.Player.new("Deezer");

const prompt = Variable("");
const inputVisible = Variable(true);
const inputNeeded = Variable(false);
const pam = new AstalAuth.Pam();
const sessionLock = Lock.prepare_lock();

function authMessage(msg, type) {
    return (
        <label label={msg.toString()}
            wrap={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
        />
    )
}

function authMessages() {

    const box = <box halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} />;
    pam.connect("auth-error", (auth, msg) => {
        (box as Gtk.Box).add(authMessage(msg, "auth-error"));
        box.show_all();
    });
    pam.connect("auth-info", (auth, msg) => {
        (box as Gtk.Box).add(authMessage(msg, "auth-info"));
        box.show_all();
    });
    pam.connect("fail", (auth, msg) => {
        (box as Gtk.Box).add(authMessage(msg, "fail"));
        box.show_all();
    });
    pam.connect("success", (auth, msg) => {
        (box as Gtk.Box).add(authMessage(msg, "success"));
        box.show_all();
    });
    return box;
}

function loginGrid() {
    const promptLabel = (
        <label
            label={bind(prompt).as((p) => p.toUpperCase())}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} visible={bind(inputNeeded)}
        />
    );

    const PasswordEntry = (
        <entry
            className={"password"} placeholder_text={"Enter your password..."} visibility={false}
            // sensitive={bind(inputNeeded)}

            onActivate={(self) => {
                if (self.get_text().length === 0) {
                    inputNeeded.set(true)
                    prompt.set("Password Required, try again.");
                    return
                } else if (self.get_text().length > 0) {
                    inputNeeded.set(false);
                    pam.supply_secret(self.text);
                    self.text = "";
                }
            }}
            hexpand={true} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            onRealize={(self) => self.grab_focus()}
        />
    );
    const passwordPrompt = (
        <box vertical spacing={10}>
            {[promptLabel, PasswordEntry]}
        </box>
    )

    const currentUser = (
        <label
            className={"username"}
            label={bind(pam, "username").as((u) => u.toUpperCase())}
            halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
        />
    );

    const grid = new Grid({
        className: "logingrid",
        halign: Gtk.Align.CENTER, valign: Gtk.Align.CENTER,
        hexpand: true, vexpand: true, rowSpacing: 15,
        visible: bind(inputVisible),
    });

    grid.attach(currentUser, 0, 0, 1, 1);
    // if (prompt.get().length > 0) {
    // grid.attach(promptLabel, 0, 1, 1, 1);
    // }
    grid.attach(passwordPrompt, 0, 1, 1, 1);
    grid.attach(authMessages(), 0, 2, 1, 1);

    return grid;
}

function topRightGrid() {
    const grid = new Grid({
        halign: Gtk.Align.END, valign: Gtk.Align.START,
        hexpand: true, vexpand: true, visible: true,
        columnSpacing: 10,
    });

    grid.attach(VolumeIndicator(), 0, 0, 1, 1);
    grid.attach(NetworkButton(), 1, 0, 1, 1);
    grid.attach(BluetoothButton(), 2, 0, 1, 1);
    grid.attach(BatteryButton(), 3, 0, 1, 1);

    return (
        <box className={"topright"} vertical={false} hexpand={true} spacing={5}
            halign={Gtk.Align.END} valign={Gtk.Align.START} visible={true}>
            {grid}
        </box>
    )
}

// const overlayGrid = new Grid({
//     className: "overlayGrid",
//     widthRequest: winwidth(1), heightRequest: winheight(1),
//     halign: Gtk.Align.FILL, valign: Gtk.Align.FILL,
//     hexpand: true, vexpand: true, visible: true,
//     width_request: winwidth(1), height_request: winheight(1),
// });

// overlayGrid.attach(Controls(), 0, 0, 1, 1);
// overlayGrid.attach(Clock(), 1, 0, 1, 1);
// overlayGrid.attach(topRightGrid(), 2, 0, 1, 1);
// const thePlayer = <Player player={player} />;
// if (thePlayer) {
//     overlayGrid.attach(thePlayer, 0, 1, 3, 1);
// }

function Lockscreen({ monitor }: { monitor: number }) {
    const overlayBox = (
        <box halign={Gtk.Align.FILL} valign={Gtk.Align.FILL} hexpand={true} vexpand={true}>
            <centerbox halign={Gtk.Align.FILL} valign={Gtk.Align.START} hexpand={true} vexpand={true}>
                {Controls()}
                {Clock()}
                {topRightGrid()}
            </centerbox>
            <Player player={player} />
        </box>
    );

    return (
        <window
            name={`lockscreen-${monitor}`}
            className={"lockscreen"}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
            // layer={Astal.Layer.TOP}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={false}
            application={App}
            monitor={monitor}
            clickThrough={false}
        >
            <overlay
                visible={true} passThrough={true} clickThrough={true}
                halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
                hexpand={true} vexpand={true}
            >
                {loginGrid()}
                {overlayBox}
            </overlay>
        </window>
    );
}

const display = Gdk.Display.get_default();
const windows: { window: Gtk.Window }[] = [];

function createWindow(monitor) {
    const lockscreenWindow = Lockscreen({ monitor });
    return {
        window: lockscreenWindow as Gtk.Window,
        monitor: monitor
    };
}

App.connect("activate", () => {
    if (display) {
        for (let m = 0; m < display.get_n_monitors(); m++) {
            const monitor = display.get_monitor(m);
            const w = createWindow(monitor);
            if (w && sessionLock) {
                sessionLock.new_surface(w.window, w.monitor);
                w.window.show();
                windows.push(w);
            }
        }

        display.connect("monitor-added", (disp, monitor) => {
            const w = createWindow(monitor);
            if (w && sessionLock) {
                sessionLock.new_surface(w.window, w.monitor);
                w.window.show();
                windows.push(w);
            }
        });

        sessionLock.lock_lock();
    }
});

const isAuthenticating = Variable(false);

function startAuthentication() {
    if (!isAuthenticating.get()) {
        isAuthenticating.set(true);
        pam.start_authenticate();
        isAuthenticating.set(false);
    }
}

pam.connect("auth-prompt-visible", (auth, msg) => {
    prompt.set(msg);
    inputVisible.set(true);
    inputNeeded.set(true);
});

pam.connect("auth-prompt-hidden", () => {
    inputVisible.set(false);
    inputNeeded.set(false);
    isAuthenticating.set(false);
});

pam.connect("success", () => {
    isAuthenticating.set(false);
    // execAsync("ags -i lockscreen -q");
    if (sessionLock) {
        sessionLock.unlock_and_destroy();
    }
    App.quit();
});

pam.connect("fail", () => {
    isAuthenticating.set(false);

    timeout(2000, () => {
        if (!isAuthenticating.get()) {
            startAuthentication();
        }
    });
});

sessionLock.lock_lock();
sessionLock.connect("locked", () => {
    pam.start_authenticate();
});
sessionLock.connect("finished", () => {
    sessionLock.destroy();
    Gdk.Display.get_default()?.sync();
    App.quit();
});

export default Lockscreen;