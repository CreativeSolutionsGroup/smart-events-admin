$(document).ready(function() {
  
  populateTwilio();
  
  // populate the event and attraction tables on start
  populateEvents();
  populateAttractions();

  // hide the engagements and slots sections
  $("#engagements-section").hide();
  $("#slots-section").hide();

  // button listeners
  $("#new-event").on('click', function() {
    newEvent();
  });
  $("#new-engagement").on('click', function() {
    newEngagement();
  });
  $("#new-attraction").on('click', function() {
    newAttraction();
  });
  $("#new-slot").on('click', function() {
    newSlot();
  });
});

const apiRoute = "http://18.222.7.110"

// *****************
// EVENTS
// *****************

function populateEvents()
{
  getAllEventsWithEngagements(function(events) {
    if (events) {
      events.forEach(event => {
        let $row = $("<tr>");
        // add everything to the row as attributes
        for (e in event) { $row.attr(e, event[e]); }
        $row
          .append($("<td>").text(event.name).addClass("event-name"))
          .append($("<td>").text(event.description).addClass("event-description"))
          .append($("<td>").text(event.engaged))
          .append($("<button>").text("Edit").attr("onClick","editEvent($(this))"))
          .attr('onClick', 'rowClicked($(this))'); // add event listener for click
        $("#all-events").append($row);
      });
    }
  });
}

function newEvent()
{
  setForm();
  let $form = $("#form-content");
  // make the form
  $form
    .append($("<h3>").text("New Event"))
    .append($("<label>").text("Name"))
    .append($("<input>").attr("type","text").attr("name", "name"))
    .append($("<label>").text("Description"))
    .append($("<input>").attr("type","text").attr("name", "description"))
  // append buttons
  let route = "/api/events"
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("POST","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

function editEvent($this)
{
  setForm();
  let $form = $("#form-content");
  // populate the form with attributes
  let $row = $this.closest("tr");
  $form
    .append($("<h3>").text("Edit Event"))
    .append($("<label>").text("Name"))
    .append($("<input>").attr("type","text").attr("name", "name").attr("value", $row.attr("name")))
    .append($("<label>").text("Description"))
    .append($("<input>").attr("type","text").attr("name", "description").attr("value", $row.attr("description")))
  // append buttons
  let route = "/api/events/" + $row.attr("_id")
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("PUT","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("delete-button").attr("onClick",`submitForm("DELETE","${route}")`).val("Delete"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

// *****************
// ATTRACTIONS
// *****************

function populateAttractions()
{
  getAllAttractionsWithRemainingCapacity(function(results) {
    if (results) {
      results.forEach(attraction => {
        let $row = $("<tr>");
        for (a in attraction) { $row.attr(a, attraction[a]) }
        // populate row
        $row
          .append($("<td>").text(attraction.name))
          .append($("<td>").text(attraction.description))
          .append($("<td>").text(attraction.about))
          .append($("<td>").text(attraction.image_url))
          .append($("<td>").text(formatTime(attraction.start_time)))
          .append($("<td>").text(formatTime(attraction.end_time)))
          .append($("<td>").text(attraction.remaining_capacity))
          .append($("<button>").text("Edit").attr("onClick","editAttraction($(this))"))
          .attr('onClick', 'rowClicked($(this))'); // add event listener for click
          // color blue if attraction is 'live'
          if (isLive(attraction)) {
            $row.css("color", "blue");
          }
        $("#all-attractions").append($row);
      });
    }
  });
}

function newAttraction()
{
  setForm();
  let $form = $("#form-content");
  // before making the form get all the events
  let $select = $("<select>").attr("name", "event_id");
  getAllEvents(function(events) {
    events.forEach(event => {
      $select
        .append($("<option>").attr("value", event._id).text(event.name))
    })
  })
  // make the form
  $form
    .append($("<h3>").text("New Attraction"))
    // append attributes
    .append($("<label>").text("Event"))
    .append($("<br>"))
    .append($select)
    .append($("<br>"))
    .append($("<label>").text("Name"))
    .append($("<input>").attr("type","text").attr("name", "name"))
    .append($("<label>").text("Description"))
    .append($("<input>").attr("type","text").attr("name", "description"))
    .append($("<label>").text("About"))
    .append($("<input>").attr("type","text").attr("name", "about"))
    .append($("<label>").text("Image URL"))
    .append($("<input>").attr("type","text").attr("name", "image_url"))
    .append($("<label>").text("Start Time"))
    .append($("<input>").attr("type","text").attr("name", "start_time").attr("value", formatTime(new Date())))
    .append($("<label>").text("End Time"))
    .append($("<input>").attr("type","text").attr("name", "end_time").attr("value", formatTime(new Date())))
  // append buttons
  let route = "/api/attractions"
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("POST","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

function editAttraction($this)
{
  setForm();
  let $form = $("#form-content");
  // populate the form with attributes
  let $row = $this.closest("tr");
  $form
    .append($("<h3>").text("Edit Attraction"))
    .append($("<label>").text("Name"))
    .append($("<input>").attr("type","text").attr("name", "name").attr("value", $row.attr("name")))
    .append($("<label>").text("Description"))
    .append($("<input>").attr("type","text").attr("name", "description").attr("value", $row.attr("description")))
    .append($("<label>").text("About"))
    .append($("<input>").attr("type","text").attr("name", "about").attr("value", $row.attr("about")))
    .append($("<label>").text("Image URL"))
    .append($("<input>").attr("type","text").attr("name", "image_url").attr("value", $row.attr("image_url")))
    .append($("<label>").text("Start Time"))
    .append($("<input>").attr("type","text").attr("name", "start_time").attr("value", formatTime($row.attr("start_time"))))
    .append($("<label>").text("End Time"))
    .append($("<input>").attr("type","text").attr("name", "end_time").attr("value", formatTime($row.attr("end_time"))))
  // append buttons
  let route = "/api/attractions/" + $row.attr("_id")
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("PUT","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("delete-button").attr("onClick",`submitForm("DELETE","${route}")`).val("Delete"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

// *****************
// ENGAGEMENTS
// *****************

function populateEngagements(eventID)
{
  $("#event-engagements td").parent().remove();
  getAllEngagementsWithEngagees(function(engagements) {
    if (engagements) {
      // filter by eventID then loop through each
      engagements.filter(eng => 
        eng.event_id == eventID
      ).forEach(engagement => {
        let $row = $("<tr>");
        // add everything to the row as attributes
        for (e in engagement) { $row.attr(e, engagement[e]); }
        $row
          .append($("<td>").text(engagement.keyword))
          .append($("<td>").text(engagement.message))
          .append($("<td>").text(engagement.image_url))
          .append($("<td>").text(formatTime(engagement.start_time)))
          .append($("<td>").text(formatTime(engagement.end_time)))
          .append($("<td>").text(engagement.engaged))
          .append($("<button>").text("Edit").attr("onClick","editEngagement($(this))"))
          .append($("<button>").text("Export").attr("onClick","exportEngagement($(this))"))
        // color blue if engagement is live
        if (isLive(engagement)) {
          $row.css("color", "blue");
        }
        $("#event-engagements").append($row);
      });
    }
  });
}

function newEngagement()
{
  setForm();
  let $form = $("#form-content");
  // before making the form get all the events
  let $select = $("<select>").attr("name", "event_id");
  getAllEvents(function(events) {
    events.forEach(event => {
      $select
        .append($("<option>").attr("value", event._id).text(event.name))
    })
  })
  // make the form
  $form
    .append($("<h3>").text("New Engagement"))
    // append attributes
    .append($("<label>").text("Event"))
    .append($("<br>"))
    .append($select)
    .append($("<br>"))
    .append($("<label>").text("Keyword"))
    .append($("<input>").attr("type","text").attr("name", "keyword"))
    .append($("<label>").text("Message"))
    .append($("<input>").attr("type","text").attr("name", "message"))
    .append($("<label>").text("Image URL"))
    .append($("<input>").attr("type","text").attr("name", "image_url"))
    .append($("<label>").text("Start Time"))
    .append($("<input>").attr("type","text").attr("name", "start_time").attr("value", formatTime(new Date())))
    .append($("<label>").text("End Time"))
    .append($("<input>").attr("type","text").attr("name", "end_time").attr("value", formatTime(new Date())))
  // append buttons
  let route = "/api/engagements"
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("POST","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

function editEngagement($this)
{
  setForm();
  let $form = $("#form-content");
  // populate the form with attributes
  let $row = $this.closest("tr");
  $form
    .append($("<h3>").text("Edit Engagement"))
    .append($("<label>").text("Keyword"))
    .append($("<input>").attr("type","text").attr("name", "keyword").attr("value", $row.attr("keyword")))
    .append($("<label>").text("Message"))
    .append($("<input>").attr("type","text").attr("name", "message").attr("value", $row.attr("message")))
    .append($("<label>").text("Image URL"))
    .append($("<input>").attr("type","text").attr("name", "image_url").attr("value", $row.attr("image_url")))
    .append($("<label>").text("Start Time"))
    .append($("<input>").attr("type","text").attr("name", "start_time").attr("value", formatTime($row.attr("start_time"))))
    .append($("<label>").text("End Time"))
    .append($("<input>").attr("type","text").attr("name", "end_time").attr("value", formatTime($row.attr("end_time"))))
  // append buttons
  let route = "/api/engagements/" + $row.attr("_id")
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("PUT","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("delete-button").attr("onClick",`submitForm("DELETE","${route}")`).val("Delete"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

function exportEngagement($this)
{
  let id = $this.closest("tr").attr("_id");
  getEngageesFromEngagament(id, function(results) {
    // build the CSV
    let csv = "Message Received,Phone\n";
    // first map each engagee into a row (array of its 2 attributes)
    // next convert each row (array of attributes) into a comma seperated string
    // finally join each row with a new line character
    csv += results.map(e => [
      e.message_received,
      e.phone
    ]).map(e => 
      e.join(",")
    ).join("\n");

    // download the CSV
    downloadCSV(csv, "export.csv", "text/csv;encoding:utf-8");
  });
}

// *****************
// SLOTS
// *****************

function populateSlots(attractionID)
{
  $("#attraction-slots td").parent().remove();
  getAllSlotsWithTickets(function(slots) {
    if (slots) {
      // filter by attraction_id then loop through each
      slots.filter(s => 
        s.attraction_id == attractionID
      ).sort((a,b) => {
        return new Date(a.hide_time) > new Date(b.hide_time)
      }).forEach(slot => {
        let $row = $("<tr>");
        // add everything to the row as attributes
        for (a in slot) { $row.attr(a, slot[a]); }
        $row
          .append($("<td>").text(slot.label))
          .append($("<td>").text(slot.tickets + "/" + slot.ticket_capacity))
          .append($("<td>").text(formatTime(slot.hide_time)))
          .append($("<button>").text("Edit").attr("onClick","editSlot($(this))"))
        if (new Date() < new Date(slot.hide_time)) {
          $row.css("color", "blue");
        }
        $("#attraction-slots").append($row);
      });
    }
  });
}

function editSlot($this)
{
  setForm();
  let $form = $("#form-content");
  // populate the form with attributes
  let $row = $this.closest("tr");
  $form
    .append($("<h3>").text("Edit Slot"))
    .append($("<label>").text("Label"))
    .append($("<input>").attr("type","text").attr("name", "label").attr("value", $row.attr("label")))
    .append($("<label>").text("Ticket Capacity"))
    .append($("<input>").attr("type","text").attr("name", "ticket_capacity").attr("value", $row.attr("ticket_capacity")))
    .append($("<label>").text("Hide Time"))
    .append($("<input>").attr("type","text").attr("name", "hide_time").attr("value", formatTime($row.attr("hide_time"))))
  // append buttons
  let route = "/api/slots/" + $row.attr("_id")
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("PUT","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("delete-button").attr("onClick",`submitForm("DELETE","${route}")`).val("Delete"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

function newSlot()
{
  setForm();
  let $form = $("#form-content");
  // before making the form get all the events
  let $select = $("<select>").attr("name", "attraction_id");
  getAllAttractions(function(attractions) {
    attractions.forEach(attraction => {
      $select
        .append($("<option>").attr("value", attraction._id).text(attraction.name))
    })
  })
  // make the form
  $form
    .append($("<h3>").text("New Slot"))
    // append attributes
    .append($("<label>").text("Attraction"))
    .append($("<br>"))
    .append($select)
    .append($("<br>"))
    .append($("<label>").text("Label"))
    .append($("<input>").attr("type","text").attr("name", "label"))
    .append($("<label>").text("Ticket Capacity"))
    .append($("<input>").attr("type","text").attr("name", "ticket_capacity"))
    .append($("<label>").text("Hide Time"))
    .append($("<input>").attr("type","text").attr("name", "hide_time").attr("value", formatTime(new Date())))
  // append buttons
  let route = "/api/slots"
  $form
    .append($("<input>").attr("type","button").addClass("save-button").attr("onClick",`submitForm("POST","${route}")`).val("Save"))
    .append($("<input>").attr("type","button").addClass("revert-button").attr("onClick","revertForm()").val("Revert"))
}

// *****************
// API AND EXTRA FUNCTIONS
// *****************

function populateTwilio()
{
  $.ajax(options = {
    type: 'GET',
    url: `${apiRoute}/api/twilio`
  }).done(function (results) {
    if (results.status == "success") {
      let $div = $("#twilio-overlay");
      $div 
        .append($("<h3>").text("Twilio Account"))
        .append($("<p>").text("Balance: $" + parseFloat(results.data.balance).toFixed(2)))
        .append($("<p>").text("Available Texts: " + parseFloat(results.data.balance / 0.0075).toFixed(0)))
    }
  }).fail(function (err) {
    console.log(err);
  });
}

function submitForm(method, route)
{
  let options = {
    type:        method,
    url:         apiRoute + route,
    contentType: 'application/json'
  }
  // add data from form if POST or PUT
  if (method == "POST" || method == "PUT") {
    let data = {};
    $('form').serializeArray().forEach(obj => 
      data[obj.name] = obj.value
    );
    options.data = JSON.stringify(data)
  }
  // make the request
  $.ajax(options)
  .done(function (results) {
    if (results.status == "success") {
      alert("Success! This page will be reloaded to reflect the changes.")
      location.reload();
    } else {
      alert("Error");
      console.log(results.message);
    }
  }).fail(function (err) {
    console.log(err);
  });
}

function setForm()
{
  $("#form-overlay").show();
  $("#form-content").empty();
}

function revertForm()
{
  $("#form-overlay").hide();
}

function rowClicked($this)
{
  // unselect all other rows
  $("#all-events tr").css("background-color", "white");
  $("#all-attractions tr").css("background-color", "white");
  $this.css("background-color", "yellow");
  // show the appropriate sub-section
  let tableID = $this.closest("table").attr("id");
  if (tableID.includes("events")) {
    $("#engagements-section").show();
    $("#slots-section").hide();
    populateEngagements($this.attr("_id"));
  } else {
    $("#engagements-section").hide();
    $("#slots-section").show();
    populateSlots($this.attr("_id"));
  }
}

function getAllEvents(callback)
{
  let url = `${apiRoute}/api/events`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getAllAttractions(callback)
{
  let url = `${apiRoute}/api/attractions`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getAllSlots(callback)
{
  let url = `${apiRoute}/api/slots`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getAllTickets(callback)
{
  let url = `${apiRoute}/api/tickets`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getAllEngagements(callback)
{
  let url = `${apiRoute}/api/engagements`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getAllEngagees(callback)
{
  let url = `${apiRoute}/api/engagees`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

function getEngageesFromEngagament(id, callback)
{
  let url = `${apiRoute}/api/engagements/${id}/engagees`;
  $.get(url, function(results) {
    callback(results.data);
  });
}

// function gets all events with added engaged attribute, calculated from engagements
function getAllEventsWithEngagements(callback)
{
  getAllEvents(function(events) {
    getAllEngagementsWithEngagees(function(engagements) {
      if (events && engagements) {
        for (evt in events) {
          // find the engagements by filtering by event_id then using the reduce funct to add up the engagees
          // count the engaged
          events[evt].engaged = engagements.filter(eng => 
            eng.event_id == events[evt]._id
          ).reduce((acc, curr) => {
            return acc += curr.engaged
          }, 0)
        }
      }
      callback(events);
    });
  });
}

// function gets all engagements with added engaged attribute, calculated from engagees
function getAllEngagementsWithEngagees(callback)
{
  getAllEngagements(function(engagements) {
    getAllEngagees(function(engagees) {
      if (engagements && engagees) {
        for (eng in engagements) {
          engagements[eng].engaged = engagees.filter(att => 
            att.engagement_id == engagements[eng]._id
          ).length
        }
      }
      callback(engagements)
    });
  });
}

function getAllAttractionsWithRemainingCapacity(callback)
{
  getAllAttractions(function(attractions) {
    getAllSlotsWithTickets(function(slots) {
      if (attractions && slots) {
        for (a in attractions) {
          // get total capacity by filtering the slots for this attraction
          // then add total tickets using the reduce funct
          let total_capacity = slots.filter(s => 
            s.attraction_id == attractions[a]._id
          ).reduce((accumulator, curr) => {
            return accumulator += curr.ticket_capacity
          }, 0)
          // next find used capacity
          let used_capacity = slots.filter(s => 
            s.attraction_id == attractions[a]._id
          ).reduce((accumulator, curr) => {
            return accumulator += curr.tickets
          }, 0)
          // divide used by total to get remaining capacity
          if (typeof total_capacity === 'number' && total_capacity != 0) {
            attractions[a].remaining_capacity = (1 - used_capacity / total_capacity) * 100 + "%";
          } else {
            attractions[a].remaining_capacity = "-";
          }
        }
      }
      callback(attractions);
    })
  })
}

function getAllSlotsWithTickets(callback)
{
  getAllSlots(function(slots) {
    getAllTickets(function(tickets) {
      if (slots && tickets) {
        for (s in slots) {
          slots[s].tickets = tickets.filter(ticket => 
            ticket.slot_id == slots[s]._id
          ).length
        }
      }
      callback(slots)
    })
  })
}

function formatTime(time)
{
  let d = new Date(time);
  let hours = d.getHours();
  let minutes = ('0' + d.getMinutes()).slice(-2);
  let TOD;
  if (hours == 0) {
    hours = 12;
    TOD = "AM";
  } else if (hours == 12) {
    TOD = "PM";
  } else if (hours > 12) {
    hours = hours - 12;
    TOD = "PM";
  } else {
    TOD = "AM"
  }
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${hours}:${minutes} ${TOD}`;
}

function isLive(obj)
{
  let time = new Date();
  return new Date(obj.start_time) <= time && time <= new Date(obj.end_time)
}

function downloadCSV(csv, fileName, mimeType) {
  var a = document.createElement('a');
  mimeType = mimeType || 'application/octet-stream';
  // function taken from:
  // https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
  if (URL && 'download' in a) {
    a.href = URL.createObjectURL(new Blob([csv], {
      type: mimeType
    }));
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    location.href = 'data:application/octet-stream,' + encodeURIComponent(csv); // only this mime type is supported
  }
}