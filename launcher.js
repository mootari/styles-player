(function() {
    var jQueryVersion = '1.10.1', playerVersion = 'master';
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
    function initPopup(tab) {
        var doc = tab.document;
        doc.title = 'Styles Player';
        addElement(doc.head, 'link', {rel: 'stylesheet', href: 'https://raw.github.com/cisso/styles-player/' + playerVersion + '/css/style.css'});
        addElement(doc.head, 'script', {src: 'https://ajax.googleapis.com/ajax/libs/jquery/' + jQueryVersion + '/jquery.min.js'});
        addElement(doc.head, 'script', {src: 'https://raw.github.com/cisso/styles-player/' + playerVersion + '/lib/cssplayer.js'});
        addElement(doc.head, 'script', {src: 'https://raw.github.com/cisso/styles-player/' + playerVersion + '/lib/player-ui.js'});
        var iframe = addElement(doc.body, 'iframe', {src: window.location.href});
        iframe.style.visibility = 'hidden';
        iframe.onload = function() {
            iframe.removeAttribute('style');
            tab.window.playerUi(tab.window.jQuery);
        };
    }
    initPopup(window.open());
}());
