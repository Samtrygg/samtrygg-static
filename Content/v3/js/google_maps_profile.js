var fields = new Array("FullAddress", "PostalCode", "PostalTown", /*"StreetName", "StreetNumber",*/"CountryLong", "CountryShort", "Locality", "Sublocality", "AdminArea1", "AdminArea2", "AdminArea3", "GeographicPositionLat", "GeographicPositionLong");

function delete_button_click() {
  var index = this.id.substr(this.id.lastIndexOf("_") + 1);
  var elem;

  elem = document.getElementById("address_box_" + index);
  elem.parentNode.removeChild(elem);

  if (parseInt($("#number_of_addresses").val()) > parseInt(index) + 1) {
    for (var i = 0; i < fields.length; i++) {
      for (var j = parseInt(index); j < $("#number_of_addresses").val() - 1; j++) {
        $("#" + fields[i] + "_" + j).val($("#" + fields[i] + "_" + (j + 1)).val());
      }
    }
    for (var j = parseInt(index); j < $("#number_of_addresses").val() - 1; j++) {
      $("#address_box_" + (j + 1)).attr("id", "address_box_" + j);
      $("#delete_button_" + (j + 1)).attr("id", "delete_button_" + j);
    }
    index = $("#number_of_addresses").val() - 1;
  }
  for (var i = 0; i < fields.length; i++) {
    elem = document.getElementById(fields[i] + "_" + index);
    elem.parentNode.removeChild(elem);
  }

  $("#number_of_addresses").val($("#number_of_addresses").val() - 1);
  return false;
}

function add_place() {
    if ($("#add_is_possible").val() == "0") return;
    var alert_Content=$("#alert").text().trim();
  if ($("#FullAddress").val() == "") {
      alert(alert_Content);
    return;
  }

  var index = $("#number_of_addresses").val();

  for (var i = 0; i < parseInt(index); i++) {
    var j;
    for (j = 0; j < fields.length; j++) {
      var v1 = $("#" + fields[j]).val();
      var v2 = $("#" + fields[j] + "_" + i).val();
      if (v1 != v2) break;
    }
    if (j == fields.length) return;
  }

  $("#number_of_addresses").val(parseInt(index) + 1);

  for (var i = 0; i < fields.length; i++) {
    var f = document.createElement("input");
    f.type = "hidden";
    f.id = fields[i] + "_" + index;
    f.name = fields[i] + "_" + index;
    f.value = $("#" + fields[i]).val();
    document.getElementById("all_addresses").appendChild(f);
  }

  var idx = "address_box_" + index;
  //var deleteBtn = $('<div class="remove-location-item">&times;</div>');
  //var elem = $('<div class="location-item"></div>').attr("id", "address_box_" + index).click(open_in_map_this_element).append(deleteBtn).append($("<span></span>").text($("#FullAddress").val()));
  var deleteBtn = $('<a class="close" title="Ta bort detta område"><i class="icon icon-cross-circle"></i></a>');
  var elem = $('<div class="location-item" onclick="open_in_map_this_element.call(this)" id="'+ idx +'"></div>').append($("<span></span>").text($("#FullAddress").val())).append(deleteBtn);
  $("#all_addresses").append(elem);

  /*var delete_button = document.createElement("a");
  delete_button.id = "delete_button_" + index;
  delete_button.onclick = delete_button_click;
  delete_button.title = "Ta bort detta område";
  document.getElementById("all_addresses").appendChild(delete_button);
  $("#delete_button_" + index).addClass("delete_icon");*/
  deleteBtn.attr("id", "delete_button_" + index);
  deleteBtn[0].onclick = delete_button_click;
  deleteBtn[0].title = "Ta bort detta område";

  $("#Address").blur();
  $("#Address").focus(function() {
    this.value = '';
    $(this).unbind('focus');
  });
  $("#Address").removeClass("incorrect-entry").parent().parent().parent().removeClass("has-error").children().children(".errorMsgDiv").hide();
  setTimeout(function () {
      $("#Address").val("");
      $("#Address").parent().removeClass("open");
  }, 500);
  checkLength();
}
function open_in_map_this_element() { open_in_map(+this.id.substr(this.id.lastIndexOf("_") + 1)) }
function open_in_map(index) {
  if ($("#GeographicPositionLat_" + index).length == 0) return;
  var lat = +$("#GeographicPositionLat_" + index).val().replace(/,/, ".");
  var lng = +$("#GeographicPositionLong_" + index).val().replace(/,/, ".");
  var location = new google.maps.LatLng(lat, lng);
  if (window.allMaps) {
    marker.setPosition(location);
    map.setCenter(location);
    map.setZoom(13);
  }
}

function init_select_place_map() {
  initialize_map(document.getElementById('larger-map'), false);
  var hasMap = window.allMaps && window.allMaps["larger-map"];
  if (hasMap) {
    window.map = window.allMaps["larger-map"].map;
    window.marker = window.allMaps["larger-map"].marker;
  }
  window.geocoder = new google.maps.Geocoder();

  $("#Address").autocomplete({ delay: 200, minLength: 3, appendTo: $(".search-place-results"),
    source: function(request, response) {
      geocoder.geocode({ address: request.term }, function(results, status) {
          response($.map(results, function (item) {
          var data = {};
          for (var i = 0; i < item.address_components.length; i++) {
            var short_name = item.address_components[i].short_name;
            var long_name = item.address_components[i].long_name;
            for (var j = 0; j < item.address_components[i].types.length; j++) {
              var type = item.address_components[i].types[j];
              data[type + "_short"] = short_name;
              data[type + "_long"] = long_name;
            }
          }
          if (data.country_short == "" || data.country_short != "SE") return;
          data.label = data.value = item.formatted_address;
          data.orig = item;
          var have_street_no = (data.street_number_short || "") != "";
          var have_route = (data.route_short || "") != "";
          var is_add = $("#add_is_possible").val() == "1";
          if ((is_add && !have_street_no && !have_route) || (!is_add && have_street_no && have_route))
            return data;
        }));
      });
    },
    select: function(event, ui) {

      if ($("#add_is_possible").val() == "1") {
          var num = $("#number_of_addresses").val();
          var MoreThenFiveAddressMessage = $('#MoreThenFiveAddressMessage').val();
          if (parseInt(num) >= 5) {
               //alert("Du kan max välja fem områden. Ta bort ett redan valt och försök sedan igen.");
              alert(MoreThenFiveAddressMessage);
          setTimeout(function() { $("#Address").val("") }, 0);
          return;
        }
      }

      var item = ui.item;
      var location = new google.maps.LatLng(item.orig.geometry.location.lat(), item.orig.geometry.location.lng());
      if (hasMap) {
        marker.setPosition(location);
        map.setCenter(location);
        map.setZoom(13);
      }

      // "PostalCode", "StreetNumber", "StreetName", "PostalTown", "CountryLong",
      // "CountryShort", "Locality", "Sublocality", "AdminArea1", "AdminArea2", "AdminArea3" }) {

      $("#FullAddress2").html(item.value.replace(/,/g, "<br />"));
      $("#FullAddress").val(item.value);
      $("#PostalCode").val(item.postal_code_short);
      $("#PostalTown").val(item.postal_town_short);
      $("#Address1").val(item.value.split(",")[0]);
      $("#StreetName").val(item.route_short);
      $("#StreetNumber").val(item.street_number_short);
      $("#CountryLong").val(item.country_long);
      $("#CountryShort").val(item.country_short);
      $("#Locality").val(item.locality_short);
      $("#Sublocality").val(item.sublocality_short);
      $("#AdminArea1").val(item.administrative_area_level_1_short);
      $("#AdminArea2").val(item.administrative_area_level_2_short);
      $("#AdminArea3").val(item.administrative_area_level_3_short);
      $("#GeographicPositionLat").val(item.orig.geometry.location.lat());
      $("#GeographicPositionLong").val(item.orig.geometry.location.lng());
      $("#placeId").val(item.orig.place_id);
      obj = item;

      add_place();
    }
  });

  $("#FullAddress2").html(document.getElementById("FullAddress").value.replace(/,/g, "<br />"));

  var location = new google.maps.LatLng(parseFloat(document.getElementById("GeographicPositionLat").value.replace(/,/, ".")), parseFloat(document.getElementById("GeographicPositionLong").value.replace(/,/, ".")));
  //loc = location;
  if (hasMap && !isNaN(location.lng()) && !isNaN(location.lat()) && (location.lat() != 0 || location.lng() != 0)) {
    marker.setPosition(location);
    map.setCenter(location);
    map.setZoom(13);
  }


  if ($("#add_is_possible").val() == "1") {
    var address = $('#Address');
    address.focus(function() { $(this).val(''); });
  }

  $(window).on('load', function () {
      google.maps.event.trigger(hasMap, "resize");
  });
}

$(document).ready(function () {
    $("#tenantTab4").on('click', function () {
        setTimeout(function () {
            init_select_place_map();
        }, 500);
    });
    $("button.wizard-prev").on('click', function () { setTimeout(function () { if ($("#tenantTab4").parent().hasClass("active")) { console.log('in prev function'); init_select_place_map(); } }, 500); });
    $("button.wizard-next").on('click', function () { setTimeout(function () { if ($("#tenantTab4").parent().hasClass("active")) { console.log('in next function'); init_select_place_map(); } }, 500); });
})