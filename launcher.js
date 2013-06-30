function launchPlayer(requiredVersion, location, projectUrl) {

    var version = 1306302100;

    if(version != requiredVersion) {
        return false;
    }

    var sources = {
        css:     projectUrl + '/css/style.css',
        player:  projectUrl + '/lib/cssplayer.js',
        ui:      projectUrl + '/lib/player-ui.js',
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js'
    };

    function addElement(parent, type, properties) {
        var element = parent.ownerDocument.createElement(type);
        for(var i in properties) {
            if(properties.hasOwnProperty(i)) {
                element[i] = properties[i];
            }
        }
        parent.appendChild(element);
        return element;
    }

    function waitForProperties(parent, properties, callback) {
        (function wait() {
            for(var i = 0; i < properties.length; i++) {
                if(!parent[properties[i]]) {
                    setTimeout(wait, 100);
                    return;
                }
            }
            callback();
        }());
    }

    function openWindow(callback) {
        var tab, features;
        features = ['left=0', 'top=0', 'width=' + screen.width, 'height=' + screen.height];
        tab = window.open(null, null, features.join(','));
        setTimeout(function() {
            if(!tab || tab.closed || (typeof tab.closed == 'undefined') || !tab.outerHeight || !tab.outerWidth) {
                alert('Styles Player could not load. Please enable popups for this website.');
                return;
            }
            callback(tab);
        }, 300);
    }

    function initWindow(tab) {

        function loadPlayer(e) {
            e.target.removeAttribute('style');
            tab.window.invokePlayerUI(tab.window.jQuery);
        }

        var doc = tab.document;

        tab.focus();

        doc.title = location.hostname + ' | Styles Player';

        addElement(doc.head, 'link', {rel: 'stylesheet', type: 'text/css', href: sources.css});
        addElement(doc.head, 'script', {src: sources.jquery});
        addElement(doc.head, 'script', {src: sources.player});
        addElement(doc.head, 'script', {src: sources.ui});

        waitForProperties(tab.window, ['jQuery', 'invokePlayerUI'], function() {
            var iframe = addElement(doc.body, 'iframe', {
                src: window.location.href,
                onload: loadPlayer
            });
            iframe.style.visibility = 'hidden';
        });
    }

    openWindow(initWindow);
    return true;
}
