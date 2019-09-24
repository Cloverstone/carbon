
renderBuilder = function(){

  $('.target').html('<div data-map="" class="btn btn-primary">Form Root</div>')
  var form = myform;
  var map = "";
  _.each(path,function(p){
    form = _.find(form.fields,{name:p})
    map += form.name+',';
    $('.target').append(' <a class="fa fa-arrow-right"> </a><div data-map="'+map+'" class="btn btn-default">'+(form.label||form.name)+'</div>')
  })
  $('.target').append('<hr>')

  
  if(typeof cb === 'undefined'){

    cb = new Cobler({formTarget:$('#form') ,disabled: false, targets: [document.getElementById('editor')],items:[[]]})
    list = document.getElementById('sortableList');
    cb.addSource(list);
    cb.on('activate', function(){
      if(list.className.indexOf('hidden') == -1){
        list.className += ' hidden';
      }
      $('#form').removeClass('hidden');
    })
    cb.on('deactivate', function(){
      list.className = list.className.replace('hidden', '');
      $('#form').addClass('hidden');
      if(typeof gform.instances.editor !== 'undefined'){
        gform.instances.editor.destroy();
      }
      mainForm();
    })
    document.getElementById('sortableList').addEventListener('click', function(e) {
      cb.collections[0].addItem(e.target.dataset.type);
    })
    cb.on("change", function(){
      var workingForm = myform;
      // if(path != []){
        _.each(path,function(p){
          workingForm = _.find(workingForm.fields,{name:p})
        })
      // }
      workingForm.fields = cb.toJSON()[0];
      
      $.jStorage.set('form', JSON.stringify(myform, undefined, "\t"));
    })
    cb.on('remove', function(e){
      if(typeof gform.instances.editor !== 'undefined' && gform.instances.editor.options.cobler == e[0]){
        cb.deactivate();
      }
    });
  }

  if(typeof form !== 'undefined'){
    var temp = $.extend(true, {}, form);
    for(var i in temp.fields){
      // var mapOptions = new gform.mapOptions(temp.fields[i],undefined,0,gform.collections)
      // temp.fields[i].options = mapOptions.getobject()
      switch(temp.fields[i].type) {
        case "select":
        case "radio":
        case "scale":
        case "range":
        case "grid":
        case "smallcombo":
          temp.fields[i].widgetType = 'collection';
          break;
        case "checkbox":
        case "switch":
          temp.fields[i].widgetType = 'bool';
          break;
        case "fieldset":
        case "grid":
          temp.fields[i].widgetType = 'section';
          break;
        default:
          temp.fields[i].widgetType = 'input';
      }
    }
    
    list.className = list.className.replace('hidden', '');
    cb.collections[0].load(temp.fields);
  }
  // mainForm(form,map);

  if(typeof gform.instances.editor !== 'undefined'){
    gform.instances.editor.destroy();
  }

mainForm();
} 
mainForm = function(){
  var form = myform;
  _.each(path,function(p){
    form = _.find(form.fields,{name:p})
  })
  if(!path.length){
    new gform({
      name:"editor",
      data: form,
      actions:[],
      fields: [
        {name:"legend",label:"Label"},
        {name:"name",label:"Name"},
        {name:"default",label:false,type:'fieldset',fields:[
          {name:"horizontal",label:"Horizontal",type:"checkbox"}
        ]},
        {name:"horizontal",label:"Horizontal",value:true,type:"checkbox",show:false,parse:true},
        {type: 'switch', label: 'Custom Actions', name: 'actions',parse:false, show:[{name:"type",value:['output'],type:"not_matches"}]},
        {type: 'fieldset',columns:12,array:true, label:false,name:"actions",parse:'show', show:[{name:"actions",value:true,type:"matches"}],fields:[
          
          {name:"type",columns:6,label:"Type",type:"smallcombo",options:["cancel","save"]},
          // {name:"name",columns:6,label:"Name"},
          {name:"action",columns:6,label:"Action"},
          {name:"label",columns:6,label:"Label"},
          {name:"modifiers",columns:6,label:"Classes",type:"smallcombo",options:[
            {label:"Danger",value:"btn btn-danger"},
            {label:"Success",value:"btn btn-success"},
            {label:"Info",value:"btn btn-info"}]}

        ]},

      ],
      legend: 'Edit Form',
    }, '#mainform').on('input:type',function(e){
      if(e.field.value == 'cancel'){
        e.field.parent.set({
          "label":"<i class=\"fa fa-times\"></i> Cancel",
          "action":"cancel",
          "modifiers": "btn btn-danger"})
      }
    }).on('input', _.throttle(function(e){
      form = _.extend(form,e.form.get());
      if(typeof e.form.get().actions == 'undefined'){
        delete form.actions;
      }
      $.jStorage.set('form', JSON.stringify(myform, undefined, "\t"));
      // renderBuilder()

    }) ).on('input:horizontal',function(){
      renderBuilder();
    })
  }else{
    var temp = new Cobler.types[gform.types[form.type].base]();
    
    new gform({
      name:"editor",
      nomanage:true,
      data: form,
      actions:[],
      fields: temp.fields,
      legend: 'Edit Fieldset',
    }, '#mainform').on('change', function(e){
      // form = _.extend(form,e.form.get())
      // $.jStorage.set('form', JSON.stringify(myform, undefined, "\t"));
      var workingForm = myform;
        _.each(path,function(p){
          workingForm = _.find(workingForm.fields,{name:p})
        })
        
      // workingForm = 
      _.extend(workingForm,e.form.get())
      
      $.jStorage.set('form', JSON.stringify(myform, undefined, "\t"));

    })

  }
}


// $('#cobler').on('click', function(e) {

// });


$('.target').on('click','[data-map]', function(e) {
path = _.compact(e.currentTarget.dataset.map.split(','));
cb.deactivate();
renderBuilder()
});



document.addEventListener('DOMContentLoaded', function(){
  myform = JSON.parse(($.jStorage.get('form') || "{}"));

  // $('#cobler').click();
  path = [];
  // $(e.target).siblings().removeClass('active');
  // $(e.target).addClass('active');
  // $('#form').addClass('hidden');
  // $('.view_source').removeClass('hidden');
  renderBuilder();
});





_.mixin({
  score: function(base, abbr, offset) {

    offset = offset || 0;
    
    if(abbr.length === 0) return 0.9;
    if(abbr.length > base.length) return 0.0;
    
    for (var i = abbr.length; i > 0; i--) {
      var sub_abbr = abbr.substring(0,i);
      var index = base.indexOf(sub_abbr);
      
      if(index < 0) continue;
      if(index + abbr.length > base.length + offset) continue;
      
      var next_string = base.substring(index+sub_abbr.length);
      var next_abbr = null;
      
      if(i >= abbr.length) {
        next_abbr = '';
      } else {
        next_abbr = abbr.substring(i);
      }
      var remaining_score   = _.score(next_string, next_abbr,offset+index);
      
      if (remaining_score > 0) {
        var score = base.length-next_string.length;
        
        if(index !== 0) {     
          var c = base.charCodeAt(index-1);
          if(c==32 || c == 9) {
            for(var j=(index-2); j >= 0; j--) {
              c = base.charCodeAt(j);
              score -= ((c == 32 || c == 9) ? 1 : 0.15);
            }
          } else {
            score -= index;
          }
        }
        
        score += remaining_score * next_string.length;
        score /= base.length;
        return(score);
      }
    }
    return(0.0);
      // return( result );
  }
})
