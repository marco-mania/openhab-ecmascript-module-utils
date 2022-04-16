# openHAB ECMAScript Module utils

Collection of useful functions for ECMAScript 262 Edition 11 defined rules
in openHAB.

## Installation

Create folder `/conf/automation/js/node_modules/utils` and copy `index.js` to
this folder.

## Usage

    let utils = require("utils");
    utils.myfunction(...);

## Example

    rules.JSRule({
        name: "telegram-motion-detected",
        description: "Send telegram message on motion of a motion detector in item group MotionDetectorGroup",
        triggers: [
            triggers.GroupStateChangeTrigger("MotionDetectorGroup", "ON")
        ],
        execute: data => {

            let utils = require("utils");

            // send message only at night
            if (!utils.time_of_day_is_in_period("01:00-06:00")) return;

            // ensure only one message per 10 minutes is sent
            if (!utils.throttle_barrier("throttle_map", data.itemName, 10*60)) return;

            let telegram_action = actions.get("telegram","telegram:telegramBot:ac2f0583d3");
            telegram_action.sendTelegram("WARNING! Motion detected in "+items.getItem(data.itemName).getMetadataValue("Location")+".\n"+utils.log_format_date());

        }
    });
