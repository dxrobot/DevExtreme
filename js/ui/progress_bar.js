import $ from '../core/renderer';
import TrackBar from './track_bar';
import { extend } from '../core/utils/extend';
import { isFunction } from '../core/utils/type';
import registerComponent from '../core/component_registrator';

// STYLE progressBar

const PROGRESSBAR_CLASS = 'dx-progressbar';
const PROGRESSBAR_CONTAINER_CLASS = 'dx-progressbar-container';
const PROGRESSBAR_RANGE_CONTAINER_CLASS = 'dx-progressbar-range-container';
const PROGRESSBAR_RANGE_CLASS = 'dx-progressbar-range';
const PROGRESSBAR_WRAPPER_CLASS = 'dx-progressbar-wrapper';
const PROGRESSBAR_STATUS_CLASS = 'dx-progressbar-status';
const PROGRESSBAR_INDETERMINATE_SEGMENT_CONTAINER = 'dx-progressbar-animating-container';
const PROGRESSBAR_INDETERMINATE_SEGMENT = 'dx-progressbar-animating-segment';

const ProgressBar = TrackBar.inherit({
    _getDefaultOptions: function() {
        return extend(this.callBase(), {
            value: 0,

            statusFormat: function(ratio) {
                return 'Progress: ' + Math.round(ratio * 100) + '%';
            },

            showStatus: true,

            onComplete: null,

            /**
            * @name dxProgressBarOptions.activeStateEnabled
            * @hidden
            */
            activeStateEnabled: false,

            statusPosition: 'bottom left',

            _animatingSegmentCount: 0

            /**
            * @name dxProgressBarOptions.focusStateEnabled
            * @hidden
            */

            /**
            * @name dxProgressBarOptions.accessKey
            * @hidden
            */

            /**
            * @name dxProgressBarOptions.tabIndex
            * @hidden
            */
        });
    },

    _defaultOptionsRules: function() {
        return this.callBase().concat([
            {
                device: function(device) {
                    return device.platform === 'android';
                },
                options: {
                    _animatingSegmentCount: 2
                }
            }
        ]);
    },

    _initMarkup: function() {
        this._renderStatus();
        this._createCompleteAction();

        this.callBase();

        this.$element().addClass(PROGRESSBAR_CLASS);
        this._$wrapper.addClass(PROGRESSBAR_WRAPPER_CLASS);
        this._$bar.addClass(PROGRESSBAR_CONTAINER_CLASS);

        this.setAria('role', 'progressbar');

        $('<div>').addClass(PROGRESSBAR_RANGE_CONTAINER_CLASS).appendTo(this._$wrapper).append(this._$bar);
        this._$range.addClass(PROGRESSBAR_RANGE_CLASS);

        this._toggleStatus(this.option('showStatus'));
    },

    _createCompleteAction: function() {
        this._completeAction = this._createActionByOption('onComplete');
    },

    _renderStatus: function() {
        this._$status = $('<div>')
            .addClass(PROGRESSBAR_STATUS_CLASS);
    },

    _renderIndeterminateState: function() {
        this._$segmentContainer = $('<div>')
            .addClass(PROGRESSBAR_INDETERMINATE_SEGMENT_CONTAINER);

        const segments = this.option('_animatingSegmentCount');

        for(let i = 0; i < segments; i++) {
            $('<div>')
                .addClass(PROGRESSBAR_INDETERMINATE_SEGMENT)
                .addClass(PROGRESSBAR_INDETERMINATE_SEGMENT + '-' + (i + 1))
                .appendTo(this._$segmentContainer);
        }

        this._$segmentContainer.appendTo(this._$wrapper);
    },

    _toggleStatus: function(value) {
        const splitPosition = this.option('statusPosition').split(' ');

        if(value) {
            if(splitPosition[0] === 'top' || splitPosition[0] === 'left') {
                this._$status.prependTo(this._$wrapper);
            } else {
                this._$status.appendTo(this._$wrapper);
            }
        } else {
            this._$status.detach();
        }

        this._togglePositionClass();
    },

    _togglePositionClass: function() {
        const position = this.option('statusPosition');
        const splitPosition = position.split(' ');

        this._$wrapper.removeClass('dx-position-top-left dx-position-top-right dx-position-bottom-left dx-position-bottom-right dx-position-left dx-position-right');

        let positionClass = 'dx-position-' + splitPosition[0];

        if(splitPosition[1]) {
            positionClass += '-' + splitPosition[1];
        }

        this._$wrapper.addClass(positionClass);
    },

    _toggleIndeterminateState: function(value) {
        if(value) {
            this._renderIndeterminateState();
            this._$bar.toggle(false);
        } else {
            this._$bar.toggle(true);
            this._$segmentContainer.remove();
            delete this._$segmentContainer;
        }
    },

    _renderValue: function() {
        const val = this.option('value');
        const max = this.option('max');

        if(!val && val !== 0) {
            this._toggleIndeterminateState(true);
            return;
        }

        if(this._$segmentContainer) {
            this._toggleIndeterminateState(false);
        }


        if(val === max) {
            this._completeAction();
        }

        this.callBase();

        this._setStatus();
    },

    _setStatus: function() {
        let format = this.option('statusFormat');

        if(isFunction(format)) {
            format = format.bind(this);
        } else {
            format = function(value) {
                return value;
            };
        }

        const statusText = format(this._currentRatio, this.option('value'));
        this._$status.text(statusText);
    },

    _dispose: function() {
        this._$status.remove();
        this.callBase();
    },

    _optionChanged: function(args) {
        switch(args.name) {
            case 'statusFormat':
                this._setStatus();
                break;
            case 'showStatus':
                this._toggleStatus(args.value);
                break;
            case 'statusPosition':
                this._toggleStatus(this.option('showStatus'));
                break;
            case 'onComplete':
                this._createCompleteAction();
                break;
            case '_animatingSegmentCount':
                break;
            default:
                this.callBase(args);
        }
    }

    /**
    * @name dxProgressBarMethods.registerKeyHandler
    * @publicName registerKeyHandler(key, handler)
    * @hidden
    */

    /**
    * @name dxProgressBarMethods.focus
    * @publicName focus()
    * @hidden
    */
});

registerComponent('dxProgressBar', ProgressBar);

export default ProgressBar;
