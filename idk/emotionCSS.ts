import {
    css as emotionCss,
    cache,
    flush as emotionFlush,
    cx as emotionCx,
} from "@emotion/css";
import {
    type ArrayCSSInterpolation,
    type ClassNamesArg,
} from "@emotion/css/create-instance";
import { compile, serialize, stringify } from "stylis";

const applyed: string[] = [];

function _applyCss(className: string) {
    if (!applyed.includes(className)) {
        const style = serialize(
            compile(`.${className} { ${cache.registered[className]} } `),
            stringify,
        );

        App.applyCss(style);
        applyed.push(className);
    }
}

export function flush() {
    applyed.splice(0, applyed.length);
    App.resetCss();
    emotionFlush();
}

export function css(...args: ArrayCSSInterpolation) {
    const className = emotionCss(...args);
    _applyCss(className);
    return className;
}

export function cx(...args: ClassNamesArg[]) {
    const className = emotionCx(...args);
    _applyCss(className);
    return className;
}