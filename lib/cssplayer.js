function CSSPlayer(styleSheets) {

    var
        frames = [],
        chapters = [],
        currentFrame = 0,
        playing = false,
        delay = 50,
        api = {};

    function collectFrames(frames, chapters) {
    
        var lastChapter = null;
    
        function getRulesFromStyleSheet(styleSheet) {
            var i, cssRule;
            // Cannot access remote stylesheets
            try {
                if(styleSheet.cssRules === null) {
                    return;
                }
            } catch(error) {
                return;
            }
            if(styleSheet.href !== lastChapter) {
                chapters.push({index: currentFrame, title: styleSheet.href});
            }
            for(i = 0; i < styleSheet.cssRules.length; i++) {
                cssRule = styleSheet.cssRules[i];
                if(cssRule.type === window.CSSRule.IMPORT_RULE) {
                    getRulesFromStyleSheet(cssRule.styleSheet);
                }
                else {
                    frames.push({
                        styleSheet: styleSheet,
                        selectorText: cssRule.selectorText,
                        cssText: cssRule.cssText,
                        ruleIndex: i
                    });
                    currentFrame++;
                }
            }
        }
        for(var i = 0; i < styleSheets.length; i++) {
          getRulesFromStyleSheet(styleSheets[i]);
        }
    }

    function triggerEvent(name, data) {
        var event = new CustomEvent(name, {
            bubbles: false,
            cancelable: false,
            detail: data
        });
        document.dispatchEvent(event);
    }


    function triggerUpdate() {
        triggerEvent('playerUpdate', {
            frame: frames[currentFrame],
            currentFrame: currentFrame,
            lastFrame: frames.length - 1,
            player: api
        });
    }

    function triggerStatus() {
        triggerEvent('playerStatus', {
            status: playing,
            frame: frames[currentFrame],
            currentFrame: currentFrame,
            lastFrame: frames.length - 1,
            player: api
        });
    }

    function pause() {
        if(playing) {
            playing = false;
            triggerStatus();
        }
    }

    function play() {
        if(!playing) {
            playing = true;
            triggerStatus();
        }
        advanceFrames();
    }

    
    function advanceFrames() {
        if(!playing) {
            return;
        }
        if(currentFrame === frames.length) {
            pause();
            return;
        }
        var styleSheet = frames[currentFrame].styleSheet;
        styleSheet.insertRule(frames[currentFrame].cssText, styleSheet.cssRules.length);
        triggerUpdate();
        currentFrame++;
        setTimeout(advanceFrames, delay);
    }

    
    function skipTo(targetFrame) {
        var i, styleSheet;
        if(targetFrame < currentFrame) {
            for(i = currentFrame - 1; i >= targetFrame; i--) {
                frames[i].styleSheet.deleteRule(frames[i].ruleIndex);
            }
        }
        else {
            for(i = currentFrame; i <= targetFrame; i++) {
                styleSheet = frames[i].styleSheet;
                styleSheet.insertRule(frames[i].cssText, styleSheet.cssRules.length);
            }
        }
        currentFrame = targetFrame;
        triggerUpdate();
    }
    
    api = {
        
        delay: function(delayValue) {
            delay = delayValue;
        },
        
        play: function() {
            play();
        },

        playing: function() {
            return playing;
        },
        
        pause: function() {
            pause();
        },
        
        stop: function() {
            this.pause();
            skipTo(0);
        },

        skipTo: function(targetFrame) {
            skipTo(targetFrame);
        },
        
        current: function() {
            return currentFrame;
        },
        
        last: function() {
            return frames.length - 1;
        },
        
        chapters: function() {
            return chapters;
        },

        getFrame: function(frameIndex) {
            return frames[frameIndex];
        }
    };
    
    collectFrames(frames, chapters);
    skipTo(0);
    return api;
}
