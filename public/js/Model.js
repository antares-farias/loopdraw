/*
    Handlexs models in all their states
    @autor Antares Farías

    @class Model
    @version 0.1


    master object = {
        json: object,
        jsonIdx: array,
        xml: object,
        xmlIdx: array,
        nameId = {
            name:string,
            xmlIdx: number,
            jsonIdx: number,
            properties : {
                nameid:{
                    type:
                    vertex:
                }
                ...
            },
            relations: {
                nameId:{
                    type:
                    vertex:
                },
                ...
            },
            vertex:object
        }

        ....
    }
*/
function Model(){
    this.editor;
    this.master;
    this.parser;
    this.init();
}
Model.prototype.init = function(){
    this.master = {};
	this.editor = {};
    this.loadXML = true;
    this.parser = new ParseDiagram();
}
/*Model.prototype.createModel = function(){

}*/
/**
 * Get the models form json file 
 */
Model.prototype.loadJSON = function(callback){
    model = this;
    $.getJSON('http://localhost:3000/models_data', function(json_loop) {
        model.master.json = json_loop;
    });
}
Model.prototype.getModels = function(editor_ui){
    var model = this;
    $.getJSON('http://localhost:3000/models_data', function(json_loop) {
        //var path_xml = "../../../"+json[0].saved_dir+"/ER_Model.xml";
        if(loadXML){
            var path_xml = "static/ER_Model.xml";
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    //document.getElementById('placeholder').innerHTML = xhr.responseText;
                    /*console.log(mxUtils);
                    console.log(graph);
                    console.log(editorUiInit);
                    console.log(editor_ui);*/
					model.editor = editor_ui;
                    var new_xml = xhr.responseText;
                    //console.log(model.loadXML);
                    model.master.url = json_loop.splice();
                    model.master.json = json_loop;
                    if(new_xml=="false" || !model.loadXML){ //No saved diagram
                        //var models_json = json_loop.shift();
                        //temp_json= json_loop;
                        console.log(json_loop);
                        json_loop.forEach(function(json, idx){
                            model.createModel(0,0,json);
                        });
                        model.createRelation();
                        model.applyLayout();
                        //console.log(json);
                    }
                    else{
                        //Fix issue on load XML
                        //new_xml = new_xml.replace('<mxCell id="0" parent="0"/>', "");
                        new_xml = new_xml.replace('<mxCell id="0" parent="0"/>', '<mxCell id="100" parent="0"/>');
                        new_xml = new_xml.replace('<mxCell id="1000" parent="0"/>', '<mxCell id="-1" parent="0"/>');
                        new_xml = new_xml.replace(/marginTop=6;/g, "marginTop=36;");
                        /*
                        Update Diagram with XML
                        */
                        var doc = mxUtils.parseXml(new_xml);
                        editor_ui.editor.setGraphXml(doc.documentElement);
                        editor_ui.editor.setModified(false);
                        editor_ui.editor.undoManager.clear();
                        //console.log(new_xml);
                    }
                }
            }
            xhr.open('GET', path_xml);
            xhr.send();
        }
        else{
            var models_json = json_loop.shift();
            //temp_json= json_loop;
            console.log(json_loop);
            json_loop.forEach(function(json, idx){
                this.createModel(0,0,json);
            });
            this.createRelation();
            this.applyLayout();
            //console.log(json);
        }
    });
    //TODO: check swagger to construct json
    $.getJSON('http://localhost:3000/explorer/swagger.json', function(json) {
        console.log(json);
    });
}

Model.prototype.fillVertex = function(){
	/*
    	Check comparator
	*/
	var new_xml =  new XMLSerializer().serializeToString(this.editor.editor.getGraphXml());
	//console.log(""+new_xml);
	//var new_xml =  mxUtils.getXml();
	var json_file = this.parser.converXML2Model(""+new_xml);
	this.master.xml = json_file[0];
	//comparator(parseJson2Keys(json_file), parseJson2Keys(json_loop));
	
	//var xml1 =editor_ui.editor.getGraphXml();
	//var xml2 = mxUtils.getXml(xml1);
	 /* 
	Example update cell
	*/
	//var cell = graph.model.cells[0].children[4];
	//console.log(cell);
	this.master.vertex = {};
	var model = this;
	//create dictionary to vertex
	console.log(graph.model.cells[0]);
	graph.model.cells[0].children.forEach(function (item, idx){
		//console.log(item);
		//json_file[1][item.id]
		//console.log(json_file[1]);
		model.master.vertex[json_file[1][item.id]] = item;
		if(item.edge == "1" && item.value != ""){
			if(!model.master.relation){model.master.relation = {};}
			model.master.relation[item.target.id] = item;
			model.master.relation[item.source.id] = item;
		}
		else{
			//console.log(item);
		}
	});
	console.log(this.master.vertex);
	console.log(this.master.relation);
	//graph.model.setValue(cell, "test ruls");
}
Model.prototype.updateModels = function(res_result){
	/*
		Casos:
		cambio el nombre de una llave
		cambio el nombre de un valor
		un campo no exite en uno y si en el otro
		if in xml deleted
		if in json added
		if value diferent updated
	*/
	/*result2.forEach(function(item, idx){
		var path = item.trace.split(":");
		console.log(path);
		console.log(this.master.vertex[path[1]]);
	});*/
	var result = this.actionCompare();
	var result1 = result['check_json'];
	var result2 = result['check_xml'];
	//var res_result = {};
	var model = this;
	var count = 0;
	var run_again = false;
	for (var key in result2) {
		count++;
		if (result2.hasOwnProperty(key)) {
			//console.log(key + " -> " + p[key]);
			//iterate for Trace Key
			result2[key].forEach(function(item, idx){
				var path = item.trace.split(":");
				//console.log(path);
				//vertrex
				//console.log(model.master.vertex[path[1]]);
				//console.log(path[2]);
				//console.log(model.master.vertex[path[1]].children);
				//No value
				if(item.compared == undefined){
					//delete not existing in 
					//console.log(result1[item.trace]);
					model.master.vertex[path[1]].children.forEach(function(item1, idx1){
						var found = false;
						if(result1[item.trace]){
							result1[item.trace].forEach(function(item_json, idx2){
								if(item_json.compared == undefined && !found){
									//TODO: check original AKA value
									//console.log(graph.model.getValue(item1),item.key, item_json.key);
									graph.model.setValue(item1, graph.model.getValue(item1).replace(item.key, item_json.key));
									if(!res_result[item.trace]){res_result[item.trace] = {}}
									if(!res_result[item.trace][item.key]){res_result[item.trace][item.key] = {}}
									res_result[item.trace][item.key].done = true;
									console.log(item);
									//console.log("result1", result1)
									console.log('Done case 1:update key'+item.key);
									run_again = true;
									//result1[item.trace].splice();
									found = true;
								}
								else{
									//console.log(item);
								}
							});
							if(!found){
								//console.log("not found", item);
							}
						}
						if(!found){
								//console.log(item1.value);
								if(item1.value && item1.value.indexOf(item.key)!= -1){
									/*console.log("found",item1);
									console.log(model.graph);
									console.log(graph);*/
									//item1.destroy();
									graph.removeCells([item1], true);
									if(!res_result[item.trace]){res_result[item.trace] = {}}
									if(!res_result[item.trace][item.key]){res_result[item.trace][item.key] = {}}
									res_result[item.trace][item.keyidx].done = true;
									console.log('done case 2 : Delete');
								}
						}
					});
				}
				else if(item.msj = "No Match"){
					//update 
					//search if change model relation
					if(model.master.vertex[path[1]].value.indexOf(item.original)!=-1){
						graph.model.setValue(model.master.vertex[path[1]], graph.model.getValue(model.master.vertex[path[1]]).replace(item.original, item.compared));
						//console.log(item, model.master.vertex[path[1]]);
						if(!res_result[item.trace]){res_result[item.trace] = {}}
						if(!res_result[item.trace][item.key]){res_result[item.trace][item.key] = {}}
						res_result[item.trace][item.key].done = true;
					}
					else{
						var found = -2;
						model.master.vertex[path[1]].children.forEach(function(item1, idx1){
							//console.log(item1.value, item.original);
							//Find if exist to update|
							if(item1.value && item1.value.indexOf(item.original)!= -1){
								//console.log("found",item1);
								//console.log(model.graph);
								//console.log(graph);
								//item1.destroy();
								//graph.removeCells([item1], true);
								graph.model.setValue(item1, graph.model.getValue(item1).replace(item.original, item.compared));
								if(!res_result[item.trace]){res_result[item.trace] = {}}
								if(!res_result[item.trace][item.key]){res_result[item.trace][item.key] = {}}
								res_result[item.trace][item.key].done = true;
								//console.log(item)
								found = item1;
								console.log('done case 3 : Update item',item.key);
								//TODO recursive function to check children
							}
						});
						if(item.key.indexOf("model") == -1){
							console.log('update relations');
							/*console.log(found);
							console.log(model.master.relation);*/
							console.log(model.master.relation[found.id]);
							graph.removeCells([model.master.relation[found.id]], true);
							//TODO: update relations
							model.master.relation[found.id]
						}
						else{
							//console.log(item);
						}
					}
				}
			});
		}
	}
	
	//console.log(result);
	console.log(res_result);
	console.log(result1);
	//console.log('count'+count,!stop);
	if(run_again){
		this.updateModels(res_result);
	}
	else{
		for (var key in result1){
			result1[key].forEach(function(item, idx){
				if(res_result[key] && res_result[key][item.key]){
					console.log("found"+key+" "+item.key);
				}
				else{
					//if(result1[key][idx].)
					console.log("not found");
					console.log(result1[key][idx]);
					console.log(model.master.json_key);
					//console.log(model.master.json_key[result1[key][idx]['original']].relations);
					//console.log(model.master);
				}
			});
		}
	}
	/*if(count>1 && !stop){
		this.updateModels(false);
	}
	else{
		console.log(result1, result2);
	}*/
}

/*
Cases of comparison
[DONE]- Field rename
[DONE] - relatin renamed
[DONE] - foreng key renamed
[DONE] - BASE  renamed
[] - Relation change table;
Adding propertie:
RElation cahnge type
Table REname
Table Delted
Table Created 
Table Created with relations


 */
Model.prototype.actionCompare = function(item_check,item_edit, action){
	console.log(this.master.json);
    console.log(this.master.xml);
	//TODO : neeed to get both new
	this.fillVertex(); 
	this.master.json_key = this.parser.parseJson2Keys(this.master.json);
	this.master.xml_key = this.parser.parseJson2Keys(this.master.xml);
    var result1 = this.parser.comparator(this.master.json_key, this.master.xml_key);
	var result2 = this.parser.comparator(this.master.xml_key, this.master.json_key);

    console.log(result1);
	console.log(result2);
	return ({check_json:result1, check_xml:result2});
}
var arr_models = [];
Model.prototype.createRelation = function(){
	debug('createRelation', models);
	var parent = graph.getDefaultParent();
	for (var model in models) {
		arr_models.push(model);
		//if(!models[model].done){
			var has_relation = false;
			for(var relation in models[model]['rel']){
				var this_rel =models[model]['rel'][relation]['vertex'];
				if(throughs[model]){
					/*console.log(models[model]['rel']);
					console.log(throughs[model]);
					console.log(model);
					console.log(models);*/
					var e2 = graph.insertRelationEdge(parent, null, '', 
						models[throughs[model][1]]['rel'][throughs[model][0]]['vertex'],
						models[model]['rel'][throughs[model][1]]['vertex'],
						'',{
						"number":"hasMany",
						"tag":"hasMany",
					});
					var e2 = graph.insertRelationEdge(parent, null, '', 
						models[throughs[model][0]]['rel'][throughs[model][1]]['vertex'], 
						models[model]['rel'][throughs[model][0]]['vertex'],
						'',{
						"number":"hasMany",
						"tag":"hasMany",
					});
					//invisible links

					var e1 = graph.insertEdge(parent, null, '', models[model]['vertex'], models[throughs[model][0]]['vertex'], 'endArrow=none;endSize=12;startArrow=none;startSize=14;dashed=1;startFill=1;strokeColor=#FFFFFF;');
					var e1 = graph.insertEdge(parent, null, '', models[model]['vertex'], models[throughs[model][1]]['vertex'], 'endArrow=none;endSize=12;startArrow=none;startSize=14;dashed=1;startFill=1;strokeColor=#FFFFFF;');
					throughs[model] = false;
				}
				//console.log(this_rel);
				/*if(models[model]['rel'][relation]['json'].through){
					console.log('Changin relation :'+models[model]['rel'][relation]['json'].through);
					relation = models[model]['rel'][relation]['json'].through;
				}*/
				if(models[relation] && !models[model]['rel'][relation].done){

					//debug('createRelation', [relation,model, models[relation]]);
					if(models[relation]['rel'][model]){
						var  this_model_rel=models[relation]['rel'][model]['vertex'];
						//console.log(this_model_rel);
						//debug('createRelation_cell', this_model_rel);
						if(models[model]['rel'][relation]['json'].type != 'belongsTo'){
							var tag = models[model]['rel'][relation]['json'].type;
							if(models[model]['rel'][relation]['json'].through){
								throughs[models[model]['rel'][relation]['json'].through] = [model, relation];
								tag += "Through";
								console.log(throughs);
							}
							var e1 = graph.insertEdge(parent, null, '', models[model]['vertex'], models[relation]['vertex'], 'endArrow=none;endSize=12;startArrow=none;startSize=14;dashed=1;startFill=1;strokeColor=#FFFFFF;');
							var e2 = graph.insertRelationEdge(parent, null, '', this_rel, this_model_rel, '',{
								"number":models[model]['rel'][relation]['json'].type,
								"tag":tag,
							});
							has_relation = true;
							models[model]['rel'][relation].done = true;
							models[relation]['rel'][model].done = true;
						}
					}
				}
			}
			if(!has_relation){
				//var e1 = graph.insertEdge(parent, null, '', models[model]['vertex'], models[arr_models[0]]['vertex'], 'endArrow=none;endSize=12;startArrow=none;startSize=14;dashed=1;startFill=1;strokeColor=#FFFFFF;');
			}
			//models[model].done = true;
		//}
	}
}
Model.prototype.getRelations = function(){
	console.log('test');
	
}
        var models = {};
		var throughs = {};
Model.prototype.createModel = function(x, y,json){
			var parent = graph.getDefaultParent();
			//var v1 = graph.insertVertex(parent, null, 'v1', 20, 20, 80, 30,'strokeColor=none');//;autoSizeCell=1resizeParent=1;resizeParentMax=1;resizeLast=1;marginTop=26;
			//Create Container and title
			var v1 = graph.insertVertex(parent, null, "<div><b>"+json.name+"</b></div><div><i>&lt;"+json.base+"&gt;</i></div>", x, y,180, 0,"swimlane;fontStyle=0;childLayout=stackLayout;marginTop=6;horizontal=1;startSize=30;fillColor=none;horizontalStack=0;collapsible=1;marginBottom=10;swimlaneFillColor=#ffffff;portConstraint=eastwest;rounded=1;shadow=1;html=1;");
			//var v1_title = graph.insertVertex(v1, null, "<b>"+json.name+"</b></br><i>&lt;"+json.base+"&gt;</i>", x, y,180, 30,"portConstraint=eastwest;rounded=1;shadow=1;html=1;");
			if(!models[json.name]) {models[json.name]={};}
			//console.log(v1);
			mxEvent.addListener(graph.container, 'keypress', mxUtils.bind(v1, function(evt)
			{
			  console.log(evt);
			  if (!graph.isEditing() && !graph.isSelectionEmpty() && evt.which !== 0 &&
			      !mxEvent.isAltDown(evt) && !mxEvent.isControlDown(evt) && !mxEvent.isMetaDown(evt))
			  {
			    graph.startEditing();

			    if (mxClient.IS_FF)
			    {
			      graph.cellEditor.textarea.value = String.fromCharCode(evt.which);
			    }
			  }
			}));
			models[json.name]['vertex'] = v1;
			models[json.name]['json'] = json;
			models[json.name]['rel'] = {};
			///create properties
			for (var key in json.properties) {//autoSizeCell
			  if (json.properties.hasOwnProperty(key)) {
				var required = (json.properties[key].required)?"* ":"";
				properties = "<p>"+required+key+":<b>"+json.properties[key].type+"</b></p>";//autoSizeCell=1;autoSizeCell=1;resizeParent=1;h
				var poper = graph.insertVertex(v1, null, properties,20, 20, 80, 30,'strokeColor=none;portConstraint=eastwest;html=1;');
			  }
			}
			//var v2 = graph.insertVertex(v1, null, 'v1', 20, 20, 80, 30,'strokeColor=none');
			//var keys = graph.insertVertex(v1, null, "",0, 0, 80, 30, 'strokeColor=none;portConstraint=eastwest;rounded=1;html=1;');
			//graph.insertVertex(v1, null, '',20, 20, 1, 1,"line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];rounded=1;portConstraint=eastwest;");
			//var rels = graph.insertVertex(v1, null, "",0, 0, 80, 30, 'strokeColor=none;portConstraint=eastwest;rounded=1;html=1;');
			var rels = [];
			var extra_Relations
			for (var key in json.relations) {
			  if (json.relations.hasOwnProperty(key)) {
				rel = "<p>"+((json.relations[key].foreignKey)?json.relations[key].foreignKey+"(FK)":((json.relations[key].type=='belongsTo')?key+"Id":key))+"@<b>"+key+"</b></p>";
				//autoSizeCell=1;resizeParent=1;
				if(json.relations[key].type=='belongsTo'){
					var poper = graph.insertVertex(v1, null, rel,20, 20, 80, 30, 'strokeColor=none;portConstraint=eastwest;rounded=1;html=1;');
					models[json.name]['rel'][json.relations[key].model] = {
						'json':json.relations[key],
						'vertex': poper
					};
				}
				else{
					rels.push({key:key, rel:rel});
				}
			  }
			}
			graph.insertVertex(v1, null, '',20, 20, 1, 1,"line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];rounded=1;portConstraint=eastwest;");
			rels.forEach(function(item, idx){
				console.log(item);
				var poper = graph.insertVertex(v1, null, item.rel,20, 20, 80, 30, 'strokeColor=none;portConstraint=eastwest;rounded=1;html=1;');
				models[json.name]['rel'][json.relations[item.key].model] = {
					'json':json.relations[item.key],
					'vertex': poper
				};
			});
			this.createRelation();
			//applyLayout();
			return v1;
		}
Model.prototype.applyLayout = function (){
	var parent = graph.getDefaultParent();
	var layout = new mxFastOrganicLayout(graph);
	graph.getModel().beginUpdate();
	try
	{
		// Creates a layout algorithm to be used
		// with the graph
		layout.forceConstant = 280;
		layout.execute(parent);
	}
	catch (e)
	{
		throw e;
	}
	finally
	{
		//console.log('morphin time');
		var morph = new mxMorphing(graph);
		morph.addListener(mxEvent.DONE, function()
		{
			graph.getModel().endUpdate();
			//console.log('endupdate');
			//new mxDivResizer(graph);
		});
		
		//console.log('start anima');
		morph.startAnimation();
	}
}