'use strict';

module.exports = ConfigCtx;

/**
 * Configuration context
 * @constructor
 * @param {array} rcs - Array of .venusrc data objects, highest priority last
 * @param {object} annotations - @venus annotations
 */
function ConfigCtx() {

}

/**
 * Get value
 * @param {string} p - Property path to lookup
 * @return {object} value or null if path is invalid
 */
ConfigCtx.prototype.get = function () {
  return null;
};
