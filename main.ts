/*
File:       github.com/ETmbit/etgamepad.ts
Version:	2026-1
Copyright:  ElecTricks, 2026
License:    GNU GPL 3 or later
Disclaimer: Distributed without any warranty
Depends on: None
*/

//////////////////
//  INCLUDE     //
//  etradio.ts  //
//////////////////

// the micro:bit radio buffer size is 19 bytes only
// therefore, messages are sent in chunks
// the chunk format is: id|ix|chunk
// the final chunk has ix=-1 and chunk=ack_id
// a receiver 

//##### GROUP HANDLING #####\\

const ET_EVENT = 200 + Math.randomRange(0, 100) // semi-unique id

let ETgroup = 1
let ETgroupTimer = 0
let ETgroupSet = false
let ETgroupHandlers: ((group: number) => void)[] = []

function etHandleGroup() {
    basic.showNumber(ETgroup)
    if (ETgroupHandlers.length) {
        for (let ix = 0; ix < ETgroupHandlers.length; ix++)
            ETgroupHandlers[ix](ETgroup)
    }
    else
        basic.showIcon(IconNames.Yes)
}

control.onEvent(ET_EVENT, 0, function () {
    while (ETgroupTimer > control.millis()) { basic.pause(1) }
    etHandleGroup()
    ETgroupTimer = 0
    ETgroupSet = false
})

input.onLogoEvent(TouchButtonEvent.Pressed, function () {
    if (ETgroupSet) {
        ETgroup++
        if (ETgroup > 9) ETgroup = 1
        radio.setGroup(ETgroup)
    }
    else
        ETgroupSet = true
    basic.showNumber(ETgroup)
    if (!ETgroupTimer) {
        ETgroupTimer = control.millis() + 1000
        control.raiseEvent(ET_EVENT, 0)
    }
    else
        ETgroupTimer = control.millis() + 1000
})

//##### DATA HANDLING #####\\

const ET_EOM = -1
const ET_ACK = -2

interface ETradioMessages {
    sent: string[]  // id's of sent messages that have no ACK yet
    received: string[]	// received messages that have not been read yet
    chunks: string[]	// temporary buffer for received chunks
    handler: (message: string) => void // will be called when a radio message is received
}

let ETradioMsg: { [id: string]: ETradioMessages } = {}

radio.onReceivedString(function (chunk: string) {

    let parts = chunk.split("|")
    if (parts.length != 3) return
    let id = parts[0]
    let ix = +parts[1]
    let msg = parts[2]

    // create a buffer for id if not existing
    etradio.createBuffer(id)

    // EOM handling (receiver side)
    // (1) send ACK
    // (2) store message or call handler
    // see: etradio.send()
    if (ix === ET_EOM) {
        // (1) msg contains msg id
        msg = id + "|" + ET_ACK.toString() + "|" + msg
        radio.sendString(msg)
        // (2)
        msg = ETradioMsg[id].chunks.join("")
        if (ETradioMsg[id].handler)
            ETradioMsg[id].handler(msg)
        else
            ETradioMsg[id].received.push(msg)
        ETradioMsg[id].chunks = []
        return
    }

    // ACK handling (sender side)
    // (1) clear the ACK flag when acknowledged
    // see: etradio.send()
    if (ix === ET_ACK) {
        if (ETradioMsg[id] && ((ix = ETradioMsg[id].sent.indexOf(msg)) >= 0))
            // (1)
            ETradioMsg[id].sent.splice(ix, 1)
        return
    }

    // CHUNK handling (receiver side)
    ETradioMsg[id].chunks[ix] = msg
})

namespace etradio {

    export function createBuffer(id: string) {
        if (!ETradioMsg[id])
            ETradioMsg[id] = { sent: [], received: [], chunks: [], handler: null }
    }

    export function clearBuffer(id: string) {
        if (ETradioMsg[id])
            delete ETradioMsg[id]
    }

    export function send(id: string, msg: string, timeout: number = 0) {
        // messages are broadcasted

        let len = Math.max(1, 15 - id.length)
        let ix = 0
        let chunk = ""
        let ack_id = control.millis().toString() + Math.randomRange(0, 999).toString()
        ack_id = ack_id.substr(0, len)

        // create a buffer for id if not existing
        createBuffer(id)

        // send message in chunks
        while (msg.length > 0) {
            chunk = id + "|" + ix.toString() + "|" + msg.substr(0, len)
            msg = msg.substr(len)
            radio.sendString(chunk)
            basic.pause(1)
            ix += 1
        }

        // (1) raise ACK flag
        // (2) sent ack_id so that receiver can ACK
        // (3) wait for ACK flag being cleared by radio.onReceivedString
        // (4) clear ACK flag in case of timeout
        // Not fully fail save, but best in terms of successfull transmission
        // Timeout is the savety net
        // After timeout clear the ACK flag anyway

        // (1)
        ETradioMsg[id].sent.push(ack_id)

        // (2)
        chunk = id + "|" + ET_EOM.toString() + "|" + ack_id
        radio.sendString(chunk)

        // (3)
        let tm = control.millis() + timeout
        while (control.millis() < tm && ETradioMsg[id].sent.indexOf(ack_id) >= 0)
            basic.pause(1)

        // (4)
        if ((ix = ETradioMsg[id].sent.indexOf(ack_id)) >= 0)
            ETradioMsg[id].sent.splice(ix, 1)
    }

    export function available(id: string): boolean {
        return !!(ETradioMsg[id] && (ETradioMsg[id].received.length > 0))
    }

    export function read(id: string): string {
        if (!ETradioMsg[id] || !ETradioMsg[id].received.length)
            return ""
        let msg = ETradioMsg[id].received.shift()
        return msg
    }

    export function registerMessageHandler(id: string, handler: (msg: string) => void) {
        createBuffer(id)
        ETradioMsg[id].handler = handler
    }

    export function registerGroupHandler(handler: (group: number) => void) {
        ETgroupHandlers.push(handler)
    }
}

///////////////////
//  END INCLUDE  //
///////////////////

///////////////////////
//  INCLUDE          //
//  gampad-enums.ts  //
///////////////////////

const ET_GAMEPADID = "GP"

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

/////////////////
//  INCLUDE    //
//  gampad.ts  //
/////////////////

enum JoystickMode {
    //% block="the power also"
    //% block.loc.nl="ook de kracht"
    Power,
    //% block="direction solely"
    //% block.loc.nl="alleen de richting"
    Direction,
}

type handler = () => void

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

let ETgpBusy = false
function ETgamepadRadio(msg: string) {
    while (ETgpBusy) basic.pause(1)
    ETgpBusy = true
    serial.writeLine(msg)
    let val = +msg
    if (val >= 1000)
        Gamepad.handleJoystick(val - 1000)
    else {
        if (val >= 4) //four buttons
            Gamepad.handleReleased(val - 4)
        else
            Gamepad.handlePressed(val)
    }
    ETgpBusy = false
}
etradio.registerMessageHandler(ET_GAMEPADID, ETgamepadRadio)

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

    //% color="#802080"
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

    //% color="#802080"
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

    //% color="#802080"
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

/////////////////
// END INCLUDE //
/////////////////
