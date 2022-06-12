const anime = require("animejs");

interface haveUUID {
    readonly UUID: string
}

type TriggerType = "AUTO" | "TOUCH"
type BehaviourType = "AUTO" | "TOUCH"
type CtsEvent = {
    readonly Triggers: Trigger[],
    readonly Behaviours: Behaviour[],
} & haveUUID
type Behaviour = {
    readonly Tyoe: BehaviourType
} & haveUUID

type Trigger = {
    readonly Type: TriggerType,
    readonly TargetUUID: string
} & haveUUID


module.exports.MakeEvent = function (e: CtsEvent) {
    for (const trigger of e.Triggers.values()) {
        for (const behaviour of e.Behaviours.values()) {
            window.addEventListener("loaded", makeBehaviourFunction(behaviour));
        }
        console.log(trigger)
    }
}

const makeBehaviourFunction = function (behaviour: Behaviour): (() => void) {
    return function () {
        anime({
            targets: 'div',
            translateX: 250,
            rotate: '1turn',
            backgroundColor: '#FFF',
            duration: 800
        });
    }
}


window.onload = () => {
    let a = 0;
    console.log(`hi${a}`)
};