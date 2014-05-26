const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Main = imports.ui.main;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let fortune_msg, button, fortune, visible;

function clicked() {
    if (visible) {
        Main.uiGroup.remove_actor(fortune_msg);
        fortune_msg = null;
        fortune = null;
        visible = false;
    } else {
        try {
            let [res, stdout, stderr, status] = 
                GLib.spawn_command_line_sync('fortune');
            fortune = String(stdout).trim() || String(stderr).trim();
        } catch (e) {
            fortune = e.message;
        }
        fortune_msg = new St.Label({style_class: 'fortune-label',
                                    text: fortune});
        Main.uiGroup.add_actor(fortune_msg);
        fortune_msg.clutter_text.line_wrap = true;
        let monitor = Main.layoutManager.primaryMonitor;
        fortune_msg.set_position(
            Math.floor(monitor.width / 2 - fortune_msg.width / 2),
            Math.floor(monitor.height / 2 - fortune_msg.height / 2));
        visible = true;
    }    
}

function init() {
    visible = false;
    button = new St.Bin({style_class: 'panel-button',
                         reactive: true,
                         can_focus: true,
                         x_fill: true,
                         y_fill: false,
                         track_hover: true});
    let gicon = Gio.icon_new_for_string(Me.path + "/icons/wanda3.svg");
    let icon = new St.Icon({gicon: gicon});
    button.set_child(icon);
    button.connect('button-press-event', clicked);
}

function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}

function disable() {
    Main.panel._rightBox.remove_child(button);
}
