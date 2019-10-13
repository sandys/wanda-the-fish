const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Gettext = imports.gettext.domain('wanda-the-fish');
const _ = Gettext.gettext;

let msg, text, button, fortune, visible, error;
let got_humour = true, settings;

const GOT_HUMOUR_KEY = 'got-humour';

function clicked() {
    if (visible) {
        Main.uiGroup.remove_actor(msg);
        msg = null;
        fortune = null;
        visible = false;
    } else {
        error = "";
        fortune = "";
        try {
            let [res, stdout, stderr, status] = 
                GLib.spawn_command_line_sync('fortune');
            fortune = String(stdout).trim()
            if (!fortune)
                error = String(stderr).trim();
        } catch (e) {
            error = e.message
        }
        if (fortune) {
            text = got_humour && _(
                "Wanda the Oracle says:\n\n%s").format(fortune)
                || fortune;
        } else {
            text = got_humour && _(
                "Sorry, no wisdom for you today:\n\n%s").format(error)
                || error;
        }
        msg = new St.Label({style_class: got_humour && 'fortune-label'
                                                    || 'fortune-label-black',
                            text: text});
        Main.uiGroup.add_actor(msg);
        msg.clutter_text.line_wrap = true;
        let monitor = Main.layoutManager.primaryMonitor;
        msg.set_position(
            Math.floor(monitor.width / 2 - msg.width / 2),
            Math.floor(monitor.height / 2 - msg.height / 2));
        visible = true;
    }    
}

function init() {
    Convenience.initTranslations('wanda-the-fish');
    settings = Convenience.getSettings();
    got_humour = settings.get_boolean(GOT_HUMOUR_KEY);
    visible = false;
    button = new St.Bin({style_class: 'panel-button',
                         reactive: true,
                         can_focus: true,
                         x_fill: true,
                         y_fill: false,
                         track_hover: true});
    let gicon = Gio.icon_new_for_string(Me.path + (got_humour
                                        && "/icons/wanda3.svg"
                                        || "/icons/wanda-bw.svg"));
    let icon = new St.Icon({
        // icon_type: St.IconType.SYMBOLIC,
                            icon_size: 16,
                            gicon: gicon});
    button.set_child(icon);
    button.connect('button-press-event', clicked);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
	if (visible) {
        Main.uiGroup.remove_actor(msg);
        msg = null;
        fortune = null;
        visible = false;
    }
    Main.panel._rightBox.remove_child(button);
}
