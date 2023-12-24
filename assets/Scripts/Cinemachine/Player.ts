import { _decorator, Component, director, EventTouch, Node, NodeSpace, Quat, Vec3, Camera, math } from 'cc';
import { UI_Joystick } from '../UI Joystick/UI_Joystick';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({
        type: Node
    })
    public cameraNode: Node = null;

    private movementDirection: Vec3 = null;

    private quatTurn: Quat = new Quat();

    protected onLoad(): void {
        director.getScene().on(UI_Joystick.EventType.JOYSTICK_MOVE, this.OnTouchMove_Movement, this);
        director.getScene().on(UI_Joystick.EventType.JOYSTICK_STOP, this.OnTouchUp_Movement, this);
    }

    start() {
    }

    private OnTouchMove_Movement(direction: Vec3) {
        this.movementDirection = direction;
    }

    private Moving() {
        if (!this.movementDirection) return;

        // turn player
        this.node.forward = this.movementDirection;

        // this.node.translate(this.node.forward.multiplyScalar(0.1), NodeSpace.WORLD);
    }

    private OnTouchUp_Movement() {
        this.movementDirection = null;
    }

    protected update(dt: number): void {
        this.Moving();
    }

    protected onDestroy(): void {
        director.getScene().off(UI_Joystick.EventType.JOYSTICK_MOVE, this.OnTouchMove_Movement, this);
        director.getScene().off(UI_Joystick.EventType.JOYSTICK_STOP, this.OnTouchUp_Movement, this);
    }
}


