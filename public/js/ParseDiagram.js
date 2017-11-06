function ParseDiagram(){
    this.parseXML2Json = function(){

    }
    this.parse = function(){

    }
    /*Exeptions to comparison form jsons */
    this.exeption = [
        "acls",
        "file",
        "methods",
        "validations",
        "options",
    ];
}
ParseDiagram.prototype.parseXml = function(xml) {
    var dom = null;
    if (window.DOMParser) {
        try { 
            dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
        } 
        catch (e) { dom = null; }
    }
    else if (window.ActiveXObject) {
        try {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            if (!dom.loadXML(xml)) // parse error ..

                window.alert(dom.parseError.reason + dom.parseError.srcText);
        } 
        catch (e) { dom = null; }
    }
    else
        alert("cannot parse xml string!");
    return dom;
}
ParseDiagram.prototype.converXML2Model = function(xml){
    var json = xml2json(this.parseXml(xml));
    json = json.replace("undefined", "");
    json = JSON.parse(json);
    var model_file = {};
    var prop_file = {};
    var rel_file = {};
    var temp_mxcell = json.mxGraphModel.root.mxCell;
    temp_mxcell.splice();
    var arr_idx = [];
    var arr_name = {};
    temp_mxcell.forEach(function(item, idx){

        if(item['@edge']){
            //console.log("pross id:"+item['@id']+"  "+item['@value']);
        }
        //Model
        if(item['@parent'] == 0 && item['@edge'] != 1){
            //console.log(item);
            //console.log($(item['@value']).html());
            if(!model_file[item['@id']]){
                model_file[item['@id']] = {};
            }
            arr_idx.push(item['@id']);
            var name = $(""+item['@value']+"").html();
            if(name){
                name = name.replace("<b>","");
                name = name.replace("</b>","");
                model_file[item['@id']].name = name;
                if(item['@value']){
                    var base = $((item['@value'].split("</div>"))[1]).html();
                    base = base.substring(4, (base.length-4));
                    base = base.replace("lt;","");
                    base = base.replace("&gt;","");
                    model_file[item['@id']].base = base;
                    //model_field[item['@id']].plural = ???
                    model_file[item['@id']].properties = {};
                    model_file[item['@id']].relations = {};
                }
                //arr_name[name] = item['@id'];
                arr_name[item['@id']] = name;
            }
        }
        //Properties
        else if(item['@edge'] != 1 && item['@value']){
            //console.log(item);
            var prop = $(item['@value']).html();
            prop = prop.replace("<b>","");
            prop = prop.replace("</b>","");
            console.log(prop);
            //Foreing key
            if(prop.indexOf("@")>=0){
                prop = prop.split("@");
                var foreignKey = "";
                if(prop[0].indexOf("(FK)")>0){
                    foreignKey = prop[0].replace("(FK)","");
                }
                console.log(foreignKey);
                rel_file[item['@id']] = {
                    parent_id : item['@parent'],
                    model : model_file[item['@parent']].name,
                    foreignKey : foreignKey,
                    relation : prop[1]
                };
                //arr_name[prop[1]] = item['@id'];
                //arr_name[item['@id']] = prop[1];
            }
            //properties
            else{
                var prop1 = prop.split(":");
                //console.log("prop "+item['@id']);
                prop_file[item['@id']] = {
                    parent_id : item['@parent'],
                    model : model_file[item['@parent']].name,
                    name : prop1[0],
                    type : $(prop1[1]).html()
                };
                //arr_name[item['@id']] = prop1[1];
                var required = false;
                if(prop.indexOf("*") >= 0){
                    required = true;
                    prop = prop1[0].substring(2);
                }
                else{
                    prop = prop1[0];
                }
                //var info_prop = prop1[0].split(" ");
                model_file[item['@parent']].properties[prop] = {
                    required: required, 
                    type: prop1[1]
                };
            }
        }
        //Relations 
        else if(item['@edge'] == 1 && item['@value'] && item['@value'] != ""){
            if(item['@value'] == "hasManyThrough"){
                console.log(item);
                rel_file[item['@value']] = {};
                rel_file[item['@value']][item['@source']] = rel_file[item['@target']];
                rel_file[item['@value']][item['@target']] = rel_file[item['@source']];
                console.log(rel_file[item['@source']]);
                console.log(rel_file[item['@target']]);
                //console.log(item['@source']);
            }
            if(rel_file[item['@target']]){
                if(!model_file[rel_file[item['@target']].parent_id].relations[rel_file[item['@target']].relation]){
                    model_file[rel_file[item['@target']].parent_id].relations[rel_file[item['@target']].relation] = {};
                }
                if(!model_file[rel_file[item['@source']].parent_id].relations[rel_file[item['@source']].relation]){
                    model_file[rel_file[item['@source']].parent_id].relations[rel_file[item['@source']].relation] = {};
                }
                var new_rel = {
                    type : item['@value'],
                    model : rel_file[item['@target']].model,
                    foreignKey : (rel_file[item['@source']].foreignKey !== rel_file[item['@source']].relation) ?rel_file[item['@source']].foreignKey :""
                }
                if(rel_file['hasManyThrough']  && rel_file['hasManyThrough'][item['@source']] && item['@value'] == "hasMany"){
                    console.log('exists', rel_file['hasManyThrough'][item['@source']]);
                    new_rel.model = rel_file['hasManyThrough'][item['@source']].model;
                    new_rel.type = item['@value'];
                    new_rel.through =  rel_file[item['@target']].model;
                }
                //arr_name[prop[1]] = item['@id'];
                model_file[rel_file[item['@source']].parent_id].relations[rel_file[item['@source']].relation] = new_rel;
                var type =  "belongsTo";
                if(item['@value']=="hasAndBelongsToMany"){
                    type =  "hasAndBelongsToMany";
                }
                var new_rel = {
                    type : type,
                    model : rel_file[item['@source']].model,
                    foreignKey : (rel_file[item['@target']].foreignKey !== rel_file[item['@target']].relation) ?rel_file[item['@target']].foreignKey :""
                }
                model_file[rel_file[item['@target']].parent_id].relations[rel_file[item['@target']].relation] = new_rel;
            }
        }
    });
    console.log(rel_file);
    //console.log(model_file[17].relations);
    console.log(model_file);
    var arr_json = [];
    var name_id = [];
    arr_idx.forEach(function (item, idx){
        arr_json.push(model_file[item]);
        name_id[{"name":item.name, id: idx}];
    });
    //console.log(name_id);
    //console.log(arr_json);
    console.log(arr_name);
    return [arr_json,arr_name];
}
ParseDiagram.prototype.parseJson2Keys = function (json){
    var json_resp = {};
    json.forEach(function (item,idx){
        if(item.name != undefined){
            //var name = $(item.name).html();
            var name = item.name;
            if(name){
                name = name.replace("<b>", "");
                name = name.replace("</b>", "");
                json_resp[name]  = item;
                //console.log(name);
            }
        }
    });
    console.log(json_resp);
    return json_resp;
}
ParseDiagram.prototype.comparator = function (json_base, json_new){
    this.exeption = [
        "acls",
        "file",
        "methods",
        "validations",
        "options",
        "idInjection",
        "plural", //what ?
    ];
    /*for (var key in json_base) {
        if (json_base.hasOwnProperty(key)) {
            //console.log(key + " -> ",json_base[key],json_new[key]);
            var curr_json = json_base[key];
            //TODO:check if the Models differ
            for (var key1 in curr_json) {
                curr_json[key1]
                json_new[key][key1] = curr_json[key1];
            }
        }
    }*/
    var test = this.objComp(json_base, json_new,{},"") ;
    return test;
}
ParseDiagram.prototype.objComp = function (base, jnew, erros, trace){
    for (var key in base) {
        if(this.exeption.indexOf(key) == -1){
            //console.log("KEY :: "+key+"="+base[key]);
            if(typeof(base[key]) == "object"){
                if(!jnew[key]){
                    //console.log('no value '+key+" in new");
                    if(!erros[trace]){
                        erros[trace] = [];
                    }
                    erros[trace].push(
                        {
                            trace:trace,
                            key : key,
                            original: base[key],
                            compared: jnew[key],
                            msj: "No Value"
                        });
                }
                else{
                    var trace_sub = trace +":"+key;
                    errors = this.objComp(base[key], jnew[key], erros, trace_sub);
                }
            }
            else{
                if(base[key] != jnew[key] &&
                    (key!="required" || base[key]!=false || jnew[key])
                ){
                    console.log(trace);
                    console.log('not match '+key+"__"+base[key]+" "+jnew[key]+"__");
                    if(!erros[trace]){
                        erros[trace] = [];
                    }
                    erros[trace].push(
                        {
                            trace:trace,
                            key : key,
                            original: base[key],
                            compared: jnew[key],
                            msj: "No Match"
                        });
                }
                else{
                    //console.log('matc');
                }
            }
        }
    }
    return erros;
}