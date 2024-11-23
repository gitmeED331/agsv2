import { Gtk, App } from "astal/gtk3";
import { Icons } from "../../lib/icons";

export default function FavoritesBar({ favorites }) {
    return (
        <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={10}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            className={"favorites-bar"}
            visible={true}
            hexpand={true}
        >
            {
                favorites.map((app) => (
                    <button
                        className="launcher favorite-app"
                        name={app.get_name()}
                        valign={Gtk.Align.CENTER}
                        halign={Gtk.Align.CENTER}
                        tooltip_text={app.get_description()}

                        on_clicked={() => {
                            app.launch();
                            App.toggle_window("launcher");
                        }}
                    >
                        <icon icon={Icons(app.icon_name)} />
                        {/* <label label={app.get_name()} truncate /> */}
                    </button>
                ))
            }
        </ box>
    );
}
