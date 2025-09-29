///////////////////////////
//#######################//
//##                   ##//
//##  gampad-enums.ts  ##//
//##                   ##//
//#######################//
///////////////////////////

enum Joystick {
    //% block="none"
    //% block.loc.nl="geen"
    None,
    //% block="up"
    //% block.loc.nl="omhoog"
    Up,
    //% block="right up"
    //% block.loc.nl="rechts omhoog"
    UpRight,
    //% block="right"
    //% block.loc.nl="rechts"
    Right,
    //% block="right down"
    //% block.loc.nl="rechts omlaag"
    DownRight,
    //% block="down"
    //% block.loc.nl="omlaag"
    Down,
    //% block="left down"
    //% block.loc.nl="links omlaag"
    DownLeft,
    //% block="left"
    //% block.loc.nl="links"
    Left,
    //% block="left up"
    //% block.loc.nl="links omhoog"
    UpLeft,
}

enum Power {
    //% block="without power"
    //% block.loc.nl="zonder kracht"
    None,
    //% block="Low power"
    //% block.loc.nl="weinig kracht"
    Low,
    //% block="Half power"
    //% block.loc.nl="halve kracht"
    Half,
    //% block="Full power"
    //% block.loc.nl="volle kracht"
    Full,
}

enum Key {
    //% block="up"
    //% block.loc.nl="omhoog"
    Up, //P12
    //% block="down"
    //% block.loc.nl="omlaag"
    Down, //P15 
    //% block="left"
    //% block.loc.nl="links"
    Left, //P13
    //% block="right"
    //% block.loc.nl="rechts"
    Right, //P14
}


//////////////////////
//##################//
//##              ##//
//##  gamepad.ts  ##//
//##              ##//
//##################//
//////////////////////

enum JoystickMode {
    //% block="the power also"
    //% block.loc.nl="ook de kracht"
    Power,
    //% block="direction solely"
    //% block.loc.nl="alleen de richting"
    Direction,
}

let joystickXHandler: handler
let joystickNHandler: handler
let joystickNEHandler: handler
let joystickEHandler: handler
let joystickSEHandler: handler
let joystickSHandler: handler
let joystickSWHandler: handler
let joystickWHandler: handler
let joystickNWHandler: handler

let pressedUpHandler: handler
let pressedDownHandler: handler
let pressedLeftHandler: handler
let pressedRightHandler: handler

let releasedUpHandler: handler
let releasedDownHandler: handler
let releasedLeftHandler: handler
let releasedRightHandler: handler

//% color="#C4C80E" icon="\uf11b"
//% block="Gamepad"
//% block.loc.nl="Gamepad"
namespace Gamepad {

    let JSMODE = JoystickMode.Power
    let JSANGLE = Joystick.None
    let JSPOWER = 0

    let BUTTONMAX = 4

    let PRESSEDUP = false
    let PRESSEDDOWN = false
    let PRESSEDLEFT = false
    let PRESSEDRIGHT = false

    function handleJoystick(value: number) {

        JSPOWER = Math.floor(value / 1000)
        let angle = value - JSPOWER * 1000
        if (JSMODE == JoystickMode.Direction && angle == JSANGLE)
            return
        JSANGLE = angle
        if ((JSANGLE == Joystick.None) && joystickXHandler)
            joystickXHandler()
        if ((JSANGLE == Joystick.Up) && joystickNHandler)
            joystickNHandler()
        if ((JSANGLE == Joystick.UpRight) && joystickNEHandler)
            joystickNEHandler()
        if ((JSANGLE == Joystick.Right) && joystickEHandler)
            joystickEHandler()
        if ((JSANGLE == Joystick.DownRight) && joystickSEHandler)
            joystickSEHandler()
        if ((JSANGLE == Joystick.Down) && joystickSHandler)
            joystickSHandler()
        if ((JSANGLE == Joystick.DownLeft) && joystickSWHandler)
            joystickSWHandler()
        if ((JSANGLE == Joystick.Left) && joystickWHandler)
            joystickWHandler()
        if ((JSANGLE == Joystick.UpLeft) && joystickNWHandler)
            joystickNWHandler()
    }

    function handlePressed(button: Key) {
        switch (button) {
            case Key.Up: PRESSEDUP = true; if (pressedUpHandler) pressedUpHandler(); break;
            case Key.Down: PRESSEDDOWN = true; if (pressedDownHandler) pressedDownHandler(); break;
            case Key.Left: PRESSEDLEFT = true; if (pressedLeftHandler) pressedLeftHandler(); break;
            case Key.Right: PRESSEDRIGHT = true; if (pressedRightHandler) pressedRightHandler(); break;
        }
    }

    function handleReleased(button: Key) {
        switch (button) {
            case Key.Up: PRESSEDUP = false; if (releasedUpHandler) releasedUpHandler(); break;
            case Key.Down: PRESSEDDOWN = false; if (releasedDownHandler) releasedDownHandler(); break;
            case Key.Left: PRESSEDLEFT = false; if (releasedLeftHandler) releasedLeftHandler(); break;
            case Key.Right: PRESSEDRIGHT = false; if (releasedRightHandler) releasedRightHandler(); break;
        }
    }

    messageHandler = (value: number) => {
        if (value >= 1000)
            handleJoystick(value - 1000)
        else {
            if (value >= BUTTONMAX)
                handleReleased(value - BUTTONMAX)
            else
                handlePressed(value)
        }
    }

    //% color="#FFC000"
    //% block="when button %button is released"
    //% block.loc.nl="wanneer knop %button wordt losgelaten"
    export function onReleased(button: Key, code: () => void): void {
        switch (button) {
            case Key.Up: releasedUpHandler = code; break;
            case Key.Down: releasedDownHandler = code; break;
            case Key.Left: releasedLeftHandler = code; break;
            case Key.Right: releasedRightHandler = code; break;
        }
    }

    //% color="#FFC000"
    //% block="when button %button is pressed"
    //% block.loc.nl="wanneer knop %button wordt ingedrukt"
    export function onPressed(button: Key, code: () => void): void {
        switch (button) {
            case Key.Up: pressedUpHandler = code; break;
            case Key.Down: pressedDownHandler = code; break;
            case Key.Left: pressedLeftHandler = code; break;
            case Key.Right: pressedRightHandler = code; break;
        }
    }

    //% color="#FFC000"
    //% block="when the joystick direction is %dir"
    //% block.loc.nl="wanneer de joystick richting %dir is"
    export function onJoystick(dir: Joystick, code: () => void): void {
        switch (dir) {
            case Joystick.None: joystickXHandler = code; break;
            case Joystick.Up: joystickNHandler = code; break;
            case Joystick.UpRight: joystickNEHandler = code; break;
            case Joystick.Right: joystickEHandler = code; break;
            case Joystick.DownRight: joystickSEHandler = code; break;
            case Joystick.Down: joystickSHandler = code; break;
            case Joystick.DownLeft: joystickSWHandler = code; break;
            case Joystick.Left: joystickWHandler = code; break;
            case Joystick.UpLeft: joystickNWHandler = code; break;
        }
    }

    //% block="%button is up"
    //% block.loc.nl="%button is losgelaten"
    export function isReleased(button: Key): boolean {
        switch (button) {
            case Key.Up: return !PRESSEDUP;
            case Key.Down: return !PRESSEDDOWN;
            case Key.Left: return !PRESSEDLEFT;
            case Key.Right: return !PRESSEDRIGHT;
        }
        return false;
    }

    //% block="%button is down"
    //% block.loc.nl="%button is ingedrukt"
    export function isPressed(button: Key): boolean {
        switch (button) {
            case Key.Up: return PRESSEDUP;
            case Key.Down: return PRESSEDDOWN;
            case Key.Left: return PRESSEDLEFT;
            case Key.Right: return PRESSEDRIGHT;
        }
        return false;
    }

    //% block="joystick-power"
    //% block.loc.nl="joystick-kracht"
    export function readPower(): Power {
        return JSPOWER
    }

    //% block="joystick Joystick"
    //% block.loc.nl="joystick-richting"
    export function readJoystick(): Joystick {
        return JSANGLE
    }

    //% block="%power"
    //% block.loc.nl="%power"
    export function defPower(power: Power): Power {
        return power
    }

    //% block="%joystick"
    //% block.loc.nl="%joystick"
    export function defJoystick(joystick: Joystick): Joystick {
        return joystick
    }

    //% block="the joystick measures %mode"
    //% block.loc.nl="de joystick meet %mode"
    export function setMode(mode: JoystickMode) {
        JSMODE = mode
    }
}
