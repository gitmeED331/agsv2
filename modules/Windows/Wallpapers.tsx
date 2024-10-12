import { execAsync, Gtk, Gdk, GLib, Gio, Astal, App } from "astal";
import { Grid } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0"
import Icon from "../lib/icons";

const cacheDir = "/tmp/wallpaper_cache";

GLib.mkdir_with_parents(cacheDir, 0o755);

function getCachedImagePath(originalPath) {
    const fileName = GLib.path_get_basename(originalPath);
    return `${cacheDir}/${fileName}`;
}

function scaleAndCacheImage(originalPath, width, height) {
    const cachedImagePath = getCachedImagePath(originalPath);

    if (GLib.file_test(cachedImagePath, GLib.FileTest.EXISTS)) {
        return cachedImagePath;
    }

    try {
        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(originalPath);
        const scaledPixbuf = pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR);
        scaledPixbuf.savev(cachedImagePath, "png", [], []);
        return cachedImagePath;
    } catch (error) {
        print(`Error scaling image: ${error.message}`);
        return originalPath;
    }
}

async function getWallpapersFromFolderAsync(batchSize = 10) {
    const wallpapers = [];
    const folderPath = "/home/topsykrets/Pictures/Wallpapers";

    const directory = Gio.File.new_for_path(folderPath);

    try {
        const enumerator = directory.enumerate_children("standard::name", Gio.FileQueryInfoFlags.NONE, null);
        let info;
        let batch = [];

        while ((info = enumerator.next_file(null)) !== null) {
            const fileName = info.get_name();
            if (fileName.endsWith(".png") || fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
                batch.push({
                    name: fileName,
                    path: `${folderPath}/${fileName}`,
                });

                if (batch.length === batchSize) {
                    wallpapers.push(...batch);
                    batch = [];
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
        }
        wallpapers.push(...batch);
    } catch (error) {
        print(`Error reading the wallpapers folder: ${error.message}`);
    }

    return wallpapers;
}

function createWallpaperGrid(wps: { name: string, path: string }[]) {
    const columnCount = 5;

    const grid = new Grid({
        hexpand: true,
        vexpand: false,
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        rowHomogeneous: true,
        columnHomogeneous: true,
        row_spacing: 10,
        column_spacing: 5,
        widthRequest: winwidth(0.35),
        heightRequest: winheight(0.35),
        css: `padding: 1rem;`
    });

    wps.forEach((wp, index) => {
        const cachedImagePath = scaleAndCacheImage(wp.path, winwidth(0.05), winheight(0.05));

        const wpButton = (
            <button
                className={"launcher app"}
                name={wp.name}
                tooltip_text={wp.name}
                on_clicked={() => {
                    execAsync(`swww img ${wp.path}`);
                    App.toggle_window("wallpapers");
                }}
                widthRequest={winwidth(0.1)}
                heightRequest={winheight(0.1)}
                halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
            >
                <box className={"wallpaper image"}
                    halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
                    css={`
                        background-image: url("${cachedImagePath}");
                        background-size: cover;
                        background-repeat: no-repeat;
                        border-radius: 3rem;
                    `}
                />
            </button>
        );
        grid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
    });

    return grid;
}

const refreshButton = (
    <button
        className={"refresh button"}
        tooltip_text={"Refresh Wallpapers"}
        on_clicked={async () => {
            await loadWallpapers(); // Reload wallpapers
        }}
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}
    >
        <icon icon={Icon.ui.refresh} />
    </button>
);

function createScrollablePage(wps) {
    return (
        <box css={"background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;"}>
            <scrollable
                vscroll={Gtk.PolicyType.AUTOMATIC}
                hscroll={Gtk.PolicyType.NEVER}
                vexpand={true}
                hexpand={true}
                halign={Gtk.Align.FILL}
                valign={Gtk.Align.FILL}
                visible={true}
                widthRequest={winwidth(0.35)}
                heightRequest={winheight(0.35)}
            >
                {createWallpaperGrid(wps)}
            </scrollable>
            {refreshButton}
        </box>
    );
}

export default function WallpaperChooser() {

    function eventHandler(eh: number) {
        const eventbox = <eventbox
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            onClick={(_, event) => {
                const win = App.get_window("wallpapers");
                if (event.button === Gdk.BUTTON_PRIMARY) {
                    if (win && win.visible === true) {
                        win.visible = false;
                    }
                }
            }}
            widthRequest={winwidth(0.2)}
            heightRequest={winheight(0.2)}
        />;
        return eventbox;
    }

    const wallpaperGrid = new Grid({
        hexpand: true,
        vexpand: true,
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        visible: true,
    });

    const loadWallpapers = async () => {
        const wps = await getWallpapersFromFolderAsync();
        wallpaperGrid.attach(createScrollablePage(wps), 1, 1, 1, 1);
    };

    // wallpaperGrid.attach(refreshButton, 2, 1, 1, 1)
    wallpaperGrid.attach(eventHandler(1), 0, 0, 3, 1); // top
    wallpaperGrid.attach(eventHandler(2), 0, 1, 1, 1); // left
    wallpaperGrid.attach(eventHandler(3), 2, 1, 1, 1); // right
    wallpaperGrid.attach(eventHandler(4), 0, 2, 3, 1); // bottom

    loadWallpapers();

    const window = <window
        name={"wallpapers"}
        className={"wallpapers window"}
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
        layer={Astal.Layer.OVERLAY}
        exclusivity={Astal.Exclusivity.NORMAL}
        keymode={Astal.Keymode.EXCLUSIVE}
        visible={false}
        application={App}
        onKeyPressEvent={(_, event) => {
            const win = App.get_window("wallpapers");
            if (event.get_keyval()[1] === Gdk.KEY_Escape) {
                if (win && win.visible === true) {
                    win.visible = false;
                }
            }
        }}
    >
        {wallpaperGrid}
    </window>;

    return window;
}
