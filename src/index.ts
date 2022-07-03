import {Entity} from "aframe";

import anime from "animejs";


//UUIDを持っている
interface haveUUID {
    readonly uuid: string
}

type TriggerType =
    111 | // Auto
    211   // Collision
type BehaviourType =
    111 | // Animation
    211   // Link
type Attribute =
    1111 | 1112 | 1113 | //PositionX ~ Z
    1121 | 1122 | 1123 | //RotationX ~ Z
    1131 | 1132 | 1133   //ScaleX ~ Z
type Easing =
    11 | //Linear
    21  //Ease
type Loop = number | boolean


type CtsEvent = Readonly<{
    triggers: Trigger[],
    behaviours: Behaviour[],
}> & haveUUID

type Behaviour = Readonly<{
    behaviourType: BehaviourType
    animation?: CtsAnimation
    body?: string,
}> & haveUUID

type CtsAnimation = Readonly<{
    ctsClips: CtsAnimationClip[]
}>

type CtsAnimationClip = Readonly<{
    loop: Loop,
    curves: CtsAnimationCurve[];
}>

type CtsAnimationCurve = Readonly<{
    attribute: Attribute,
    easing: Easing,
    keyFrames: KeyFrame[];
}>

type Trigger = Readonly<{
    triggerType: TriggerType,
    targetUuid?: string
}> & haveUUID

type KeyFrame = Readonly<{
    time: number,
    value: number,
}> & haveUUID

type AnimKeyFrame = Readonly<{
    value: number,
    duration: number,
    delay: number,
}>

//CtsEvent構造体をもとにイベントを作成
const makeEvent = function (targetUUID: string, e: CtsEvent) {

    for (const trigger of e.triggers) {
        for (const behaviour of e.behaviours) {
            //Triggerをもとにイベントリスナーを追加
            switch (trigger.triggerType) {
                case 111:
                    window.addEventListener("load", makeBehaviourFunction(targetUUID, behaviour));
                    break;
                case 211:
                    if (trigger.targetUuid == undefined) {
                        throw new Error("This trigger type must be defined targetUUID")
                    }
                    const target = getObjectWithID(trigger.targetUuid)
                    target.addEventListener("clicked", makeBehaviourFunction(targetUUID, behaviour))
                    break;

            }
        }
    }
}
const makeEventTest = function () {
    makeEvent(
        "box",
        {
            uuid: "",
            triggers: [{
                uuid: "",
                triggerType: 111,
                //TargetUUID: "",
            }],
            behaviours: [{
                uuid: "",
                behaviourType: 111,
                animation: {
                    ctsClips: [{
                        loop: true,
                        curves: [{
                            attribute: 1121,
                            easing: 11,

                            keyFrames: [{
                                uuid: "",
                                time: 0,
                                value: 0
                            },
                                {
                                    uuid: "",
                                    time: 2,
                                    value: 960
                                }]
                        }]
                    }]
                }
            }]
        },
    )
}
module.exports.MakeEvent = makeEvent
module.exports.MakeEventTest = makeEventTest


//Behaviourをもとに関数を作成
const makeBehaviourFunction = function (targetUUID: string, behaviour: Behaviour): (() => void) {
    switch (behaviour.behaviourType) {
        //Animation
        case 111:
            const target: Entity = getObjectWithID(targetUUID)
            const animation = behaviour.animation
            if (animation == undefined) {
                throw new Error("behaviour type is animation but there is no animation information")
            }
            const functions : (() => void)[] = [];
            for (const clip of animation.ctsClips) {
                for (const curve of clip.curves) {
                    if (curve.keyFrames.length < 2) throw new Error("require more than 1 keyframes")
                    const animKeyFrames = convertToAnimKeyFrame(curve.keyFrames)

                    functions.push(function () {

                        const AnimationProperty: { value: number } = {
                            value: curve.keyFrames[0].value
                        }


                        anime({
                            targets: AnimationProperty,
                            value: animKeyFrames,
                            update: function () {
                                console.log((AnimationProperty.value / 180) * Math.PI)
                                updateValue(target, curve.attribute, AnimationProperty.value);
                            },
                            loop: clip.loop,
                            direction: clip.loop == false ? "normal" : "alternate",
                            easing: curve.easing == 11 ? "linear" : "cubicBezier(.33, .0, .66, 1)",
                        });
                    })

                }
            }
            return function () {
                for (const f of functions) {
                    f();
                }
            }
        // Link
        case 211:
            return function () {
                if (behaviour.body == undefined) {
                    throw new Error("This is LINK Behaviour but not include body")
                }
                location.href = behaviour.body
            }

    }

}

function convertToAnimKeyFrame(kfs: KeyFrame[]): AnimKeyFrame[] {
    const result: AnimKeyFrame[] = [];
    for (const [i, kf] of kfs.entries()) {
        if (i != 0) {
            result.push({
                value: kf.value,
                duration: (kf.time - kfs[i - 1].time) * 1000,
                delay: i == 1 ? (kfs[0].time) * 1000 : 0,

            })
        }
    }
    return result;
}

function updateValue(target: Entity, attr: Attribute, value: number) {
    switch (attr) {
        case 1111:
            target.object3D.position.setX(value)
            break
        case 1112:
            target.object3D.position.setY(value)
            break
        case 1113:
            target.object3D.position.setZ(value)
            break
        case 1121:
            target.object3D.rotation.x = (value / 180) * Math.PI
            break
        case 1122:
            target.object3D.rotation.y = (value / 180) * Math.PI
            break
        case 1123:
            target.object3D.rotation.z = (value / 180) * Math.PI
            break
        case 1131:
            target.object3D.scale.setX(value)
            break
        case 1132:
            target.object3D.scale.setY(value)
            break
        case 1133:
            target.object3D.scale.setZ(value)
            break

    }
}

function getObjectWithID(UUID: string): Entity {
    const target = document.querySelector("#" + UUID)
    if (target == null) {
        throw new Error("Not found " + UUID)
    }
    return target
}