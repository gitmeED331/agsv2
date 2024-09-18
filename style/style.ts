import { App, monitorFile, execAsync, exec, GLib, writeFile } from "astal"
import DirectoryMonitorService from "../modules/lib/DirectoryMonitorService"
// const Icons = `${GLib.get_user_data_dir()}/icons/Astal`
const STYLEDIR = `${GLib.get_user_config_dir()}/astal-gjs/src/style`
const DISTDIR = `${GLib.get_user_config_dir()}/astal-gjs/dist`

async function resetCss() {
    const scss = `${STYLEDIR}/main.scss`
    const css = `${DISTDIR}/main.css`

    // const fd = await execAsync(`fd ".scss" ${STYLEDIR}`)
    // const files = fd.split(/\s+/)
    // const imports = [...files].map(f => `@import '${f}';`)

    //await writeFile(imports.join("\n"), scss)
    await execAsync(`sass ${scss} ${css}`)

    await App.apply_css(css, true)
}

monitorFile(`${STYLEDIR}`, resetCss)
//DirectoryMonitorService.connect("changed", () => resetCss())
await resetCss()

export default {}