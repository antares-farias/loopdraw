function LoopDraw(){
    this.graph;
    this.models;
    this.parent;
    // editorUiInit;
}
LoopDraw.prototype.init = function(){
    this.editorUiInit = EditorUi.prototype.init;
    this.models = new Model();
    var loopdraw = this;
    EditorUi.prototype.init = function()
    {
        loopdraw.editorUiInit.apply(this, arguments);
        this.actions.get('export').setEnabled(false);

        // Updates action states which require a backend
        if (!Editor.useLocalStorage)
        {
            
            mxUtils.post(OPEN_URL, '', mxUtils.bind(this, function(req)
            {
                var enabled = req.getStatus() != 404;
                this.actions.get('open').setEnabled(enabled || Graph.fileSupport);
                this.actions.get('import').setEnabled(enabled || Graph.fileSupport);
                this.actions.get('save').setEnabled(enabled);
                this.actions.get('saveAs').setEnabled(enabled);
                this.actions.get('export').setEnabled(true);
            }));
        }
        graph = this.editor.graph;
        var parent = graph.getDefaultParent();
        layout = new mxFastOrganicLayout(graph);
        loopdraw.models.getModels(this);
        document.body.insertBefore(mxUtils.button('Organic Layout',
            function(evt)
            {
                graph.getModel().beginUpdate();
                try
                {
                    layout.execute(parent);
                }
                catch (e)
                {
                    throw e;
                }
                finally
                {
                    if (false)
                    {
                        // Default values are 6, 1.5, 20
                        var morph = new mxMorphing(graph, 10, 1.7, 20);
                        morph.addListener(mxEvent.DONE, function()
                        {
                            graph.getModel().endUpdate();
                        });
                        morph.startAnimation();
                    }
                    else
                    {
                        graph.getModel().endUpdate();
                    }
                }
            }
        ), document.body.firstChild);
            //var edytor = new EditorUi(new Editor());
        /* var doc = mxUtils.parseXml('<root><mxCell id="2" value="Hello," vertex="1"><mxGeometry x="20" y="20" width="80" height="30" as="geometry"/></mxCell><mxCell id="3" value="World!" vertex="1"><mxGeometry x="200" y="150" width="80" height="30" as="geometry"/></mxCell><mxCell id="4" value="" edge="1" source="2" target="3"><mxGeometry relative="1" as="geometry"/></mxCell></root>'); 
        var doc = mxUtils.parseXml('<mxGraphModel><root>><mxCell id="1" parent="0"/><mxCell id="2" value="Hello," vertex="1"  parent="1" ><mxGeometry x="20" y="20" width="80" height="30" as="geometry"/></mxCell><mxCell id="3" value="World!" vertex="1" parent="1" ><mxGeometry x="200" y="150" width="80" height="30" as="geometry"/></mxCell><mxCell id="4" value="" edge="1" source="2" target="3" parent="1" ><mxGeometry relative="1" as="geometry"/></mxCell></root></mxGraphModel>'); 
        this.editor.setGraphXml(doc.documentElement);*/
    };

    // Adds required resources (disables loading of fallback properties, this can only
    // be used if we know that all keys are defined in the language specific file)
    mxResources.loadDefaultBundle = false;
    var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
        mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

    // Fixes possible asynchronous requests
    mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], function(xhr)
    {
        // Adds bundle text to resources
        mxResources.parse(xhr[0].getText());
        
        // Configures the default graph theme
        var themes = new Object();
        themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement(); 
        
        // Main
        new EditorUi(new Editor(urlParams['chrome'] == '0', themes));
    }, function()
    {
        document.body.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
    });
}
LoopDraw.prototype.debug = function(msj, source){
    if(
        source != "getModels" &&
        source != "createRelation_cell" &&
        true
        ){
        console.log(source+":",msj);
    }
}
