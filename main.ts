/*
File:      github.com/ETmbit/gamepad.ts
Copyright: ETmbit, 2026

License:
This file is part of the ETmbit extensions for MakeCode for micro:bit.
It is free software and you may distribute it under the terms of the
GNU General Public License (version 3 or later) as published by the
Free Software Foundation. The full license text you find at
https://www.gnu.org/licenses.

Disclaimer:
ETmbit extensions are distributed without any warranty.

Dependencies:
ETmbit/general
*/

///////////////////////
//  INCLUDE          //
//  gampad-enums.ts  //
///////////////////////

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

/////////////////
// END INCLUDE //
/////////////////

enum JoystickMode {
    //% block="the power also"
    //% block.loc.nl="ook de kracht"
    Power,
    //% block="direction solely"
    //% block.loc.nl="alleen de richting"
    Direction,
}

// joystick handlers
let ETjsXHandler: handler
let ETjsNHandler: handler
let ETjsNEHandler: handler
let ETjsEHandler: handler
let ETjsSEHandler: handler
let ETjsSHandler: handler
let ETjsSWHandler: handler
let ETjsWHandler: handler
let ETjsNWHandler: handler

// button press handlers
let ETbpUpHandler: handler
let ETbpDownHandler: handler
let ETbpLeftHandler: handler
let ETbpRightHandler: handler

// button release handlers
let ETbrUpHandler: handler
let ETbrDownHandler: handler
let ETbrLeftHandler: handler
let ETbrRightHandler: handler


function ETgamepadRadio(msg: string) {
    let val = +msg
    if (ETwaveDelay != 0) basic.pause(ETwaveDelay)
    if (val >= 1000)
        Gamepad.handleJoystick(val - 1000)
    else {
        if (val >= 4) //four buttons
            Gamepad.handleReleased(val - 4)
        else
            Gamepad.handlePressed(val)
    }
}
General.registerMessageHandler("GP", ETgamepadRadio)

//% color="#C4C80E" icon="\uf11b"
//% block="Gamepad"
//% block.loc.nl="Gamepad"
namespace Gamepad {

    let JSMODE = JoystickMode.Power
    let JSANGLE = Joystick.None
    let JSPOWER = 0

    let PRESSEDUP = false
    let PRESSEDDOWN = false
    let PRESSEDLEFT = false
    let PRESSEDRIGHT = false

    export function handleJoystick(value: number) {

        JSPOWER = Math.floor(value / 1000)
        let angle = value - JSPOWER * 1000
        if (JSMODE == JoystickMode.Direction && angle == JSANGLE)
            return
        JSANGLE = angle
        if ((JSANGLE == Joystick.None) && ETjsXHandler)
            ETjsXHandler()
        if ((JSANGLE == Joystick.Up) && ETjsNHandler)
            ETjsNHandler()
        if ((JSANGLE == Joystick.UpRight) && ETjsNEHandler)
            ETjsNEHandler()
        if ((JSANGLE == Joystick.Right) && ETjsEHandler)
            ETjsEHandler()
        if ((JSANGLE == Joystick.DownRight) && ETjsSEHandler)
            ETjsSEHandler()
        if ((JSANGLE == Joystick.Down) && ETjsSHandler)
            ETjsSHandler()
        if ((JSANGLE == Joystick.DownLeft) && ETjsSWHandler)
            ETjsSWHandler()
        if ((JSANGLE == Joystick.Left) && ETjsWHandler)
            ETjsWHandler()
        if ((JSANGLE == Joystick.UpLeft) && ETjsNWHandler)
            ETjsNWHandler()
    }

    export function handlePressed(button: Key) {
        switch (button) {
            case Key.Up: PRESSEDUP = true; if (ETbpUpHandler) ETbpUpHandler(); break;
            case Key.Down: PRESSEDDOWN = true; if (ETbpDownHandler) ETbpDownHandler(); break;
            case Key.Left: PRESSEDLEFT = true; if (ETbpLeftHandler) ETbpLeftHandler(); break;
            case Key.Right: PRESSEDRIGHT = true; if (ETbpRightHandler) ETbpRightHandler(); break;
        }
    }

    export function handleReleased(button: Key) {
        switch (button) {
            case Key.Up: PRESSEDUP = false; if (ETbrUpHandler) ETbrUpHandler(); break;
            case Key.Down: PRESSEDDOWN = false; if (ETbrDownHandler) ETbrDownHandler(); break;
            case Key.Left: PRESSEDLEFT = false; if (ETbrLeftHandler) ETbrLeftHandler(); break;
            case Key.Right: PRESSEDRIGHT = false; if (ETbrRightHandler) ETbrRightHandler(); break;
        }
    }

    //% color="#FFC000"
    //% block="when button %button is ETbr"
    //% block.loc.nl="wanneer knop %button wordt losgelaten"
    export function onReleased(button: Key, code: () => void): void {
        switch (button) {
            case Key.Up: ETbrUpHandler = code; break;
            case Key.Down: ETbrDownHandler = code; break;
            case Key.Left: ETbrLeftHandler = code; break;
            case Key.Right: ETbrRightHandler = code; break;
        }
    }

    //% color="#FFC000"
    //% block="when button %button is ETbp"
    //% block.loc.nl="wanneer knop %button wordt ingedrukt"
    export function onPressed(button: Key, code: () => void): void {
        switch (button) {
            case Key.Up: ETbpUpHandler = code; break;
            case Key.Down: ETbpDownHandler = code; break;
            case Key.Left: ETbpLeftHandler = code; break;
            case Key.Right: ETbpRightHandler = code; break;
        }
    }

    //% color="#FFC000"
    //% block="when the joystick direction is %dir"
    //% block.loc.nl="wanneer de joystick richting %dir is"
    export function onJoystick(dir: Joystick, code: () => void): void {
        switch (dir) {
            case Joystick.None: ETjsXHandler = code; break;
            case Joystick.Up: ETjsNHandler = code; break;
            case Joystick.UpRight: ETjsNEHandler = code; break;
            case Joystick.Right: ETjsEHandler = code; break;
            case Joystick.DownRight: ETjsSEHandler = code; break;
            case Joystick.Down: ETjsSHandler = code; break;
            case Joystick.DownLeft: ETjsSWHandler = code; break;
            case Joystick.Left: ETjsWHandler = code; break;
            case Joystick.UpLeft: ETjsNWHandler = code; break;
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

    //% block="joystick direction"
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
