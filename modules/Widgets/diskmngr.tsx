import { Gtk, Gdk, App, Astal } from "astal/gtk3";
import { Variable, execAsync, GLib } from "astal";
import { FlowBox, FlowBoxChild } from "../Astalified/index";
import UDisks from "gi://UDisks?version=2.0";
import DBus from "gi://DBus?version=1.0";
import Hyprland from 'gi://AstalHyprland';

function openDrive(path: string) {
    execAsync(`xdg-open ${path}`);
}

function handleDriveAction(drive: any, action: "mount" | "unmount" | "eject") {
    if (action === "mount") {
        drive.mount({}, (result: number) => {
            if (result === 0) {
                console.log("Drive mounted");
            } else {
                console.error("Error mounting the drive");
            }
        });
    } else if (action === "unmount") {
        drive.unmount({}, (result: number) => {
            if (result === 0) {
                console.log("Drive unmounted");
            } else {
                console.error("Error unmounting the drive");
            }
        });
    } else if (action === "eject") {
        drive.eject({}, (result: number) => {
            if (result === 0) {
                console.log("Drive ejected");
            } else {
                console.error("Error ejecting the drive");
            }
        });
    }
}

function createDriveButton(drive: any) {
    return (
        <button onClick={() => openDrive(drive.get_mount_points()[0])}>
            <icon icon={drive.get_icon()} />
            <label label={drive.get_name()} />
        </button>
    );
}

export default () => {
    const udisks = new UDisks.Client()

    const removableDrives = drives.filter((drive: any) => drive.get_drive_type() === "removable");
    const cloudDrives = drives.filter((drive: any) => drive.get_drive_type() === "cloud");

    return (
        <box>
            <box>
                <label label={"Removable Media"} />
                <FlowBox halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                    {removableDrives.map((drive: any) => (
                        <FlowBoxChild>
                            {createDriveButton(drive)}
                            <button onClick={() => handleDriveAction(drive, "mount")}>Mount</button>
                            <button onClick={() => handleDriveAction(drive, "unmount")}>Unmount</button>
                            <button onClick={() => handleDriveAction(drive, "eject")}>Eject</button>
                        </FlowBoxChild>
                    ))}
                </FlowBox>
            </box>
            <box>
                <label label={"Cloud/Network Drives"} />
                <FlowBox halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                    {cloudDrives.map((drive: any) => (
                        <FlowBoxChild>
                            {createDriveButton(drive)}
                            <button onClick={() => handleDriveAction(drive, "mount")}>Mount</button>
                            <button onClick={() => handleDriveAction(drive, "unmount")}>Unmount</button>
                            <button onClick={() => handleDriveAction(drive, "eject")}>Eject</button>
                        </FlowBoxChild>
                    ))}
                </FlowBox>
            </box>
        </box>
    );
};
