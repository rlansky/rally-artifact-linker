//  Need to listen for certain Rally published events so that we get more clues on when to update,
//  this script will get injected into the page to handle that
(function() {
    var injectedScript = function() {
        var Ext = window.Ext4;

        //  This code is used to add the event listener and bubble those events up to the window
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
                this.subscribe('rallydetaildiscussionfield-ready', this._triggerUpdate, this);
                this.subscribe('rallydetailtagsmetafield-ready', this._triggerUpdate, this);
                this.subscribe('rallydetailattachmentsmetafield-ready', this._triggerUpdate, this);
                this.subscribe('rallydiscussionrichtextstreamview-ready', this._triggerUpdate, this);
                this.callParent(arguments);
            },

            _triggerUpdate: function() {
                window.postMessage({updated: true}, '*');
            }
        });

        function injectRallyArtifactListener() {
            try {
                Ext.create('Rally.plugin.artifactLinker');
            } catch(e) {
                //  Try again in a bit in case the needed Ext components are not on the page yet
                window.setTimeout(injectRallyArtifactListener, 2000);
            }
        }
        injectRallyArtifactListener();
    };

    //  This code is what gets called when they click on a link that we have created
    injectedFunction = 'function rallyArtifactLinkClick(linkedText) {' +
        'var searcher = Ext4.create(\'Rally.alm.search.HeaderSearchToolbar\');' +
        'searcher._onAfterContentUpdated = function() {' +
            'this.destroy();' +
        '};' +
        'searcher.formattedIdSearchEngine.search(linkedText);' +
    '}';

    var script = document.createElement('script');
    script.appendChild(document.createTextNode('('+ injectedScript +')();'));
    script.appendChild(document.createTextNode(injectedFunction));
    (document.body || document.head || document.documentElement).appendChild(script);
})();