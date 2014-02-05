/**
 songticker-lib

 2010, 2012 - Lucas S. Bickel <hairmare@purplehaze.ch>
 Alle Rechte vorbehalten

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published 
 by the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 *
 * basic container function for songtickerli
 *
 * no private vars whatsoever, since i dont plan
 * on supporting multiple instances of this anyway.
 */
var SONGTICKERLI = function() {
    var storageReady = false;
};
SONGTICKERLI.tickerUrl = _songtickerli_url || 'ticker.php';
SONGTICKERLI.unknowTitleString = 'Radio Bern';

SONGTICKERLI.scrollerLock = false;
SONGTICKERLI.observers = [];
SONGTICKERLI.show = SONGTICKERLI.unknowTitleString;
SONGTICKERLI.artist = '';
SONGTICKERLI.title = '';
SONGTICKERLI.starttime = '';
SONGTICKERLI.delay = 0;
SONGTICKERLI.lowdelay = 6000;
SONGTICKERLI.highdelay = 60000;
SONGTICKERLI.notifydelay = 3000;
SONGTICKERLI.artist_info = [];
SONGTICKERLI.debug = false;
/**
 * map where the data should get displayed
 * and in the case of starttime also stored
 * for later comparison
 */
SONGTICKERLI.targets = _songtickerli_targets || {
    "show":"#songtickerli .overlay .show",
    "title":"#songtickerli .overlay .title",
    "artist":"#songtickerli .overlay .artist",
    "starttime": "#songtickerli .overlay .starttime"
};

/**
 * main loop responsible for ticking the ticker by starting ajax requesets.
 */
SONGTICKERLI.main = function() {
    // initialize ticker
    window.setTimeout(function() {
        $('#songtickerli .network-activity').show();
        $.ajax({
            url: SONGTICKERLI.tickerUrl,
             beforeSend: function(jqXHR, settings) {
                //console.log(jqXHR, settings);
                if (typeof SONGTICKERLI.lastEtag != 'undefined') {
                    jqXHR.setRequestHeader('If-None-Match', SONGTICKERLI.lastEtag);
                } else {
                    jqXHR.setRequestHeader('If-None-Match', 'why u no cache');
                }
                return true;
            },
            success: function(data, textStatus, jqXHR) {
                if (typeof data != 'undefined') {
                    SONGTICKERLI.artist     = $(data).children('ticker').children('track').children('artist').text();
                    SONGTICKERLI.artistLink = $(data).children('ticker').children('artist').children('link').text();
                    SONGTICKERLI.title      = $(data).children('ticker').children('track').children('title').text();
                    SONGTICKERLI.titleLink  = $(data).children('ticker').children('track').children('link').text();
                    SONGTICKERLI.show       = $(data).children('ticker').children('show').children('name').text();
                    SONGTICKERLI.showLink   = $(data).children('ticker').children('show').children('link').text();
                    SONGTICKERLI.starttime  = $(data).children('ticker').children('track').children('startTime').text();
                }
                if (textStatus != ' notmodified') {
                    SONGTICKERLI.lastEtag = jqXHR.getResponseHeader('ETag'); 
                    SONGTICKERLI.update(SONGTICKERLI.current_track()); 
                    SONGTICKERLI.delay = SONGTICKERLI.lowdelay;
                }
                typeof SONGTICKERLI.bleep != 'undefined' && SONGTICKERLI.bleep();
                SONGTICKERLI.main();
                SONGTICKERLI.debug && SONGTICKERLI.notify('Eine Internet Verbindung, nÃ¤chstes Update in '+SONGTICKERLI.delay/1000/60+' Minuten');
            },
            error: function() {
                SONGTICKERLI.delay = SONGTICKERLI.highdelay;
                SONGTICKERLI.debug && SONGTICKERLI.notify('Keine Internet Verbindung, nÃ¤chster Versuch in '+SONGTICKERLI.delay/1000/60+' Minuten', 'error');
                SONGTICKERLI.main();
            }
        });
    }, SONGTICKERLI.delay);
    if (SONGTICKERLI.delay == 0) {
        SONGTICKERLI.delay = SONGTICKERLI.lowdelay;
    }
};
/**
 * update the ticker if changes are detected
 */
SONGTICKERLI.update = function(track) {
    if (track.starttime == $('#songtickerli .starttime').html()) {
        return;
    }


    // load new data
    if (track.show) {
        if (track.showLink) {
            $(SONGTICKERLI.targets.show).html('<a class="link" rel="'+track.showLink+'" target="_top">'+track.show+'</a>');
        } else {
            $(SONGTICKERLI.targets.show).html(track.show);
        }
    }
    if (track.artist) {
        if (track.artistLink) {
            $(SONGTICKERLI.targets.show).html('<a class="link" rel="'+track.artistLink+'" target="_top">'+track.artist+'</a>');
        } else {
            $(SONGTICKERLI.targets.artist).html(track.artist);
        }

        if (track.titleLink) {
            $(SONGTICKERLI.targets.title).html('<a class="link" rel="'+track.titleLink+'" target="_top">'+track.title+'</a>');
        } else {
            $(SONGTICKERLI.targets.title).html(track.title);
        }

    }


    $(SONGTICKERLI.targets.starttime).html(SONGTICKERLI.starttime);
};

SONGTICKERLI.current_track = function() {
    return {
        artist:     SONGTICKERLI.artist,
        artistLink: SONGTICKERLI.artistLink,
        title:      SONGTICKERLI.title,
        titleLink:  SONGTICKERLI.titleLink,
        show:       SONGTICKERLI.show,
        showLink:   SONGTICKERLI.showLink,
        starttime:  SONGTICKERLI.starttime
    };
};
jQuery(document).ready(function() {

    SONGTICKERLI.main();
});
