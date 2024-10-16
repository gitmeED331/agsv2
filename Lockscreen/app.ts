#!/usr/bin/gjs -m
import { Astal, Gtk, Gdk, App } from "astal/gtk3";
import { GLib, execAsync, monitorFile } from "astal";

import style from "./style/main.scss";

import Lockscreen from "./Lockscreen";

App.start({
    css: style,
    main() {

    },
});
