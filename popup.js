

initTable = function() {
  var str = '<tr id="header">';
  str += '<th id="name">' + chrome.i18n.getMessage('Name') + '</th id="">';
  str += '<th id="time">' + chrome.i18n.getMessage('Time') + '</th id="">';
  str += '<th id="price">' + chrome.i18n.getMessage('Price') + '</th id="">';
  str += '<th id="buy">' + chrome.i18n.getMessage('Buy') + '</th id="">';
  str += '<th id="sell">' + chrome.i18n.getMessage('Sell') + '</th id="">';
  str += '<th id="diff">' + chrome.i18n.getMessage('Diff') + '</th id="">';
  str += '<th id="volume">' + chrome.i18n.getMessage('Volume') + '</th id="">';
  str += '<th id="yesterday">' + chrome.i18n.getMessage('Yesterday') + '</th id="">';
  str += '<th id="open">' + chrome.i18n.getMessage('Open') + '</th id="">';
  str += '<th id="high">' + chrome.i18n.getMessage('High') + '</th id="">';
  str += '<th id="low">' + chrome.i18n.getMessage('Low') + '</th id="">';
  str += '</tr>';
  $("#result > thead").append(str);
}

appendStock = function(id) {
  //console.log(id);
  $.get("https://tw.stock.yahoo.com/q/q?s=" + id, function(data) {
    var str = '<tr calss="' + id +'"">';
    var stkname = $(data).find("input[name$='stkname']").val();
    var stkid = $(data).find("input[name$='stkid']").val();
    if(stkid != id)
    {
      return;
    }
    console.log(stkid);
    str +=  '<td id="name" nowrap="nowrap">' + stkid + '<br>' + stkname + '</td>';

    var stockTable = $(data).find('table[border=2]');
    var cellTime = $(stockTable).find('td[width=105]').next();
    str += '<td id="time">' + cellTime.text() + '</td>';

    var cellPrice = $(cellTime).next();
    str += '<td id="price">' + cellPrice.text() + '</td>';

    var cellBuy = $(cellPrice).next();
    str += '<td id="buy">' + cellBuy.text() + '</td>';

    var cellSell = $(cellBuy).next();
    str += '<td id="sell">' + cellSell.text() + '</td>';

    var cellDiff = $(cellSell).next();
    if("▲" == cellDiff.text().slice(0,1) || "△" == cellDiff.text().slice(0,1))
    {
      str += '<td id="diff" class="red">' + cellDiff.text() + '</td>';
    }
    else if("▼" == cellDiff.text().slice(0,1) || "▽" == cellDiff.text().slice(0,1))
    {
      str += '<td id="diff" class="green">' + cellDiff.text() + '</td>';
    }
    else
    {
      str += '<td id="diff">' + cellDiff.text() + '</td>';
    }

    var cellVolume = $(cellDiff).next();
    str += '<td id="volume">' + cellVolume.text() + '</td>';

    var cellYesterday = $(cellVolume).next();
    str += '<td id="yesterday">' + cellYesterday.text() + '</td>';

    var cellOpen = $(cellYesterday).next();
    str += '<td id="open">' + cellOpen.text() + '</td>';

    var cellHigh = $(cellOpen).next();
    str += '<td id="high">' + cellHigh.text() + '</td>';

    var cellLow = $(cellHigh).next();
    str += '<td id="low">' + cellLow.text() + '</td>';

    str += '</tr>';
    $("#result > tbody").append(str);
  })
  .error(function() {
    console.log("error parsing");
  });
}
/*
 * Global init function to dispatch handler
 */
/*
$(document).ready(function() {
  $.getJSON( "config.json", function( data ) {
    initTable();
    for (var i=0; i<data.count; i++)
    {
      appendStock(data.stock[i].id);
    }
  });
});
*/
$(document).ready(function() {
  chrome.storage.sync.get("data", function(items) {
    if (!chrome.runtime.error) {
      initTable();
      var data = jQuery.parseJSON( items.data );
      for (var i = 0; i < data.count; i++)
      {
        appendStock(data.stock[i].id);
      }
    }
  });
});
