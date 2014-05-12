const St = imports.gi.St;
const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const MessageTray = imports.ui.messageTray;
const Tweener = imports.ui.tweener;
const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;


let start_time, button, start_time_string, settings;


function _refresh() {
    // Get difference between start time and current time
    // and show it
    var current_time = new Date();
    // Get difference between two times in secs
    var difference = Math.round((current_time - start_time)/1000);
    var hours = parseInt(difference/3600);
    if (hours !== 0) {
        difference = difference - hours * 3600;
    }
    var mins = parseInt(difference/60);
    if (mins !== 0) {
        difference = difference - mins * 60;
    }
    var secs = difference;
    // Prepare timer info
    if (settings.get_boolean('show-seconds') === true) {
        timer = hours.toString() + ':' + _to_string(mins) + ':' + _to_string(secs);
    } else {
        timer = hours.toString() + ':' + _to_string(mins);
    }
    button.set_label(timer);
    Mainloop.timeout_add(1000, function () { _refresh(); })
}


function _restart() {
    // Restart timer. Set new value for start_time
    let source = new MessageTray.SystemNotificationSource();
    Main.messageTray.add(source);
    var message_title = 'Current start time: ' + start_time.toString();
    var message_body = 'Confirm to restart timer';
    let notification = new MessageTray.Notification(source, message_body, message_title);
    notification.addButton('restart', 'Restart');
    notification.connect('action-invoked', function() {
        start_time = new Date();
        settings.set_string('start-time', start_time.toString());
    });
    notification.setTransient(true);
    source.notify(notification);
}


function _to_string(time) {
    // Add extra zero if there is only one digit
    time_string = time.toString();
    if (time_string.length === 1) {
        time_string = '0' + time_string;
    }
    return time_string
}


function init() {
    button = new St.Button();
    settings = Convenience.getSettings();
    // Get start_time from settings
    start_time_string = settings.get_string('start-time');
    start_time = new Date(start_time_string);
    // If creation of Date object failed, create a new one
    if (isNaN(start_time.getHours())) {
        start_time = new Date();
        settings.set_string('start-time', start_time.toString());
    }
    button.set_label('Time Tracker');
    Mainloop.timeout_add(1000, function () { _refresh(); })
    button.connect('button-press-event', _restart)
}


function enable() {
    Main.panel._rightBox.insert_child_at_index(button, 0);
}


function disable() {
    Main.panel._rightBox.remove_child(button);
}
