//  Need to listen for certain Rally published events so that we get more clues on when to update,
//  this script will get injected into the page to handle that
(function() {
    var injectedScript = function() {
        var Ext = window.Ext4;

        Ext.define('Rally.plugin.artifactLinker', {
            mixins: {
                messageable: 'Rally.Messageable'
            },

            constructor: function(config) {
                this.subscribe('aftercontentrender', this._triggerUpdate, this);
                this.subscribe('rallycardboard-ready', this._triggerUpdate, this);
                this.subscribe('gridloaded', this._triggerUpdate, this);
                this.subscribe('rallydiscussionpopover-ready', this._triggerUpdate, this);
                this.subscribe('contentupdated', this._triggerUpdate, this);
                this.callParent(arguments);
            },

            _triggerUpdate: function() {
                window.postMessage({updated: true}, '*');
            }
        });

        function injectListener() {
            try {
                Ext.create('Rally.plugin.artifactLinker');
            } catch(e) {
                //  Try again in a bit in case the needed Ext components are not on the page yet
                window.setTimeout(injectListener, 2000);
            }
        }

        injectListener();
    };

    var script = document.createElement('script');
    script.appendChild(document.createTextNode('('+ injectedScript +')();'));
    (document.body || document.head || document.documentElement).appendChild(script);
})();