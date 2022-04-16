/**
 * openHAB ECMAScript (262 Edition 11) utils module
 * @module module-utils
 */

'use strict';

/**
 * Creates a log friendly string from a date object
 * @param {Object} date - (optional) Date object. If not defined a new date object is being created (with current date/time).
 * @returns {string} - String with the form "[yyyy-mm-dd hh:mm:ss]" using the 24-hour time notation
 */
exports.log_format_date = function(date) {

    if (date === undefined) date = new Date();

    return "["+date.getFullYear().toString()+"-"+(date.getMonth()+1).toString().padStart(2, "0")+"-"+date.getDate().toString().padStart(2, "0")+
           " "+date.getHours().toString().padStart(2, "0")+
           ":"+date.getMinutes().toString().padStart(2, "0")+":"+date.getSeconds().toString().padStart(2, "0")+"]";

}

/**
 * Checks if a date object references a timepoint tomorrow
 * @param {Object} date - Date object
 * @returns {boolean}
 */
exports.is_tomorrow = function(date) {

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (date.getYear() == tomorrow.getYear() && date.getMonth() == tomorrow.getMonth() && date.getDate() == tomorrow.getDate());

}

/**
 * Returns the time of day string of the date object. Time of day string is the form "hh:mm" using the 24-hour time notation.
 * @param {Object} date - (optional) Date object. If not defined a new date object is being created (with current date/time).
 * @param {number} delay - (optional) Delay in seconds adding to the time of day string
 * @returns {string} - The time of day string
 */
exports.get_time_of_day_string = function(date, delay) {
    if (date === undefined) date = new Date();
    if (delay !== undefined && delay > 0) {
        date.setSeconds(date.getSeconds() + delay);
    }
    return date.getHours().toString()+":"+date.getMinutes().toString();
}

/**
 * Compares two time of day strings
 * @param {string} time_string1 - First time of day string
 * @param {string} time_string2 - Second time of day string
 * @returns {number} - -1: if time_string1 < time_string2, 1: if time_string1 > time_string2, else 0
 */
exports.time_of_day_string_comp = function(time_string1, time_string2) {

    const t1 = time_string1.split(":");
    const hours1 = parseInt(t1[0]);
    const mins1 = parseInt(t1[1]);

    const t2 = time_string2.split(":");
    const hours2 = parseInt(t2[0]);
    const mins2 = parseInt(t2[1]);

    if (hours1 === hours2 && mins1 === mins2) { return 0; }

    return (hours1 < hours2) || ((hours1 === hours2) && (mins1 < mins2)) ? -1 : 1;

}

/**
 * Checks if a time of day of a date object is within a period.
 * @param {string} period - Period string in form "hh:mm-hh:mm" using the 24-hour time notation
 * @param {Object} date - (optional) Date object. If not defined a new date object is being created (with current date/time).
 * @returns {boolean} - true if time of day of date object is within the period or equal to one of the periods' limits
 */
exports.time_of_day_is_in_period = function(period, date) {

    if (period === undefined) { return false; }

    const ps = period.split("-");
    if (ps.length != 2) { return false; }

    const t0 = ps[0].split(":");
    if (t0.length != 2) { return false; }
    const t0_hours = parseInt(t0[0]);
    const t0_mins = parseInt(t0[1]);

    const t1 = ps[1].split(":");
    if (t1.length != 2) { return false; }
    const t1_hours = parseInt(t1[0]);
    const t1_mins = parseInt(t1[1]);

    const now = new Date();

    return ((now.getHours() > t0_hours) || ((now.getHours() === t0_hours) && (now.getMinutes() >= t0_mins))) && //after/equal t0 ? and ...
            ((now.getHours() < t1_hours) || (now.getHours() === t1_hours) && (now.getMinutes() <= t1_mins));  //before/equal t1

}

/**
 * Returns a random number
 * @param {number} max - The highest random number should be generated
 * @param {number} min - (optional) The lowest random number should be generated. If not set, 0 will be taken.
 * @returns {number}
 */
exports.get_random_int = function(max, min) {

    if (min === undefined) { var min = 0; }
    return min + Math.floor(Math.random()*(max-min));

}

/**
 * Returns false as long a defined countdown timer is running like a time limited barrier. This is useful for throttling message events.
 * The barrier map will be placed in the openHAB cache.
 * @param {string} map_name - Map name on which the barrier will be set. Think of it as a folder.
 * @param {string} name - Name of the barrier.
 * @param {number} limit - In seconds how long the barrier should be active.
 * @returns {boolean} - true if no specified countdown timer is running. Otherwise false.
 */
exports.throttle_barrier = function(map_name, name, limit_sec) {

    let throttle_map = cache.get(map_name);
    if (throttle_map == null) {
        throttle_map = { map: new Map() };
        cache.put(map_name, throttle_map);
    }

    if (throttle_map.map.has(name) && throttle_map.map.get(name)) return false;

    throttle_map.map.set(name, true);
    cache.put(map_name, throttle_map);
    setTimeout(function() {
        let throttle_map = cache.get(map_name);
        if (throttle_map != null) {
            throttle_map.map.set(name, false);
            cache.put(map_name, throttle_map);
        }
    }, limit_sec*1000);

    return true;

}

/**
 * Cancels a possibly running barrier.
 * @param {string} map_name - Map name, where the barrier is set.
 * @param {string} name - Name of the barrier.
 */
exports.throttle_barrier_cancel = function(map_name, name) {

    let throttle_map = cache.get(map_name);
    if (throttle_map != null) {
        throttle_map.map.set(name, false);
        cache.put(map_name, throttle_map);
    }

}