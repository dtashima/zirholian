//$.getScript('../js/game/hearts.js', () => { alert('asdf'); });

$(function () {
    "use strict";

    const gamearea = $('#gamearea');
    const hand = $('#hand');
    const input = $('#input');

    var status = $('#status');

    var username = null;
    var currentGame = null;

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;
    // if browser doesn't support WebSocket, just show
    // some notification and exit
    if (!window.WebSocket) {
        gamearea.html($('<p>',
                       { text:'Sorry, but your browser doesn\'t support WebSocket.'}
                      ));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    const connection = new WebSocket('ws://127.0.0.1:1337');
    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };
    connection.onerror = function (error) {
        // just in there were some problems with connection...
        content.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
                + 'connection or the server is down.'
        }));
    };
    
    // most important part - incoming messages
    connection.onmessage = function (message) {
        // try to parse JSON message. Because we know that the server
        // always returns JSON this should work without any problem but
        // we should make sure that the massage is not chunked or
        // otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }

        // branch off json type
        if (json.type === 'loadall') { 
            currentGame = json.data;
            hand.text(JSON.stringify(currentGame.players));
        } else if (json.type === 'pass') {
            
        } else if (json.type === 'card') {
        } else {
            console.log('Unknown JSON:', json);
        }
    };
    /**
     * Send message when user presses Enter key
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');
            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });
     */
    /**
     * This method is optional. If the server wasn't able to
     * respond to the in 3 seconds then show some error message 
     * to notify the user that something is wrong.
     */
    setInterval(function() {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val(
                'Unable to communicate with the WebSocket server.');
        }
    }, 3000);
});
