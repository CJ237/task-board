
let projects = [];
//todo create generateTaskID function to generate a unique ID
function generateTaskID(){
  return crypto.randomUUID();
}

function readProjectsFromStorage() {
 
  let projects = JSON.parse(localStorage.getItem('projects'));

 
  if (!projects) {
    projects = [];
  }

 
  return projects;
}

function saveProjectsToStorage(projects) {
  localStorage.setItem('projects', JSON.stringify(projects));
}

//Todo: create a function to create a task card
function createTaskCard(projects) {
  const taskCard = $('<div>').addClass('card project-card draggable my-3').attr('data-project-id', projects.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(projects.task);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(projects.decription);
  const cardDueDate = $('<p>').addClass('card-text').text(projects.date);
  const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete').attr('data-project-id', projects.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (projects.date && projects.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(projects.date, 'DD/MM/YYYY');

    
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);
  return taskCard;

}


function renderTaskList() {
  const projects = readProjectsFromStorage();

  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

 
  for (let project of projects) {
    if (project.status === 'to-do') {
      todoList.append(createTaskCard(project));
    } else if (project.status === 'in-progress') {
      inProgressList.append(createTaskCard(project));
    } else if (project.status === 'done') {
      doneList.append(createTaskCard(project));
    }
  }


  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
  
    helper: function (e) {
    
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
    
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });

}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  let title = $("#task-title");
  let dueDate = $("#datepicker");
  let taskDes = $("#task-description");

  const tasks = [];
  const tit = title.val();
  const due = dueDate.val();
  const desc = taskDes.val();

  const newtasks = {
    id: generateTaskID(),
    task: tit,
    date: due,
    decription: desc,
    status: "to-do",
  };
  
  const task = readProjectsFromStorage();
  task.push(newtasks);
  saveProjectsToStorage(task);
  renderTaskList();
  title.val("");
  dueDate.val("");
  taskDes.val("");
  
  $('#dialog').dialog('close');
}


 

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {

  const projectId = $(this).attr('data-project-id');
  
  const projects = readProjectsFromStorage();

 
  projects.forEach((project) => {
    console.log(projectId);
    if (project.id === projectId) {
      projects.splice(projects.indexOf(project), 1);
    }
  });
 
 
  saveProjectsToStorage(projects)
  
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const projects = readProjectsFromStorage();

  
  const taskId = ui.draggable[0].dataset.projectId;
 
 
  const newStatus = event.target.id;
  console.log(newStatus);
  
  for (let project of projects) {
    
    
    if (project.id === taskId) {
      project.status = newStatus;
    }
  }
  localStorage.setItem('projects', JSON.stringify(projects));
  renderTaskList();
}


// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {

  $("#forms").on("click", function () {
    $("#dialog").dialog("open");
  });
  

  $("#dialog").dialog({
    autoOpen: false,
    height: 450,
    width: 450,
    show: {
      effect: "blind",
      duration: 500,
    },
    hide: {
      effect: "drop",
      duration: 500,
    },
    buttons: {
      'Add Task': handleAddTask,
    },
    
  });

  $('#datepicker').datepicker({
    changeMonth: true,
    changeYear: true,
  });
  
  

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });
  renderTaskList();
});
