function invokePlayerUI($) {

    function playerUI(player, iframeWindow) {

        var ui = {};

        function absoluteToRelative(MaxOffset, offset) {
            return 100 / MaxOffset * offset;
        }

        function frameToOffset(frame) {
            return absoluteToRelative(player.last(), frame);
        }

        function offsetToFrame(maxOffset, offset) {
            return Math.round(1 / maxOffset * offset * player.last());
        }

        ui.wrapper = (function() {
            var $wrapper = $('<div id="styles-player"/>');
            var regions = {
                top: $('<div class="region top"/>').appendTo($wrapper),
                bottom: $('<div class="region bottom"/>').appendTo($wrapper)
            };

            return {
                element: $wrapper,
                add: function(region, $element) {
                    regions[region].append($element);
                },
                attach: function($parent) {
                    $parent.append($wrapper);
                }
            }
        }());

        ui.timeline = (function() {
            var $timeline = $('<div class="timeline"/>');
            var $progress = $('<div class="progress"/>').appendTo($timeline);
            var $handle = $('<div class="handle"/>').appendTo($timeline);

            $timeline.on('click', function(e) {
                var frame = offsetToFrame($timeline.width(), e.pageX - $timeline.offset().left);
                player.skipTo(frame);
            });

            $(document).on('playerUpdate', function(e) {
                var offset = frameToOffset(e.originalEvent.detail.currentFrame);
                $progress.css('width', offset + '%');
                $handle.css('left', offset + '%');
            });

            ui.wrapper.add('top', $timeline);
            return {
                element: $timeline
            };
        }());

        ui.preview = (function() {
            function updatePreview(offset) {
                var timelineWidth = $timeline.width();
                var deadzone = $preview.outerWidth() / 2;
                var frame = player.getFrame(offsetToFrame(timelineWidth, offset));
                var finalOffset = Math.max(deadzone, Math.min(timelineWidth - deadzone, offset));
                $preview.css('left', finalOffset + 'px');
                $preview.text(frame.selectorText);
            }
            var $preview = $('<div class="preview"/>');
            var $timeline = ui.timeline.element;
            $timeline.on({
                mouseenter: function(e) {
                    updatePreview(e.pageX - $timeline.offset().left);
                    $preview.appendTo($timeline);
                },
                mouseleave: function(e) {
                    $preview.detach();
                },
                mousemove: function(e) {
                    updatePreview(e.pageX - $timeline.offset().left);
                }
            });
            return {};
        }());

        ui.button = (function() {
            function setButtonStatus(name) {
                $button.removeClass('play stop replay').addClass(name);
            }
            var $button = $('<div class="button"></div>');
            setButtonStatus('play');
            $button.click(function() {
                if(player.playing()) {
                    player.pause();
                }
                else if(player.current() > player.last()) {
                    player.skipTo(0);
                    setButtonStatus('play');
                }
                else {
                    player.play();
                }
            });
            ui.wrapper.add('bottom', $button);

            $(document).on('playerStatus', function(e) {
                var detail = e.originalEvent.detail;
                var action = detail.status ? 'stop' : (detail.currentFrame > detail.lastFrame ? 'replay' : 'play');
                setButtonStatus(action);
            });

            return {
              element: $button
            };
        }());

        ui.time = (function() {
            var $time = $('<div class="time"/>');
            var $current = $('<span class="current">0</span>');
            var $total = $('<span class="total">0</span>');
            $time.append($current, $('<span class="separator">/</span>'), $total);
            ui.wrapper.add('bottom', $time);
            $total.text(player.last());

            $(document).on('playerUpdate', function(e) {
                $current.text(e.originalEvent.detail.currentFrame);
            });
        }());

        ui.zoom = (function() {
            function updateZoom(newLevel) {
                var transform = 'scale(' + newLevel + ')';
                $('html', player.getDocument()).css({
                    'transform-origin': '0 0',
                    'transform': transform,
                    '-webkit-transform': transform,
                    '-moz-transform': transform
                });
                $current.text(Math.round(newLevel * 100) + '%');
                level = newLevel;
            }
            var level = 1;
            var $zoom = $('<div class="zoom"/>');
            var $increase = $('<span class="increase">+</span>');
            var $decrease = $('<span class="decrease">-</span>');
            var $current = $('<span class="current">100%</span>');
            var $fit = $('<span class="fit">[ ]</span>');
            var $reset = $('<span class="reset">1:1</span>');
            $zoom.append($decrease, $increase, $current, $fit, $reset);

            $increase.click(function() {
                updateZoom(level + .25);
            });
            $decrease.click(function() {
                updateZoom(level > .25 ? level - .25 :.01);
            });
            $fit.click(function() {
                // @todo Consider using https://github.com/tombigel/detect-zoom, when tranform is not available.
                updateZoom(1 / $(player.getDocument()).height() * $(iframeWindow).height());
            });
            $reset.click(function() {
                updateZoom(1);
            });

            ui.wrapper.add('bottom', $zoom);
        }());

        return {
            attach: ui.wrapper.attach
        };
    }


    function init() {
        var iframe = $('iframe')[0];
        var iframeContent = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
        var player = CSSPlayer(iframeContent.document);
        playerUI(player, iframeContent).attach($('body'));
        player.skipTo(0);
    }

    init();
}
