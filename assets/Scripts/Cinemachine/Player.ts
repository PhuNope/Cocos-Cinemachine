import { _decorator, Component, director, EventTouch, Node, NodeSpace, Quat, Vec3, Camera, math, v3, Vec2, RigidBody } from 'cc';
import { UI_Joystick } from '../UI Joystick/UI_Joystick';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property({
        type: Node
    })
    public cameraNode: Node = null;

    @property({
        min: 0
    })
    public speed: number = 1;

    private rigidBody: RigidBody;

    private movementDirection: Vec3 = null;

    private _tmp = v3();
    private _tmp2 = v3();

    protected onLoad(): void {
        director.getScene().on(UI_Joystick.EventType.JOYSTICK_MOVE, this.OnTouchMove_Movement, this);
        director.getScene().on(UI_Joystick.EventType.JOYSTICK_STOP, this.OnTouchUp_Movement, this);
    }

    start() {
        this.rigidBody = this.node.getComponent(RigidBody);
    }

    private OnTouchMove_Movement(direction: Vec2) {
        this.movementDirection = new Vec3(direction.x, direction.y, 0);
    }

    private Moving() {
        if (!this.movementDirection) return;

        // turn player
        this.RotatePlayer();

        // move player
        this._tmp.set(this.node.forward);
        this._tmp.multiplyScalar(-1.0);
        this._tmp.multiplyScalar(this.speed);

        this.rigidBody.getLinearVelocity(this._tmp2);
        this._tmp.y = this._tmp2.y;
        this.rigidBody.setLinearVelocity(this._tmp);
        // this.node.translate(this.node.forward.clone().multiplyScalar(-0.1), NodeSpace.WORLD);
    }

    private RotatePlayer() {
        var degree = Vec3.angle(Vec3.UP, this.movementDirection);
        degree = math.toDegree(degree);

        Vec3.cross(this._tmp, Vec3.UP, this.movementDirection);

        // direction in right
        if (this._tmp.z < 0) {
            degree = -Math.abs(degree);
        }
        // direction in left
        else {
            degree = Math.abs(degree);
        }

        this._tmp.set(this.cameraNode.eulerAngles);
        this._tmp.y += degree + 180;
        this._tmp.x = 0;
        this._tmp.z = 0;

        this.node.setRotationFromEuler(this._tmp);
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


