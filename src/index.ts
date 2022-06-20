const anime = require("animejs");

interface haveUUID {
    readonly UUID: string
}

type TriggerType = "AUTO" | "TOUCH"
type BehaviourType = "ANIMATION" | "LINK"
type Attribute = "POSITION" | "SCALE" | "Rotation"
type Easing = "EASING" | "LINEAR"

type Vector3 = {
    x: number,
    y: number,
    z: number,
}
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
    StartTime: Number,
    Start: Vector3,
    End: Vector3,
}>

type Trigger = Readonly<{
    Type: TriggerType,
    TargetUUID?: string
}> & haveUUID




const makeEvent = function (targetUUID: string, e: CtsEvent) {
    for (const trigger of e.Triggers.values()) {
        for (const behaviour of e.Behaviours.values()) {
            switch (trigger.Type) {
                case "TOUCH":
                    if (trigger.TargetUUID == undefined) {
                        console.error("This trigger type must be difined targetUUID")
                        return
                    }
                    var target = document.querySelector(trigger.TargetUUID);
                    if (target == undefined) {
                        console.error("Not found " + trigger.TargetUUID)
                        return
                    }
                    console.log()
                    target.addEventListener("clicked", makeBehaviourFunction(targetUUID, behaviour))
                case "AUTO":
                    window.addEventListener("loaded", makeBehaviourFunction(targetUUID, behaviour));
            }
        }
    }
}

module.exports.MakeEvent = makeEvent

function makeEventtest() {
    makeEvent(
        "",
        {
            UUID: "",
            Triggers: [{
                UUID: "",
                Type: "AUTO",
                //TargetUUID: "",
            }],
            Behaviours: [{
                UUID: "",
                Type: "ANIMATION",
                Animation: {
                    Clips: [{
                        Loop: false,
                        Curves: [{
                            Attribute: "POSITION",
                            Easing: "LINEAR",
                            Duration: 0,
                            StartTime: 0,
                            Start: { x: 0, y: 0, z: 0 },
                            End: { x: 0, y: 0, z: 0 },
                        }]
                    }]
                }
            }]
        },
    )
}

const makeBehaviourFunction = function (targetUUID: string, behaviour: Behaviour): (() => void) {
    switch (behaviour.Type) {
        case "ANIMATION":
            return function () {
                anime({
                    targets: 'div',
                    translateX: 250,
                    rotate: '1turn',
                    backgroundColor: '#FFF',
                    duration: 800
                });
            }
        case "LINK":
            return function () {
                if (behaviour.Body == undefined) {
                    console.error("This is LINK Behaviour but not include body")
                    return
                }
                location.href = behaviour.Body
            }

    }

}


window.onload = () => {
    let a = 0;
    console.log(`hi${a}`)
};