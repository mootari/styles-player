function CSSPlayer(styleSheets, progressCallback) {

    var
        frames = [],
        chapters = [],
        currentFrame = 0,
        playing = false,
        delay = 10,
        api = {};

    function collectFrames(frames, chapters) {
    
        var lastChapter = null;
    
        function getRulesFromStyleSheet(styleSheet) {
            var i, cssRule;
            // Cannot access remote stylesheets
            try {
                if(styleSheet.cssRules === null) {
                    return;
                };
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
                        ruleIndex: i,
                    });
                    currentFrame++;
                }
            }
        }
        for(var i = 0; i < styleSheets.length; i++) {
          getRulesFromStyleSheet(styleSheets[i]);
        }
    }
    
    
    function play() {
        function advanceFrame() {
            var styleSheet;
            if(currentFrame === frames.length) {
                playing = false;
                return;
            }
            styleSheet = frames[currentFrame].styleSheet;
            setTimeout(function() {
                styleSheet.insertRule(frames[currentFrame].cssText, styleSheet.cssRules.length);
                if(progressCallback) {
                    progressCallback(frames[currentFrame], currentFrame, frames.length - 1);
                }
                if(playing) {
                    currentFrame++;
                    advanceFrame();
                }
            }, delay);
        }
        playing = true;
        advanceFrame();
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
    }
    
    var api = {
        
        delay: function(delay) {
            delay = delay;
        },
        
        play: function() {
            play();
        },
        
        pause: function() {
            playing = false;
        },
        
        stop: function() {
            this.pause();
            skipTo(0);
        },

        skipTo: skipTo,
        
        current: function() {
            return currentFrame;
        },
        
        last: function() {
            return frames.length - 1;
        },
        
        chapters: function() {
            return chapters;
        }
        
    }
    
    collectFrames(frames, chapters);
    skipTo(0);
    return api;
}
