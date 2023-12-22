import { _decorator, Component, Node, NodeSpace, Quat, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    start() {
        const quat1 = Quat.fromEuler(new Quat(), 0, 90, 0); // Quat quay góc 90 độ quanh trục y
        const quat2 = Quat.fromEuler(new Quat(), 0, 45, 0); // Quat quay góc 45 độ quanh trục y

        const resultQuat = new Quat();
        Quat.multiply(resultQuat, quat1, quat2);

        console.log(resultQuat.getEulerAngles(new Vec3()));
    }

    update(deltaTime: number) {
        var rotationQuat = this.node.rotation.clone();
        Quat.fromEuler(rotationQuat, 0, -180 * deltaTime, 0);

        Quat.multiply(rotationQuat, this.node.rotation, rotationQuat);

        this.node.setRotation(Quat.slerp(this.node.rotation, rotationQuat, rotationQuat, 0.01));
    }
}


