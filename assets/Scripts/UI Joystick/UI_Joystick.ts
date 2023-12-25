import { _decorator, Component, director, EventTouch, Input, Node, UITransform, Touch, Vec2, Vec3 } from 'cc';
import { Cinemachine } from '../Cinemachine/Cinemachine';
const { ccclass, property } = _decorator;

enum EventType {
    /**
     * Dispatched when Joystick move
     * @param direction-Vec2: direction in vector 2
     */
    JOYSTICK_MOVE = "Joystick.JOYSTICK_MOVE",

    /**
     * Dispatched when Joystick stop moving
     */
    JOYSTICK_STOP = "Joystick.JOYSTICK_STOP"
}

@ccclass('UI_Joystick')
export class UI_Joystick extends Component {
    public static EventType = EventType;

    private _ctrlRoot: UITransform = null;
    private _ctrlPointer: Node = null;
    private _checkerCamera: Node = null;

    private _movementTouch: Touch = null;

    start() {
        this._checkerCamera = this.node.getChildByName('Checker Camera');
        this._checkerCamera.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove_CameraCtrl, this);

        let checkerMovement = this.node.getChildByName('Checker Movement');
        checkerMovement.on(Input.EventType.TOUCH_START, this.OnTouchStart_Movement, this);
        checkerMovement.on(Input.EventType.TOUCH_MOVE, this.OnTouchMove_Movement, this);
        checkerMovement.on(Input.EventType.TOUCH_END, this.OnTouchUp_Movement, this);
        checkerMovement.on(Input.EventType.TOUCH_CANCEL, this.OnTouchUp_Movement, this);

        this._ctrlRoot = this.node.getChildByName('Control').getComponent(UITransform);
        this._ctrlRoot.node.active = false;
        this._ctrlPointer = this._ctrlRoot.node.getChildByName('pointer');
    }

    // #region Rotate Camera
    private OnTouchMove_CameraCtrl(event: EventTouch) {
        //only one touch, do camera rotate.

        let dt = event.getDelta();
        let rx = dt.y;
        let ry = -dt.x;

        director.getScene().emit(Cinemachine.EventType.CAMERA_ROTATE, rx, ry);
    }
    // #endregion

    // #region Movement
    private OnTouchStart_Movement(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            let x = touch.getUILocationX();
            let y = touch.getUILocationY();
            if (!this._movementTouch) {
                //we sub halfWidth,halfHeight here.
                //because, the touch event use left bottom as zero point(0,0), ui node use the center of screen as zero point(0,0)
                //this._ctrlRoot.setPosition(x - halfWidth, y - halfHeight, 0);

                var checkerCameraUIComp = this._checkerCamera.getComponent(UITransform);
                var halfWidth = checkerCameraUIComp.width / 2;
                var halfHeight = checkerCameraUIComp.height / 2;

                this._ctrlRoot.node.active = true;
                this._ctrlRoot.node.setPosition(x - halfWidth, y - halfHeight, 0);
                this._ctrlPointer.setPosition(0, 0, 0);
                this._movementTouch = touch;
            }
        }
    }

    private OnTouchMove_Movement(event: EventTouch) {
        let touches = event.getTouches();
        for (let i = 0; i < touches.length; ++i) {
            let touch = touches[i];
            if (this._movementTouch && touch.getID() == this._movementTouch.getID()) {
                var checkerCameraUIComp = this._checkerCamera.getComponent(UITransform);
                var halfWidth = checkerCameraUIComp.width / 2;
                var halfHeight = checkerCameraUIComp.height / 2;

                var posTouch = new Vec3();
                posTouch.set(touch.getUILocationX(), touch.getUILocationY());
                posTouch.subtract3f(halfWidth, halfHeight, 0);

                let len = Vec3.distance(posTouch, this._ctrlRoot.node.position);
                if (len <= 0) {
                    return;
                }

                //limit the position pointer
                var radius = this._ctrlRoot.width / 2;
                var direction = Vec3.subtract(new Vec3(), posTouch, this._ctrlRoot.node.position).normalize();
                if (len > radius) {
                    Vec3.multiplyScalar(posTouch, direction, radius);
                    Vec3.add(posTouch, this._ctrlRoot.node.position, posTouch);

                }
                //set the pointer position
                checkerCameraUIComp.convertToWorldSpaceAR(posTouch, posTouch);
                this._ctrlPointer.setWorldPosition(posTouch);

                // degree 0 ~ 360 based on y axis.
                // let degree = Math.atan(direction.x / direction.y) / Math.PI * 180;
                // if (direction.x < 0) {
                //     degree += 180;
                // }
                // else {
                //     degree += 360;
                // }

                director.getScene().emit(UI_Joystick.EventType.JOYSTICK_MOVE, direction);
                // director.getScene().emit(UI_Joystick.EventType.JOYSTICK_MOVE, degree);
            }
        }
    }

    private OnTouchUp_Movement() {
        this._ctrlRoot.node.active = false;
        this._movementTouch = null;

        director.getScene().emit(UI_Joystick.EventType.JOYSTICK_STOP);
    };
    // #endregion

    protected onDestroy(): void {
        this._checkerCamera.off(Input.EventType.TOUCH_MOVE, this.OnTouchMove_CameraCtrl, this);

        let checkerMovement = this.node.getChildByName('Checker Movement');
        checkerMovement.off(Input.EventType.TOUCH_START, this.OnTouchStart_Movement, this);
        checkerMovement.off(Input.EventType.TOUCH_MOVE, this.OnTouchMove_Movement, this);
        checkerMovement.off(Input.EventType.TOUCH_END, this.OnTouchUp_Movement, this);
        checkerMovement.off(Input.EventType.TOUCH_CANCEL, this.OnTouchUp_Movement, this);
    }
}


