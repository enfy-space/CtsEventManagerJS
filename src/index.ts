import {Entity} from "aframe";

import anime from "animejs";


//UUIDを持っている
interface haveUUID {
    readonly UUID: string
}

type TriggerType = "Auto" | "Touch"
type BehaviourType = "Animation" | "Link"
type Attribute =
    "PositionX" | "PositionY" | "PositionZ" |
    "RotationX" | "RotationY" | "RotationZ" |
    "ScaleX" | "ScaleY" | "ScaleZ"
type Easing = "Ease" | "Linear"
type Loop = number | boolean


type CtsEvent = Readonly<{
    Triggers: Trigger[],
    Behaviours: Behaviour[],
}> & haveUUID

type Behaviour = Readonly<{
    Type: BehaviourType
    Animation?: CtsAnimation
    Body?: string,
}> & haveUUID

type CtsAnimation = Readonly<{
    Clips: CtsAnimationClip[]
}>

type CtsAnimationClip = Readonly<{
    Loop: Loop,
    Curves: CtsAnimationCurve[];
}>

type CtsAnimationCurve = Readonly<{
    Attribute: Attribute,
    Easing: Easing,
    KeyFrames: KeyFrame[];
}>

type Trigger = Readonly<{
    Type: TriggerType,
    TargetUUID?: string
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

    for (const trigger of e.Triggers) {
        for (const behaviour of e.Behaviours) {
            //Triggerをもとにイベントリスナーを追加
            switch (trigger.Type) {
                case "Touch":
                    if (trigger.TargetUUID == undefined) {
                        throw new Error("This trigger type must be defined targetUUID")
                    }
                    const target = getObjectWithID(trigger.TargetUUID)
                    target.addEventListener("clicked", makeBehaviourFunction(targetUUID, behaviour))
                case "Auto":
                    window.addEventListener("load", makeBehaviourFunction(targetUUID, behaviour));
            }
        }
    }
}
const  makeEventTest = function () {
    makeEvent(
        "box",
        {
            UUID: "",
            Triggers: [{
                UUID: "",
                Type: "Auto",
                //TargetUUID: "",
            }],
            Behaviours: [{
                UUID: "",
                Type: "Animation",
                Animation: {
                    Clips: [{
                        Loop: true,
                        Curves: [{
                            Attribute: "RotationZ",
                            Easing: "Ease",

                            KeyFrames: [{
                                UUID: "",
                                time:0,
                                value:0
                            },
                                {
                                    UUID: "",
                                    time:2,
                                    value:960
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
    switch (behaviour.Type) {
        case "Animation":
            const target : Entity = getObjectWithID(targetUUID)
            const animation = behaviour.Animation
            if (animation == undefined) {
                throw new Error("behaviour type is animation but there is no animation information")
            }
            for (const clip of animation.Clips) {
                for (const curve of clip.Curves) {
                    if (curve.KeyFrames.length < 2) throw new Error("require more than 1 keyframes")
                    const animKeyFrames = convertToAnimKeyFrame(curve.KeyFrames)

                    return function () {

                        const AnimationProperty: { value: number } = {
                            value: curve.KeyFrames[0].value
                        }


                        anime({
                            targets: AnimationProperty,
                            value: animKeyFrames,
                            update: function () {
                                console.log((AnimationProperty.value/180) * Math.PI)
                                updateValue(target,curve.Attribute,AnimationProperty.value);
                            },
                            loop: clip.Loop,
                            direction : clip.Loop == false ? "normal": "alternate",
                            easing:curve.Easing == "Linear" ? "linear" : "cubicBezier(.33, .0, .66, 1)",
                        });
                    }

                }
            }
            return function () {
                anime({
                    targets: 'div',
                    translateX: 250,
                    rotate: '1turn',
                    backgroundColor: '#FFF',
                    duration: 800
                });
            }
        case "Link":
            return function () {
                if (behaviour.Body == undefined) {
                    throw new Error("This is LINK Behaviour but not include body")
                }
                location.href = behaviour.Body
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
        case "PositionX":
            target.object3D.position.setX(value)
            break
        case "PositionY":
            target.object3D.position.setY(value)
            break
        case "PositionZ":
            target.object3D.position.setZ(value)
            break
        case "RotationX":
            target.object3D.rotation.x = (value/180) * Math.PI
            break
        case "RotationY":
            target.object3D.rotation.y = (value/180) * Math.PI
            break
        case "RotationZ":
            target.object3D.rotation.z = (value/180) * Math.PI
            break
        case "ScaleX":
            target.object3D.scale.setX(value)
            break
        case "ScaleY":
            target.object3D.scale.setY(value)
            break
        case "ScaleZ":
            target.object3D.scale.setZ(value)
            break

    }
}

function getObjectWithID(UUID: string): Entity{
    const target = document.querySelector("#" + UUID)
    if (target == null) {
        throw new Error("Not found " + UUID)
    }
    return target
}