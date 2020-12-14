$(document).ready(function() {
  
  populateEvents();
  // populateAttractions();

  $("#add-new-event").on('click', function() {
    addRowToEventTable();
  });

  $("#add-new-engagement").on('click', function() {
    addRowToEngagementTable();
  });

  $("#add-new-attraction").on('click', function() {
    addRowToAttractionTable();
  });

});


function populateEvents()
{
  // empty each row in events table except the header
  $("#all-events td").parent().remove();
  $("#event-engagements-section").hide();
  getAllEventsWithEngagements(function(events) {
    if (events) {
      events.forEach(event => {
        let $row = $("<tr>");
        // add everything to the row as attributes
        for (attr in event) { $row.attr(attr, event[attr]); }
        $row.append($("<td>").text(event.name).addClass("event-name"));
        $row.append($("<td>").text(event.description).addClass("event-description"));
        $row.append($("<td>").text(event.engaged));
        $row.attr('onClick', 'eventClicked($(this))'); // add event listener for click
        $("#all-events").append($row);
      });
    }
  });
}

function populateAttractions()
{
  getAllAttractions(function(results) {
    if (results) {
      results.forEach(attraction => {
        let $row = $("<tr>");
        $row.css("background-color","lightgreen");
        $row.append($("<td>").text(attraction.name));
        $row.append($("<td>").text(attraction.description));
        $row.append($("<td>").text(attraction.about));
        $row.append($("<td>").text(attraction.image_url));
        $row.append($("<td>").text("-"));
        $row.attr("attraction-id", attraction._id);
        $("#all-attractions").append($row);
      });
    }
  });
}

function populateEngagements(eventID)
{
  $("#event-engagements-section").show();
  $("#event-engagements td").parent().remove();
  getAllEngagementsWithEngagees(function(engagements) {
    if (engagements) {
      // filter by eventID then loop through each
      engagements.filter(eng => 
        eng.event_id == eventID
      ).forEach(engagement => {
        let $row = $("<tr>");
        // add everything to the row as attributes
        for (attr in engagement) { $row.attr(attr, engagement[attr]); }
        $row.append($("<td>").text(engagement.keyword).addClass("engagement-keyword"));
        $row.append($("<td>").text(engagement.message).addClass("engagement-message"));
        $row.append($("<td>").text(engagement.image_url).addClass("engagement-image"));
        $row.append($("<td>").text(formatTime(engagement.start_time)).addClass("engagement-start"));
        $row.append($("<td>").text(formatTime(engagement.end_time)).addClass("engagement-end"));
        $row.append($("<td>").text(engagement.engaged));
        $row.attr('onClick', 'engagementClicked($(this))'); // add event listener for click
        $("#event-engagements").append($row);
      });
    }
  });
}

function eventClicked($this)
{
  // if already the selected event, just ignore
  if ($this.is($("#selected-event"))) { return; }
  revertSelectedEvent();
  unselectEvents();
  $this.attr("id","selected-event");
  $this.css("background-color", "yellow");
  // add buttons for edit and delete
  $this.append(
    $("<td>")
      .append($("<button>").text("Edit").attr("onClick","editSelectedEvent()"))
      .append($("<button>").text("Delete").attr("onClick","deleteSelectedEvent()")));
  populateEngagements($this.attr("_id"));
}

function engagementClicked($this)
{
  // if already the selected engagement, just ignore
  if ($this.is($("#selected-engagement"))) { return; }
  revertSelectedEngagement();
  unselectEngagements();
  $this.attr("id","selected-engagement");
  $this.css("background-color", "yellow");
  // add buttons for edit and delete
  $this.append(
    $("<td>")
      .append($("<button>").text("Export").attr("onClick","exportSelectedEngagement()"))
      .append($("<button>").text("Edit").attr("onClick","editSelectedEngagement()"))
      .append($("<button>").text("Delete").attr("onClick","deleteSelectedEngagement()")));
}

function editSelectedEvent()
{
  $("#selected-event .event-name")
    .empty()
    .append($("<input>").attr("type","text").val($("#selected-event").attr("name")));
  $("#selected-event .event-description")
    .empty()
    .append($("<input>").attr("type","text").val($("#selected-event").attr("description")));
  // update buttons
  $("#all-events button").parent().remove();
  $("#selected-event").append(
    $("<td>")
      .append($("<button>").text("Save").attr("onClick","updateSelectedEvent()"))
      .append($("<button>").text("Revert").attr("onClick","revertSelectedEvent()")));
}

function updateSelectedEvent()
{
  let id = $("#selected-event").attr("_id");
  let options = {
    name: $("#selected-event .event-name").find("input").val(),
    description: $("#selected-event .event-description").find("input").val()
  }
  updateEvent(id, options, function(results) {
    if (results.status == "success") {
      alert(results.data.name + " updated successfully.")
      populateEvents();
    } else {
      alert("Error updating event.")
      console.log(results.message)
    }
  })
}

function revertSelectedEvent()
{
  $("#selected-event .event-name")
    .empty()
    .text($("#selected-event").attr("name"));
  $("#selected-event .event-description")
    .empty()
    .text($("#selected-event").attr("description"));
  unselectEvents()
}

function deleteSelectedEvent()
{
  let id = $("#selected-event").attr("_id");
  let name = $("#selected-event").attr("name");
  deleteEvent(id, function(results) {
    if (results.status == "success") {
      populateEvents();
      alert("Successfully deleted " + name);
    } else {
      alert("Error deleting event");
    }
  })
}

function saveNewEvent()
{
  let options = {
    "name": $("#new-event-name").val(),
    "description": $("#new-event-description").val()
  }
  addEvent(options, function(results) {
    if (results.status == "success") {
      populateEvents();
      alert("Successfully added " + results.data.name);
    } else {
      alert("Error adding event");
    }
  });
}

function deleteNewEvent()
{
  $("#new-event").remove();
}

function deleteNewEngagement()
{
  $("#new-engagement").remove();
}

function unselectEvents()
{
  $("#event-engagements-section").hide();
  $("#new-event").remove();
  $("#all-events button").parent().remove();
  $("#all-events tr").css("background-color", "white");
  $("#selected-event").removeAttr("id");
}

function unselectEngagements()
{
  $("#new-engagement").remove();
  $("#event-engagements button").parent().remove();
  $("#event-engagements tr").css("background-color", "white");
  $("#selected-engagement").removeAttr("id");
}

function addRowToEventTable()
{
  revertSelectedEvent();
  unselectEvents();
  let $row = $("<tr>");
  $row.append(
    $("<td>")
      .append($("<input>").attr("type","text").attr("id","new-event-name")));
  $row.append(
    $("<td>")
    .append($("<input>").attr("type","text").attr("id","new-event-description")));
  $row.append(
    $("<td>").text("-"));
  $row.append(
    $("<td>")
      .append($("<button>").text("Save").attr("onclick","saveNewEvent()"))
      .append($("<button>").text("Delete").attr("onclick","deleteNewEvent()")));
  $row.attr("id","new-event");
  $row.css("background-color", "yellow");
  $("#all-events").append($row);
}

function addRowToEngagementTable()
{
  revertSelectedEngagement();
  unselectEngagements();
  let $row = $("<tr>");
  $row.append(
    $("<td>")
      .append($("<input>").attr("type","text").attr("id","new-engagement-keyword")));
  $row.append(
    $("<td>")
    .append($("<input>").attr("type","text").attr("id","new-engagement-message")));
  $row.append(
    $("<td>")
    .append($("<input>").attr("type","text").attr("id","new-engagement-image")));
  console.log(new Date);
    $row.append(
    $("<td>")
    .append($("<input>").attr("type","text").attr("id","new-engagement-start").val(formatTime(new Date))));
  $row.append(
    $("<td>")
    .append($("<input>").attr("type","text").attr("id","new-engagement-end").val(formatTime(new Date))));
  $row.append(
    $("<td>").text("-"));
  $row.append(
    $("<td>")
      .append($("<button>").text("Save").attr("onclick","saveNewEngagement()"))
      .append($("<button>").text("Delete").attr("onclick","deleteNewEngagement()")));
  $row.attr("id","new-engagement");
  $row.css("background-color", "yellow");
  $("#event-engagements").append($row);
}

function addRowToAttractionTable()
{
  let $row = $("<tr>");
  $row.append($("<td>").append("<input type='text' />"));
  $row.append($("<td>").append("<input type='text' />"));
  $row.append($("<td>").append("<input type='text' />"));
  $row.append($("<td>").append("<input type='text' />"));
  $row.append($("<td>").text("-"));
  $row.append(
    $("<td>")
      .append($("<button>").text("Save").attr("onclick","saveNewAttraction($(this))"))
      .append($("<button>").text("Delete")));
  $row.attr("name","new-attraction");
  $("#all-attractions").append($row);
}

function saveNewEngagement()
{
  let options = {
    "event_id": $("#selected-event").attr("_id"),
    "keyword": $("#new-engagement-keyword").val(),
    "message": $("#new-engagement-message").val(),
    "image_url": $("#new-engagement-image").val(),
    "start_time": $("#new-engagement-start").val(),
    "end_time": $("#new-engagement-end").val()
  }
  addEngagement(options, function(results) {
    if (results.status == "success") {
      populateEngagements(options.event_id);
      alert("Successfully added engagement.");
    } else {
      console.log(results.message);
      alert("Error adding engagement.");
    }
  });
}

function editSelectedEngagement()
{
  $("#selected-engagement .engagement-keyword")
    .empty()
    .append($("<input>").attr("type","text").val($("#selected-engagement").attr("keyword")));
  $("#selected-engagement .engagement-message")
    .empty()
    .append($("<input>").attr("type","text").val($("#selected-engagement").attr("message")));
  $("#selected-engagement .engagement-image")
    .empty()
    .append($("<input>").attr("type","text").val($("#selected-engagement").attr("image_url")));
  $("#selected-engagement .engagement-start")
    .empty()
    .append($("<input>").attr("type","text").val(formatTime($("#selected-engagement").attr("start_time"))));
  $("#selected-engagement .engagement-end")
    .empty()
    .append($("<input>").attr("type","text").val(formatTime($("#selected-engagement").attr("end_time"))));
  // update buttons
  $("#event-engagements button").parent().remove();
  $("#selected-engagement").append(
    $("<td>")
      .append($("<button>").text("Save").attr("onClick","updateSelectedEngagement()"))
      .append($("<button>").text("Revert").attr("onClick","revertSelectedEngagement()")));
}

function updateSelectedEngagement()
{
  let id = $("#selected-engagement").attr("_id");
  let options = {
    event_id: $("#selected-event").attr("_id"),
    keyword: $("#selected-engagement .engagement-keyword").find("input").val(),
    message: $("#selected-engagement .engagement-message").find("input").val(),
    image_url: $("#selected-engagement .engagement-image").find("input").val(),
    start_time: $("#selected-engagement .engagement-start").find("input").val(),
    end_time: $("#selected-engagement .engagement-end").find("input").val(),
  }
  console.log(options);
  updateEngagement(id, options, function(results) {
    if (results.status == "success") {
      alert("Engagement updated successfully.")
      populateEngagements($("#selected-engagement").attr("event_id"));
    } else {
      alert("Error updating engagement.")
      console.log(results.message)
    }
  })
}

function revertSelectedEngagement()
{
  $("#selected-engagement .engagement-keyword")
    .empty()
    .text($("#selected-engagement").attr("keyword"))
  $("#selected-engagement .engagement-message")
    .empty()
    .text($("#selected-engagement").attr("message"))
  $("#selected-engagement .engagement-image")
    .empty()
    .text($("#selected-engagement").attr("image_url"))
  $("#selected-engagement .engagement-start")
    .empty()
    .text(formatTime($("#selected-engagement").attr("start_time")))
  $("#selected-engagement .engagement-end")
    .empty()
    .text(formatTime($("#selected-engagement").attr("end_time")))
  unselectEngagements();
}

function deleteSelectedEngagement()
{
  let id = $("#selected-engagement").attr("_id");
  deleteEngagement(id, function(results) {
    if (results.status == "success") {
      alert("Engagement deleted successfully.")
      populateEngagements($("#selected-engagement").attr("event_id"));
    } else {
      alert("Error deleting engagement.")
      console.log(results.message)
    }
  })
}

function exportSelectedEngagement()
{
  console.log($("#selected-engagement"))
}

//
// Functions interacting with API
//

const apiRoute = "http://18.222.7.110"

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

function addEvent(options, callback)
{
  let url = `${apiRoute}/api/events`;
  $.post(url, options, function(results) {
    callback(results);
  });
}

function updateEvent(id, options, callback)
{
  $.ajax({
    type: 'PUT',
    url: `${apiRoute}/api/events/${id}`,
    contentType: 'application/json',
    data: JSON.stringify(options),
  }).done(function (results) {
    callback(results);
  }).fail(function (err) {
    console.log(err);
  });
}

function deleteEvent(id, callback)
{
  $.ajax({
    type: 'DELETE',
    url: `${apiRoute}/api/events/${id}`
  }).done(function (results) {
    callback(results);
  }).fail(function (err) {
    console.log(err);
  });
}

function addEngagement(options, callback)
{
  $.ajax({
    type: 'POST',
    url: `${apiRoute}/api/engagements`,
    data: options
  }).done(function (results) {
    callback(results);
  }).fail(function (err) {
    console.log(err);
  });
}

function updateEngagement(id, options, callback)
{
  $.ajax({
    type: 'PUT',
    url: `${apiRoute}/api/engagements/${id}`,
    contentType: 'application/json',
    data: JSON.stringify(options),
  }).done(function (results) {
    callback(results);
  }).fail(function (err) {
    console.log(err);
  });
}

function deleteEngagement(id, callback)
{
  $.ajax({
    type: 'DELETE',
    url: `${apiRoute}/api/engagements/${id}`
  }).done(function (results) {
    callback(results);
  }).fail(function (err) {
    console.log(err);
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

function formatTime(time)
{
  let d = new Date(time);
  let hours = d.getHours();
  let minutes = ('0' + d.getMinutes()).slice(-2);
  let TOD;
  if (hours > 12) {
    hours = hours - 12;
    TOD = "PM";
  } else {
    TOD = "AM"
  }
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${hours}:${minutes} ${TOD}`;
}