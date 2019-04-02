const St = imports.gi.St;
const Gio = imports.gi.Gio;
const Main = imports.ui.main;
const Slider = imports.ui.slider;
const PopupMenu = imports.ui.popupMenu;

const MOUSE_SCHEMA = 'org.gnome.desktop.peripherals.mouse';
const TOUCHPAD_SCHEMA = 'org.gnome.desktop.peripherals.touchpad';
const MENU_INDEX = 2;

class SpeedSlider extends Slider.Slider {
    constructor(schema) {
        super(0);
        this._schema = schema;
        this._value = (this._schema.get_double('speed') + 1) / 2;
        this.connect('value-changed', this._sliderChanged);
    }

    _sliderChanged(slider, value) {
        const speed = value * 2 - 1;
        slider._schema.set_double('speed', speed);
    }
}

class SpeedSliderMenuItem extends PopupMenu.PopupBaseMenuItem {
    constructor(slider, icon) {
        super();
        this.actor.add(icon);
        this.actor.add(slider.actor, {
            expand: true
        });
        this.actor.connect('button-press-event', (actor, event) =>
            slider.startDragging(event)
        );
        this.actor.connect('key-press-event', (actor, event) =>
            slider.onKeyPressEvent(actor, event)
        );
    }
}

function init() {}

function enable() {
    let mouseMenuItem = new SpeedSliderMenuItem(
        new SpeedSlider(
            new Gio.Settings({
                schema: MOUSE_SCHEMA
            })
        ),
        new St.Icon({
            icon_name: 'input-mouse-symbolic',
            style_class: 'popup-menu-icon'
        })
    );

    let touchpadMenuItem = new SpeedSliderMenuItem(
        new SpeedSlider(
            new Gio.Settings({
                schema: TOUCHPAD_SCHEMA
            })
        ),
        new St.Icon({
            icon_name: 'input-touchpad-symbolic',
            style_class: 'popup-menu-icon'
        })
    );

    let speedSliderMenu = new PopupMenu.PopupMenuSection();
    speedSliderMenu.addMenuItem(mouseMenuItem);
    speedSliderMenu.addMenuItem(touchpadMenuItem);

    Main.panel.statusArea.aggregateMenu.menu.addMenuItem(speedSliderMenu, MENU_INDEX);
}

function disable() {
    Main.panel.statusArea.aggregateMenu.menu._getMenuItems()[MENU_INDEX].destroy();
}