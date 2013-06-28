function collectRules() {
    var collectedRules = [];
    function getRulesFromStyleSheet(styleSheet) {
        var i, cssRule;
        // Cannot access remote stylesheets
        if(styleSheet.cssRules === null) {
            return;
        };
        for(i = 0; i < styleSheet.cssRules.length; i++) {
            cssRule = styleSheet.cssRules[i];
            if(cssRule.type === window.CSSRule.IMPORT_RULE) {
                getRulesFromStyleSheet(cssRule.styleSheet);
            }
            else {
                collectedRules.push({styleSheet: styleSheet, cssRule: cssRule, index: i});
            }
        }
    }
    for(var i = 0; i < document.styleSheets.length; i++) {
      getRulesFromStyleSheet(document.styleSheets[i], collectedRules);
    }
    return collectedRules;
}


function deleteRules(rules) {
    for(var i = rules.length - 1; i; i--) {
        rules[i].styleSheet.deleteRule(rules[i].index);
    }
}


function reinsertRules(rules, delay, callback) {
    function applyRule(index) {
        var cssText, styleSheet;
        if(index === rules.length) {
            return;
        }
        styleSheet = rules[index].styleSheet;
        cssText = rules[index].cssRule.cssText;
        if(!cssText.length) {
            return applyRule(index + 1);
        }
        setTimeout(function() {
            try {
                styleSheet.insertRule(cssText, styleSheet.cssRules.length);
            } catch (err) {
            }
            if(callback) {
                callback(rules, index);
            }
            applyRule(index + 1);
        }, delay);
    }
    applyRule(0);
}


function appendProgressBar() {
    var bar = document.createElement('div');
    bar.setAttribute('style', 'z-index:9999999;overflow:visible;position:fixed;top:0;left:0;width:100%;margin:0;padding:0;text-indent:5px;background:#000;color:#FFF;white-space:pre;font:13px/18px sans-serif;');
    bar.appendChild(document.createTextNode(''));
    document.body.appendChild(bar);
    return {
        setProgress: function(progress) {
            var width = bar.clientWidth * progress;
            bar.style.boxShadow = width  + 'px 0 #666 inset';
        },
        setText: function(text) {
            bar.childNodes[0].nodeValue = text;
        },
        remove: function() {
            bar.parentNode.removeChild(bar);
        }
    };
    return bar;
}


function run(delay) {
    var bar = appendProgressBar();
    var rules = collectRules();
    deleteRules(rules);
    reinsertRules(rules,delay, function(rules, i) {
        bar.setText(rules[i].styleSheet.href + "\n" + rules[i].cssRule.selectorText);
        bar.setProgress(1 / rules.length * (i + 1));
        if(i + 1 === rules.length) {
            bar.remove();
        }
    });
}

run(prompt('Enter delay in ms:', 10));
