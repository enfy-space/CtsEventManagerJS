import {Entity} from "aframe";

const anime = require("animejs");
require("aframe")

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
    Loop: boolean,
    Curves: CtsAnimationCurve[];
}>

type CtsAnimationCurve = Readonly<{
    Attribute: Attribute,
    Easing: Easing,
    Duration: Number,
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
                    window.addEventListener("loaded", makeBehaviourFunction(targetUUID, behaviour));
            }
        }
    }
}

module.exports.MakeEvent = makeEvent

export function makeEventTest() {
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
                        Loop: false,
                        Curves: [{
                            Attribute: "PositionZ",
                            Easing: "Linear",
                            Duration: 0,
                            KeyFrames: [{
                                UUID: "",
                                time:0,
                                value:0
                            }]
                        }]
                    }]
                }
            }]
        },
    )
}

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
                                updateValue(target,curve.Attribute,AnimationProperty.value);
                            }
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
                duration: kf.time - kfs[i - 1].time,
                delay: i == 1 ? kfs[0].time : 0
            })
        }
    }
    return result;
}

function updateValue(target: Entity, attr: Attribute, value: number) {
    switch (attr) {
        case "PositionX":
            target.object3D.position.setX(value)
        case "PositionY":
            target.object3D.position.setY(value)
        case "PositionZ":
            target.object3D.position.setZ(value)

    }
}

function getObjectWithID(UUID: string): Entity{
    const target = document.querySelector("#" + UUID)
    if (target == null) {
        throw new Error("Not found " + UUID)
    }
    return target
}