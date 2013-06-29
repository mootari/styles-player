function playerUi($) {

    function createUI(player) {
        
        var $player = $('<div id="css-player"/>');
        var $timeline = $('<div id="timeline"/>').appendTo($player);
        var $progress = $('<div id="progress"/>').appendTo($timeline);
        var $chapters = $('<div id="chapters"/>').appendTo($player);

        var chapters = player.chapters(), $chapter, offset, width, last = player.last();
        for(var i = 0; i < chapters.length; i++) {
            offset = 100 / last * chapters[i].index;
            width = 100 / last * ((chapters[i+1] ? chapters[i+1].index : last) - chapters[i].index);
            $chapter = $('<div class="chapter"/>')
                .css({left: offset + '%', width: width + '%'})
                .data('chapter', chapters[i])
                .click(function() {
                    player.pause();
                    player.skipTo($(this).data('chapter').index);
                })
                .appendTo($chapters);
        }
        $player.appendTo($('body'));
        
        return {
            setProgress: function(progress) {
                $progress.css('width', progress);
            },
            setText: function(text) {
                $progress.text(text);
            },
            remove: function() {
                $ui.detach();
            }
        };
    }
    
    function updateProgress(frame, index, last) {
        ui.setText(frame.styleSheet.href + "\n" + frame.selectorText);
        ui.setProgress(1 / last * index);
    }

    var iframe = $('iframe')[0];
    var iframeContent = iframe.contentWindow ? iframe.contentWindow : iframe.contentDocument.defaultView;
    var player = new CSSPlayer(iframeContent.document.styleSheets, updateProgress);
    var ui = createUI(player);
    player.play();
}
