import { _decorator, Camera, CCBoolean, CCFloat, Component, EventTouch, game, math, Node, Tween, tween, Vec3 } from 'cc';
import { Cinemachine } from './Cinemachine';
const { ccclass, property } = _decorator;

@ccclass('ThirdPersonCamera')
export class ThirdPersonCamera extends Cinemachine {
    @property({
        type: Camera
    })
    public mainCamera: Camera;

    @property({
        type: Node
    })
    public follow: Node;

    @property({
        type: Node
    })
    public lookAt: Node;

    @property({
        type: CCFloat,
        displayName: "Vertical FOV",
    })
    private FOV: number = 45;
    public get fov(): number {
        return this.FOV;
    }
    public set fov(v: number) {
        this.FOV = v;
        this.mainCamera.fov = this.FOV;
    }

    @property({
        type: CCFloat,
        displayName: "Max Len",
    })
    public maxLen: number = 10;

    // #region Body
    @property({
        group: {
            name: "Boby",
            id: "1"
        },
        displayName: "Show"
    })
    private readonly BodyShow: boolean = true;

    @property({
        group: {
            name: "Boby",
            id: "1"
        },
        visible: function () {
            return this.BodyShow;
        }
    })
    public trackedObjectOffet: Vec3 = new Vec3();

    @property({
        type: CCFloat,
        group: {
            name: "Boby",
            id: "1",
        },
        slide: true,
        range: [0, 20, 0.1],
        displayName: "X Damping",
        visible: function () {
            return this.BodyShow;
        }
    })
    public xDamping: number = 1;

    @property({
        type: CCFloat,
        group: {
            name: "Boby",
            id: "1",
        },
        slide: true,
        range: [0, 20, 0.1],
        displayName: "Y Damping",
        visible: function () {
            return this.BodyShow;
        }
    })
    public yDamping: number = 1;

    @property({
        type: CCFloat,
        group: {
            name: "Boby",
            id: "1",
        },
        slide: true,
        range: [0, 20, 0.1],
        displayName: "Z Damping",
        visible: function () {
            return this.BodyShow;
        }
    })
    public zDamping: number = 1;

    /**
     * @description current direction from following object to main camera
     */
    private currentDirection: Vec3 = new Vec3();
    // #endregion

    //#region Axis Control
    @property
    public SpeedRotate: number = 1;

    @property({
        type: CCFloat,
        min: 0
    })
    public rotateDamping: number = 0.1;

    @property({
        displayName: "Rotate VH Separate"
    })
    public rotateVHSeparately: boolean = false;

    @property
    public isClampAngleAxisY: boolean = true;

    @property({
        visible: function () {
            return this.isClampAngleAxisY;
        }
    })
    public maxAngleAxisY: number = -90;

    @property({
        visible: function () {
            return this.isClampAngleAxisY;
        }
    })
    public minAngleAxisY: number = 0;

    private cameraEulerAngle: Vec3 = new Vec3();
    //#endregion

    private followPosition: Vec3 = new Vec3();

    protected onLoad(): void {
        Cinemachine.on(Cinemachine.EventType.CAMERA_ROTATE, this.OnRotateCamera, this);
    }

    protected start() {
        this.mainCamera.fov = this.fov;
    }

    protected onEnable(): void {
        // Cinemachine.on(Cinemachine.EventType.CAMERA_ROTATE, this.OnRotateCamera, this);

        this.SetPositionsFromOffset();
        this.SetCurrentDirection(this.mainCamera.node.worldPosition);
    }

    public OnRotateCamera(deltaX: number, deltaY: number) {
        if (this.rotateVHSeparately) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaY = 0;
            } else {
                deltaX = 0;
            }
        }

        this.cameraEulerAngle.set(this.mainCamera.node.eulerAngles);
        this.cameraEulerAngle.set(this.cameraEulerAngle.x + deltaX * this.SpeedRotate, this.cameraEulerAngle.y + deltaY * this.SpeedRotate, this.cameraEulerAngle.z);

        // clamp angle for Y Axis 
        if (this.isClampAngleAxisY) {
            this.cameraEulerAngle.x = math.clamp(this.cameraEulerAngle.x, this.minAngleAxisY, this.maxAngleAxisY);
        }
    }

    private UpdateRotateCamera() {
        const damping = Math.min(game.deltaTime / this.rotateDamping, 1.0);

        // set rotation
        var tempEuler = new Vec3();
        tempEuler.set(this.mainCamera.node.eulerAngles);
        Vec3.lerp(tempEuler, tempEuler, this.cameraEulerAngle, damping);

        this.mainCamera.node.setRotationFromEuler(tempEuler);

        // set position
        var currentLen = Vec3.distance(this.mainCamera.node.worldPosition, this.followPosition);
        var tempPos = new Vec3();
        tempPos.set(this.mainCamera.node.forward).multiplyScalar(currentLen);
        Vec3.subtract(tempPos, this.followPosition, tempPos);

        this.mainCamera.node.setWorldPosition(tempPos);

        this.SetCurrentDirection(this.mainCamera.node.worldPosition);
    }

    private UpdateCameraPosition() {
        var newPos = new Vec3();
        newPos.set(this.currentDirection.clone().multiplyScalar(this.maxLen).add(this.followPosition));

        this.mainCamera.node.setWorldPosition(newPos);
    }

    // #region Following Camera
    /** 
     * Set direction from follow object to target point
     */
    private SetCurrentDirection(target: Vec3) {
        Vec3.subtract(this.currentDirection, target, this.followPosition);
        this.currentDirection = this.currentDirection.normalize();
    }

    private SetPositionsFromOffset() {
        Vec3.add(this.followPosition, this.follow.worldPosition, this.trackedObjectOffet);
    }

    private FollowingObject() {
        var newPos = new Vec3();
        newPos = this.currentDirection.clone().multiplyScalar(this.maxLen).add(this.followPosition);

        // calculate damping delta
        var xLerpDelta = this.xDamping ? (1 / (this.xDamping * 10)) : 1;
        var yLerpDelta = this.yDamping ? (1 / (this.yDamping * 10)) : 1;
        var zLerpDelta = this.zDamping ? (1 / (this.zDamping * 10)) : 1;

        // set damping
        newPos.x = math.lerp(this.mainCamera.node.worldPosition.x, newPos.x, xLerpDelta);
        newPos.y = math.lerp(this.mainCamera.node.worldPosition.y, newPos.y, yLerpDelta);
        newPos.z = math.lerp(this.mainCamera.node.worldPosition.z, newPos.z, zLerpDelta);

        this.mainCamera.node.setWorldPosition(newPos);
    }
    // #endregion

    protected lateUpdate(dt: number): void {
        // calculate positions while following object moving
        this.SetPositionsFromOffset();

        // update position camera while rotating
        this.UpdateRotateCamera();

        // set position while following object moving
        this.FollowingObject();
    }

    protected onDisable(): void {
        Cinemachine.off(Cinemachine.EventType.CAMERA_ROTATE, this.OnRotateCamera, this);

    }

    protected onDestroy(): void {
        Cinemachine.off(Cinemachine.EventType.CAMERA_ROTATE, this.OnRotateCamera, this);

    }
}


