const onInitialize = Symbol('onInitialize');
const onDestroy = Symbol('onDestroy');
const announceEvent = Symbol('announceEvent');
const announceMessage = Symbol('announceMessage');

const ARIA_RELEVANT = 'aria-relevant';
const ARIA_ATOMIC = 'aria-atomic';
const ARIA_LIVE = 'aria-live';
const ROLE = 'role';

export const defaultOptions = {
  expire: 7000,
  'drag:start': 'Picked up draggable element',
  'drag:stop': 'Dropped draggable element',
};

/**
 * Announcement plugin
 * @class Announcement
 * @module Announcement
 */
export default class Announcement {

  /**
   * Announcement constructor.
   * @constructs Announcement
   * @param {Draggable} draggable - Draggable instance
   */
  constructor(draggable) {

    /**
     * Draggable instance
     * @property draggable
     * @type {Draggable}
     */
    this.draggable = draggable;

    /**
     * Plugin options
     * @property options
     * @type {Object}
     */
    this.options = {
      ...defaultOptions,
      ...this.getOptions(),
    };

    /**
     * Original draggable trigger method. Hack until we have onAll or on('all')
     * @property originalTriggerMethod
     * @type {Function}
     */
    this.originalTriggerMethod = this.draggable.trigger;

    /**
     * Live region element
     * @property liveRegion
     * @type {HTMLElement}
     */
    this.liveRegion = createRegion();

    this[onInitialize] = this[onInitialize].bind(this);
    this[onDestroy] = this[onDestroy].bind(this);
  }

  /**
   * Attaches listeners to draggable
   */
  attach() {
    this.draggable
      .on('draggable:initialize', this[onInitialize]);
  }

  /**
   * Detaches listeners from draggable
   */
  detach() {
    this.draggable
      .off('draggable:destroy', this[onDestroy]);
  }

  /**
   * Returns passed in options
   */
  getOptions() {
    return this.draggable.options.announcements || {};
  }

  /**
   * Announces event
   * @private
   * @param {AbstractEvent} event
   */
  [announceEvent](event) {
    const message = this.options[event.type];

    if (message && (typeof message === 'string')) {
      this[announceMessage](message);
    }

    if (message && (typeof message === 'function')) {
      this[announceMessage](message(event));
    }
  }

  /**
   * Announces message to screen reader
   * @private
   * @param {String} message
   */
  [announceMessage](message) {
    const element = document.createElement('div');
    element.innerHTML = message;
    this.liveRegion.appendChild(element);
    return setTimeout(() => {
      this.liveRegion.removeChild(element);
    }, this.options.expire);
  }

  /**
   * Initialize hander
   * @private
   */
  [onInitialize]() {
    this.draggable.trigger = (event) => {
      this[announceEvent](event);
      this.originalTriggerMethod.call(this.draggable, event);
    };

    document.body.appendChild(this.liveRegion);
  }

  /**
   * Destroy hander
   * @private
   */
  [onDestroy]() {
    this.draggable.trigger = this.originalTriggerMethod;
    document.body.removeChild(this.liveRegion);
  }
}

/**
 * Creates region element
 * @return {HTMLElement}
 */
function createRegion() {
  const element = document.createElement('div');

  element.setAttribute(ARIA_RELEVANT, 'additions');
  element.setAttribute(ARIA_ATOMIC, 'false');
  element.setAttribute(ARIA_LIVE, 'assertive');
  element.setAttribute(ROLE, 'status');

  element.style.position = 'fixed';
  element.style.width = '1px';
  element.style.height = '1px';
  element.style.top = '-1px';
  element.style.overflow = 'hidden';

  return element;
}
