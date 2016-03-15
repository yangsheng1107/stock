function importConfig(strJson){
  chrome.storage.sync.set({ "data" : strJson }, function() {
    if (chrome.runtime.error) {
      console.log("Runtime error.");
    }
  });
}

function convertTable2Json(){
  var count = $('#diagnosis_list > tbody > tr').length ;
  var jsonstr = '{"count": ' + count + ', "stock" : [';

  var i =1;
  $('#diagnosis_list > tbody >tr').each(function() {
      var selectedTd = $(this).children('td:first-child').next();
      jsonstr += ' {"id" : "' + selectedTd.text()+ '", "name":"' + selectedTd.next().text() + '" }';
      if(i!= count)
      {
        jsonstr += ',';
      }
      i++;
  })
  jsonstr += ']}';

  return jsonstr;
}

function appendStockInTable(index, stockid, stockname){
  var str = "<tr id='stock" + (index + 1) + "'><td class='priority td-edit'>" + (index + 1) + "</td>";
  str += "<td class='td-edit'>" + stockid + "</td>";
  str += "<td class='td-edit'>" + stockname + "</td>";
  str += "<td><a class='btn btn-delete btn-danger'>Delete</a></td></tr>";
  $('#diagnosis_list > tbody').append(str);
}

function stockTableReset(){
  $('#diagnosis_list > tbody').html("");
}

function getStockName(id) {
  //console.log(id);
  $.get("https://tw.stock.yahoo.com/q/q?s=" + id, function(data) {
    var name = $(data).find("input[name$='stkname']").val();
    if(name != undefined)
    {
      $("#text-name").val(name);
      $('#add_row').show();
    }
    else
    {
      alert("can't find stock id : " + id);
    }
  })
  .error(function() {
    alert("can't find stock id : " + id);
  });
}

function stocklist(){
  chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      var data = jQuery.parseJSON( items.data );
      for (var newid = 0; newid < data.count; newid++)
      {
        appendStockInTable(newid, data.stock[newid].id, data.stock[newid].name);
      }
    }
  });
}

//Renumber table rows
function renumber_table(tableID) {
  $(tableID + " tr").each(function() {
    count = $(this).parent().children().index($(this)) + 1;
    $(this).find('.priority').html(count);
  });
}

$(document).ready(function() {
  //Helper function to keep table row from collapsing when being sorted
  stocklist();
  $('#btn-save').hide();
  $('#add_row').hide();
  var fixHelperModified = function(e, tr) {
    var $originals = tr.children();
    var $helper = tr.clone();
    $helper.children().each(function(index)
    {
      $(this).width($originals.eq(index).width())
    });
    return $helper;
  };

  //Make diagnosis table sortable
  $("#diagnosis_list tbody").sortable({
      helper: fixHelperModified,
    stop: function(event,ui) {renumber_table('#diagnosis_list')}
  }).disableSelection();

  //Delete button in table rows
  $('table').on('click','.btn-delete',function() {
    tableID = '#' + $(this).closest('table').attr('id');
    r = confirm('Delete this item?');
    if(r) {
      $(this).closest('tr').remove();
      renumber_table(tableID);
      $('#btn-save').show();
      }
  });

  // Edit
  $('table').on('dblclick','.td-edit',function() {
    var OriginalContent = $(this).text();

    $(this).addClass("cellEditing");
    $(this).html("<input type='text' value='" + OriginalContent + "' />");
    $(this).children().first().focus();

    $(this).children().first().keypress(function (e) {
    if (e.which == 13) {    //enter key
      var newContent = $(this).val();
      $(this).parent().text(newContent);
      $(this).parent().removeClass("cellEditing");
      }
    });

    $(this).children().first().blur(function(){
      $(this).parent().text(OriginalContent);
      $(this).parent().removeClass("cellEditing");
    });
    $('#btn-save').show();
  });

  // Save
  $("#btn-save").on("click", function() {
    var jsonstr = convertTable2Json();
    importConfig(jsonstr);
    alert("success");
    $('#btn-save').hide();
  });

  // Add
  $("#add_row").on("click", function() {
    // Dynamic Rows Code
    var id = $("#text-id").val();
    if(id.length != 4) return;
    var name = $("#text-name").val();
    if((name == undefined) || (name == ""))
    {
      return;
    }
    var max = $('#diagnosis_list > tbody > tr').length;
    $("#text-id").val("");
    $("#text-name").val("");
    $('#add_row').hide();
    $('#btn-save').show();
    appendStockInTable(max, id, name);
    renumber_table(tableID);
  });

  // Export
  $("#btn-export").on("click", function() {
    var jsonstr = convertTable2Json();
    $("#txt-export").val(jsonstr);
  });

  // Import
  $("#btn-import").on("click", function() {
    var jsonstr = $("#txt-import").val();
    try {
      var c = $.parseJSON(jsonstr);
    }
      catch (err) {
      alert("json format failure");
      return;
    }
    importConfig(jsonstr);
  });

  //Init tab click event : #tab-home
  $("#tab-home").on("click", function() {
    stockTableReset();
    stocklist();
    $("#text-id").val("");
    $("#text-name").val("");
    $('#add_row').hide();
    //$('#btn-save').hide();
  });

  //Init tab click event : #tab-backup
  $("#tab-backup").on("click", function() {
    $("#txt-export").val("");
    $("#txt-import").val("");
  });

  $('#text-id').change(function () {
    getStockName($('#text-id').val());
  });
});


