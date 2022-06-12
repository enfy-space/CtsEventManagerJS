"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AAA = exports.MakeEvent = void 0;
const { anime } = require("animejs");
function MakeEvent(e) {
    for (const trigger of e.Triggers.values()) {
        for (const behaviour of e.Behaviours.values()) {
            window.addEventListener("loaded", makeBehaviourFunction(behaviour));
        }
        console.log(trigger);
    }
}
exports.MakeEvent = MakeEvent;
exports.AAA = 0;
const makeBehaviourFunction = function (behaviour) {
    return function () {
        anime({
            targets: 'div',
            translateX: 250,
            rotate: '1turn',
            backgroundColor: '#FFF',
            duration: 800
        });
    };
};
window.onload = () => {
    let a = 0;
    console.log(`hi${a}`);
};
