// import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
// import { execAsync, GLib, Gio, timeout } from "astal";
// import { Grid } from "../Astalified/index";
// import { winwidth, winheight } from "../lib/screensizeadjust";
// import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
// import Icon from "../lib/icons";

// const cacheDir = "/tmp/wallpaper_cache";

// GLib.mkdir_with_parents(cacheDir, 0o755);

// function getCachedImagePath(originalPath) {
//     const fileName = GLib.path_get_basename(originalPath);
//     return `${cacheDir}/${fileName}`;
// }

// function scaleAndCacheImage(originalPath, width, height) {
//     const cachedImagePath = getCachedImagePath(originalPath);

//     if (GLib.file_test(cachedImagePath, GLib.FileTest.EXISTS)) {
//         return cachedImagePath;
//     }

//     try {
//         const pixbuf = GdkPixbuf.Pixbuf.new_from_file(originalPath);
//         const scaledPixbuf = pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR);
//         scaledPixbuf?.savev(cachedImagePath, "png", [], []);
//         return cachedImagePath;
//     } catch (error) {
//         print(`Error scaling image: ${error.message}`);
//         return originalPath;
//     }
// }

// async function getWallpapersFromFolderAsync(batchSize = 10) {
//     const wallpapers = [];
//     const folderPath = "/home/topsykrets/Pictures/Wallpapers";

//     const directory = Gio.File.new_for_path(folderPath);
//     const uniqueBaseNames = new Set();

//     const enumerator = directory.enumerate_children("standard::name", Gio.FileQueryInfoFlags.NONE, null);
//     let info;
//     let batch = [];

//     while ((info = enumerator.next_file(null)) !== null) {
//         const fileName = info.get_name();
//         const baseName = GLib.path_get_basename(fileName).split('.').slice(0, -1).join('.');

//         if (fileName.endsWith(".png")) {
//             if (!uniqueBaseNames.has(baseName)) {
//                 uniqueBaseNames.add(baseName);

//                 batch.push({
//                     name: fileName,
//                     path: `${folderPath}/${fileName}`,
//                 });

//                 if (batch.length === batchSize) {
//                     wallpapers.push(...batch);
//                     batch = [];
//                     await new Promise(resolve => setTimeout(resolve, 50));
//                 }
//             }
//         } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
//             if (!uniqueBaseNames.has(baseName)) {
//                 const pngFileName = `${baseName}.png`;
//                 if (!uniqueBaseNames.has(pngFileName)) {
//                     uniqueBaseNames.add(baseName);

//                     batch.push({
//                         name: fileName,
//                         path: `${folderPath}/${fileName}`,
//                     });

//                     if (batch.length === batchSize) {
//                         wallpapers.push(...batch);
//                         batch = [];
//                         await new Promise(resolve => setTimeout(resolve, 50));
//                     }
//                 }
//             }
//         }
//     }
//     wallpapers.push(...batch);

//     wallpapers.sort((a, b) => a.name.localeCompare(b.name));

//     return wallpapers;
// }

// function createWallpaperGrid(wps) {
//     const columnCount = 5;

//     const grid = new Grid({
//         hexpand: true,
//         vexpand: false,
//         halign: Gtk.Align.FILL,
//         valign: Gtk.Align.FILL,
//         rowHomogeneous: true,
//         columnHomogeneous: true,
//         row_spacing: 10,
//         column_spacing: 5,
//         widthRequest: winwidth(0.35),
//         heightRequest: winheight(0.35),
//         css: `padding: 1rem;`
//     });

//     wps.forEach((wp, index) => {
//         const cachedImagePath = scaleAndCacheImage(wp.path, winwidth(0.05), winheight(0.05));

//         const wpButton = (
//             <button
//                 className={"launcher app"}
//                 name={wp.name}
//                 tooltip_text={wp.name}
//                 on_clicked={() => {
//                     execAsync(`swww img ${wp.path}`);
//                     App.toggle_window("wallpapers");
//                 }}
//                 widthRequest={winwidth(0.1)}
//                 heightRequest={winheight(0.1)}
//                 halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}
//             >
//                 <box className={"wallpaper image"}
//                     halign={Gtk.Align.FILL} valign={Gtk.Align.FILL}
//                     css={`
//                         background-image: url("${cachedImagePath}");
//                         background-size: cover;
//                         background-repeat: no-repeat;
//                         border-radius: 3rem;
//                     `}
//                 />
//             </button>
//         );
//         grid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
//     });

//     return grid;
// }

// export default function () {
//     const refreshButton = (
//         <button
//             className={"refresh button"}
//             tooltip_text={"Refresh Wallpapers"}
//             on_clicked={async () => {
//                 const cacheDirFile = Gio.File.new_for_path(cacheDir);

//                 await cacheDirFile.delete_async(null, (file, result) => {
//                     try {
//                         file.delete_finish(result);
//                     } catch (error) {
//                         print(`Error deleting cache directory: ${error.message}`);
//                     }
//                 });

//                 GLib.mkdir_with_parents(cacheDir, 0o755);
//                 const wps = await getWallpapersFromFolderAsync();
//                 wallpaperGrid.remove(createScrollablePage(wps));
//                 wallpaperGrid.attach(createScrollablePage(wps), 1, 1, 1, 1);
//             }}
//             halign={Gtk.Align.START}
//             valign={Gtk.Align.START}
//         >
//             <icon icon={Icon.ui.refresh} />
//         </button>
//     );

//     function createScrollablePage(wps) {
//         return (
//             <box css={"background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;"}>
//                 <scrollable
//                     vscroll={Gtk.PolicyType.AUTOMATIC}
//                     hscroll={Gtk.PolicyType.NEVER}
//                     vexpand={true}
//                     hexpand={true}
//                     halign={Gtk.Align.FILL}
//                     valign={Gtk.Align.FILL}
//                     visible={true}
//                     widthRequest={winwidth(0.35)}
//                     heightRequest={winheight(0.35)}
//                 >
//                     {createWallpaperGrid(wps)}
//                 </scrollable>
//                 {refreshButton}
//             </box>
//         );
//     }

//     function eventHandler(eh) {
//         const eventbox = (
//             <eventbox
//                 halign={Gtk.Align.FILL}
//                 valign={Gtk.Align.FILL}
//                 onClick={(_, event) => {
//                     const win = App.get_window("wallpapers");
//                     if (event.button === Gdk.BUTTON_PRIMARY) {
//                         if (win && win.visible === true) {
//                             win.visible = false;
//                         }
//                     }
//                 }}
//                 widthRequest={winwidth(0.2)}
//                 heightRequest={winheight(0.2)}
//             />
//         );
//         return eventbox;
//     }

//     const wallpaperGrid = new Grid({
//         hexpand: true,
//         vexpand: true,
//         halign: Gtk.Align.FILL,
//         valign: Gtk.Align.FILL,
//         visible: true,
//     });

//     const loadWallpapers = async () => {
//         const wps = await getWallpapersFromFolderAsync();
//         wallpaperGrid.attach(createScrollablePage(wps), 1, 1, 1, 1);
//     };

//     loadWallpapers()

//     wallpaperGrid.attach(eventHandler(1), 0, 0, 3, 1); // Top
//     wallpaperGrid.attach(eventHandler(2), 0, 1, 1, 1); // Left
//     wallpaperGrid.attach(eventHandler(3), 2, 1, 1, 1); // Right
//     wallpaperGrid.attach(eventHandler(4), 0, 2, 3, 1); // Bottom

//     const window = (
//         <window
//             name={"wallpapers"}
//             className={"wallpapers window"}
//             anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
//             layer={Astal.Layer.OVERLAY}
//             exclusivity={Astal.Exclusivity.NORMAL}
//             keymode={Astal.Keymode.EXCLUSIVE}
//             visible={false}
//             application={App}
//             onKeyPressEvent={(_, event) => {
//                 const win = App.get_window("wallpapers");
//                 if (event.get_keyval()[1] === Gdk.KEY_Escape) {
//                     if (win && win.visible === true) {
//                         win.visible = false;
//                     }
//                 }
//             }}
//         >
//             {wallpaperGrid}
//         </window>
//     );

//     return window;
// }

import { Astal, Gtk, Gdk, App, Widget } from "astal/gtk3";
import { execAsync, GLib, Gio } from "astal";
import { Grid, Spinner } from "../Astalified/index";
import { winwidth, winheight } from "../lib/screensizeadjust";
import GdkPixbuf from "gi://GdkPixbuf?version=2.0";
import Icon from "../lib/icons";
import ClickToClose from "../lib/ClickToClose";

const originalPath = `${GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES)}/Wallpapers`;
const cacheDir = "/tmp/wallpaper_cache";
const shellScriptPath = `${SRC}/scripts/scale_and_cache_images.sh`;
const columnCount = 5
GLib.mkdir_with_parents(cacheDir, 0o755);

async function getCachedImagePath(wallpaperPath: string, width: number, height: number): Promise<string> {
    try {
        const stdout = await execAsync(`${shellScriptPath} "${wallpaperPath}" ${width} ${height}`);
        return stdout.trim();
    } catch (error) {
        console.error(`Error retrieving cached image path: ${error.message}`);
        return wallpaperPath;
    }
}

async function getWallpapers(): Promise<Array<{ name: string; path: string; originalPath: string }>> {
    try {
        const stdout = await execAsync(`${shellScriptPath}`);
        const paths = stdout.trim().split("\n").filter(path => path.trim() !== "");

        return paths.map((path) => ({
            name: path.split("/").pop() || "Unknown",
            path,
            originalPath: path.replace(cacheDir, originalPath),
        }));
    } catch (error) {
        console.error("Error executing script to retrieve wallpapers:", error);
        return [];
    }
}

async function createWallpaperGrid(wps) {
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

    for (const [index, wp] of wps.entries()) {
        const cachedImagePath = await getCachedImagePath(wp.originalPath, winwidth(0.05), winheight(0.05));

        const wpButton = (
            <button
                className={"launcher app"}
                name={wp.name}
                tooltip_text={wp.name}
                on_clicked={() => {
                    execAsync(`swww img "${wp.originalPath}"`);
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
    }

    return grid;
}

async function updateWallpaperGrid(wallpaperGrid, wallpapers) {
    const sortedWallpapers = wallpapers.sort((a, b) => a.name.localeCompare(b.name));

    wallpaperGrid.get_children().forEach((child) => {
        wallpaperGrid.remove(child);
    });

    for (const [index, wp] of sortedWallpapers.entries()) {
        const cachedImagePath = await getCachedImagePath(wp.originalPath, winwidth(0.05), winheight(0.05));

        const wpButton = (
            <button
                className={"launcher app"}
                name={wp.name}
                tooltip_text={wp.name}
                on_clicked={() => {
                    execAsync(`swww img "${wp.originalPath}"`);
                    App.toggle_window("wallpapers");
                }}
                widthRequest={winwidth(0.1)}
                heightRequest={winheight(0.1)}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
            >
                <box
                    className={"wallpaper image"}
                    halign={Gtk.Align.FILL}
                    valign={Gtk.Align.FILL}
                    css={`
                        background-image: url("${cachedImagePath}");
                        background-size: cover;
                        background-repeat: no-repeat;
                        border-radius: 3rem;
                    `}
                />
            </button>
        );

        wallpaperGrid.attach(wpButton, index % columnCount, Math.floor(index / columnCount), 1, 1);
    }

    wallpaperGrid.show_all();
}

function createRefreshButton(wallpaperGrid) {
    const theSpinner = new Spinner({
        halign: Gtk.Align.CENTER,
        valign: Gtk.Align.CENTER,
        visible: false,
    });

    const handleClick = () => {
        execAsync(`notify-send "Refreshing" "Starting wallpaper refresh process."`);
        console.log("Refresh button clicked.");

        theButton.hide();
        theSpinner.show();
        theSpinner.start();

        execAsync(`${SRC}/scripts/refresh_wallpapers.sh`)
            .then(() => {
                execAsync(`notify-send "Refreshing" "Wallpaper refresh completed successfully."`);
                console.log("Wallpaper refresh script executed successfully.");
                return getWallpapers();
            })
            .then((wps) => {
                console.log(`Fetched ${wps.length} wallpapers after refresh.`);
                updateWallpaperGrid(wallpaperGrid, wps);
            })
            .catch((error) => {
                console.error(`Error refreshing wallpapers: ${error.message}`);
                execAsync(`notify-send "Error" "Wallpaper refresh failed: ${error.message}"`);
            })
            .finally(() => {
                theSpinner.stop();
                theSpinner.hide();
                theButton.show();
                execAsync(`notify-send "Refreshing" "Refresh process ended."`);
                console.log("Refresh process completed.");
            });
    };

    const theButton = (
        <button
            className={"refresh button"}
            tooltip_text={"Refresh Wallpapers"}
            on_clicked={handleClick}
            halign={Gtk.Align.START}
            valign={Gtk.Align.START}
        >
            <icon icon={Icon.ui.refresh} />
        </button>
    );

    const container = (
        <box hexpand={false} vexpand={false} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
            {theSpinner}
            {theButton}
        </box>
    );

    return container;
}

async function createScrollablePage(wps) {
    const wallpaperGrid = await createWallpaperGrid(wps);
    const refreshButton = createRefreshButton(wallpaperGrid);
    return (
        <box css="background-color: rgba(0,0,0,0.75); border: 2px solid rgba(15,155,255,1); border-radius: 3rem; padding: 1rem;">
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
                {wallpaperGrid}
            </scrollable>
            {refreshButton}
        </box>
    );
}

export default async function () {
    const wallpaperGrid = new Grid({
        hexpand: true,
        vexpand: true,
        halign: Gtk.Align.FILL,
        valign: Gtk.Align.FILL,
        visible: true,
    });

    const wps = await getWallpapers();
    const gridContent = await createScrollablePage(wps);
    wallpaperGrid.attach(gridContent, 1, 1, 1, 1);

    wallpaperGrid.attach(ClickToClose(1, 0.25, 0.25, "wallpapers"), 0, 0, 3, 1); // Top
    wallpaperGrid.attach(ClickToClose(2, 0.25, 0.25, "wallpapers"), 0, 1, 1, 1); // Left
    wallpaperGrid.attach(ClickToClose(3, 0.25, 0.25, "wallpapers"), 2, 1, 1, 1); // Right
    wallpaperGrid.attach(ClickToClose(4, 0.25, 0.25, "wallpapers"), 0, 2, 3, 1); // Bottom

    const window = (
        <window
            name="wallpapers"
            className="wallpapers window"
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT}
            layer={Astal.Layer.OVERLAY}
            exclusivity={Astal.Exclusivity.NORMAL}
            keymode={Astal.Keymode.EXCLUSIVE}
            visible={false}
            application={App}
            onKeyPressEvent={(_, event) => {
                const win = App.get_window("wallpapers");
                if (event.get_keyval()[1] === Gdk.KEY_Escape && win?.visible) {
                    win.visible = false;
                }
            }}
        >
            {wallpaperGrid}
        </window>
    );

    return window;
}
