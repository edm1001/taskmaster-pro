var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// sortable functions 
$(".card .list-group").sortable({
  conectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event, ui) {
    $(this).addClass("dropover")
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function(event, ui) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag")
  },
  over: function(event) {
    $(event.target).addClass("dropover-active")
  },
  out: function(event) {
    $(event.target).removeClass("dropover-active")
  },
  update: function() {
    //  loop over current set of children in sortable list
    var tempArr = [];

    $(this).children().each(function(){
      // add task data to temp array as an object
      tempArr.push({
        text: $(this),
        text: text,
        date: date
      .find("p")
      .text()
      .trim(),
      date: $(this)
      .find("span")
      .text()
      .trim()
      });
    });

    // trim down list ID to match obj property
    var arrName = $(this)
    .attr("id")
    .replace("list-", "");
    
    // update array on tasks obj and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance:"touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    $(".bottom-trash").removeClass("bottom-trash-active")
  },
  over: function(event, ui) {
    console.log(ui)
    $(".bottom-trash").addClass("bottom-trash-active")
  },
  out: function(event, ui) {
    console.log(ui);
    $(".bottom-trash").removeClass("bottom-trash-active")
  }
});

  // DATE FUNCTION
  $("#modalDueDate").datepicker({
    // force to select duture date
    minDate:1, 
    onClose: function() {
      // when calendar is closed, "change" event on date input
      $(this).trigger("change");
    }
  });
  var auditTask = function (taskEl) {
    // get date from taskEL
    var date = $(taskEl).find("span").text().trim();

    console.log(date)

    // convert moment object at 5pm
    var time = moment(date, "L").set("hour", 17);

    $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

    if (moment().isAfter(time)) {
      $(taskEl).addClass("list-group-item-danger");
    } else if (Math.abs(moment().diff(time,"days")) <= 2) {
      $(taskEl).addClass("list-group-item-warning")
    }
  }


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

$(".list-group").on("click", "p", function() {
  var text = $(this)
  .text()
  .trim();
  
  var textInput = $("<textarea>")
  .addClass("form-control")
    .val(text);

    $(this).replaceWith(textInput);
    // auto focus new el
    textInput.trigger("focus");
});
// editable el was u n focused
$(".list-group").on("blur", "textarea", function() {
  // get the textarea's current value/text
var text = $(this)
.val();

// get the parent ul's id attribute
var status = $(this)
.closest(".list-group")
.attr("id")
.replace("list-", "");

// get the task's position in the list of other li elements
var index = $(this)
.closest(".list-group-item")
.index();  

tasks[status][index].text = text;
saveTasks();

// recreate p element
var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

// replace textarea with p element
$(this).replaceWith(taskP);
})

// due date was clicked
$(".list-group").on("click", "span", function() {
    // get current text
    var date = $(this)
      .text()
      .trim();
  
    // create new input element
    var dateInput = $("<input>")
      .attr("type", "text")
      .addClass("form-control")
      .val(date);
    // swap out elements
    $(this).replaceWith(dateInput);
    // enable jquery ui datepicker
    dateInput.datepicker({
      minDate: 1
    })
  
    // automatically focus on new element
    dateInput.trigger("focus");
  });

  // value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
    // get current text
    var date = $(this)
      .val();
  
    // get the parent ul's id attribute
    var status = $(this)
      .closest(".list-group")
      .attr("id")
      .replace("list-", "");
    // get the task's position in the list of other li elements
    var index = $(this)
      .closest(".list-group-item")
      .index();
  
    // update task in array and re-save to localstorage
    tasks[status][index].date = date;
    saveTasks();
  
    // recreate span element with bootstrap classes
    var taskSpan = $("<span>")
      .addClass("badge badge-primary badge-pill")
      .text(date);
  
    // replace input with span element
    $(this).replaceWith(taskSpan);

    // pass tasks li el into auditTask to check new due date
    auditTask($(taskSpan).closest(".list-group-item"))
  });

  // remove all tasks
  $("#remove-tasks").on("click", function() {
    for (var key in tasks) {
      tasks[key].length = 0;
      $("#list-" + key).empty();
    }
    console.log(tasks);
    saveTasks();
  });
  
  // load tasks for the first time
  loadTasks();

  setInterval(function () {
    $(".card .list-group-item").each(function(index, el) {
      auditTask(el);
    });
  }, 5000);
