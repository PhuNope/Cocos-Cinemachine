import { __private, _decorator, Camera, CCBoolean, CCFloat, CCInteger, CCString, Component, director, EventTouch, game, Input, input, math, Node, Quat, toDegree, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

enum EventType {
    /**
    * Dispatched when camera rotating
    * @params rx: horizontal rotation
    * @params ry: vertical rotation.
    */
    CAMERA_ROTATE = 'Cinemachine.CAMERA_ROTATE',

    /**
     * Dispatched when camera zooming
     * @params delta: amount of camera zoom
    */
    CAMERA_ZOOM = 'Cinemachine.CAMERA_ZOOM',

    /**
     * Dispatched when one of the buttons is pressed.
     * @param buttonName: string, indicates which button is pressed. 
     */
    BUTTON = 'Cinemachine.BUTTON'
}

@ccclass('Cinemachine')
export class Cinemachine extends Component {
    public static EventType = EventType;

    public static on(type: string, callback: Function, target?: any) {
        director.getScene().on(type, callback, target);
    }

    public static off(type: string, callback?: Function, target?: any) {
        director.getScene()?.off(type, callback, target);
    }
}


