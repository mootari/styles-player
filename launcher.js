(function() {
    var jQueryVersion = '1.10.1',
        projectUrl = 'https://raw.github.com/cisso/styles-player/master';

    function addElement(parent, type, properties) {
        var element = parent.ownerDocument.createElement(type);
        for (var i in properties) {
            if (properties.hasOwnProperty(i)) {
                element[i] = properties[i];
            }
        }
        parent.appendChild(element);
        return element;
    }

    function initPopup(tab) {
        function wait(parent, properties, callback) {
            for (var i = 0; i < properties.length; i++) {
                if (!parent[properties[i]]) {
                    setTimeout(wait, 500, parent, properties, callback);
                    return;
                }
            }
            callback();
        }
        var doc = tab.document, iframe;
        doc.title = 'Styles Player';
        addElement(doc.head, 'link', {rel: 'stylesheet', type: 'text/css', href: projectUrl + '/css/style.css'});
        addElement(doc.head, 'script', {src: 'https://ajax.googleapis.com/ajax/libs/jquery/' + jQueryVersion + '/jquery.min.js'});
        addElement(doc.head, 'script', {src: projectUrl + '/lib/cssplayer.js'});
        addElement(doc.head, 'script', {src: projectUrl + '/lib/player-ui.js'});
        wait(tab.window, ['jQuery', 'playerUi'], function () {
            iframe = addElement(doc.body, 'iframe', {
                onload: function() {
                    iframe.removeAttribute('style');
                    tab.window.playerUi(tab.window.jQuery);
                },
                src: window.location.href
            });
            iframe.style.visibility = 'hidden';
        });
    }
    initPopup(window.open());
}());
