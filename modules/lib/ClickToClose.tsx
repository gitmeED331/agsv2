import { Gtk, Gdk, App } from "astal/gtk3";
import { winwidth, winheight } from "./screensizeadjust";

export default function (eh: number, width: number, height: number, windowName: string) {
    return (
        <eventbox
            halign={Gtk.Align.FILL}
            valign={Gtk.Align.FILL}
            onClick={(_, event) => {
                const win = App.get_window(windowName);
                if (event.button === Gdk.BUTTON_PRIMARY && win?.visible) {
                    win.visible = false;
                }
            }
            }
            widthRequest={winwidth(width)}
            heightRequest={winheight(height)}
        />
    );
}