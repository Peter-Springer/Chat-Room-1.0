'use strict';
const Reset       = require('./scss/reset');
const Styles      = require('./scss/styles');
const Chatroom    = require('./chatroom');
const Message     = require('./message');
const User        = require('./user');
const $           = require('jquery');
const input       = $('.input-field');
const sendButton  = $('#send-button');
const counter     = $('.counter');
const showMore    = $('.show-more');
const allMessages = $('.all-messages');
let chatroom      = new Chatroom('title');


function renderMessages() {
  if (chatroom.messages.length < 11) {
    renderAllMessages();
    showMore.hide();
  } else {
    renderTenMessages();
    showMore.show();
  }
}

function renderTenMessages() {
  $('li').remove();
  let totalMessages = chatroom.messages.length;
  if (totalMessages === 0) return;
  for (let i = totalMessages - 10; i < totalMessages; i++){
    if(chatroom.messages[i].username === 'human') {
      createTemplate(chatroom.messages[i].id,'human',chatroom.messages[i].body);
    } else {
      createTemplateAi(chatroom.messages[i].id,'ai',chatroom.messages[i].body);
    }
  }
}

function renderAllMessages() {
  $('li').remove();
  if (chatroom.messages.length === 0) return;
  chatroom.messages.forEach(message => {
    if(message.username === 'human') {
      createTemplate(message.id,'human',message.body);
    } else {
      createTemplateAi(message.id,'ai',message.body);
    }
  });
}

function resetInput () {
  input.val('');
  counter.text('characters: 0');
  sendButton.prop('disabled', true);
}

function generateResponse(input) {
  let type = input.slice(-1);
  if (type === '?') {
    return responses.question[Math.floor(Math.random()*responses.question.length)];
  } else {
    return responses.statement[Math.floor(Math.random()*responses.statement.length)];
  }
}

//message html functions

function createTemplate(id, username, input) {
  allMessages.append(
    `<li class= "message-container" data=${username} id=${id}>
    <p class="message">${username}:
    <span class="body" contenteditable=false>${input}</span>
    <br></br>
    <button class="delete-button"></button>
    <button class="edit-button"></button>
    </p>
    </li>`
  );
}

function createTemplateAi(id, username, input) {
  allMessages.append(
    `<li class="ai-container" data=${username} id=${id}>
    <p class="message-ai">${username}:
    <span class="body">${input}</span>
    </p>
    </li>`
  );
}

//input field listeners

input.on('keyup', function() {
  counter.text('characters: ' + input.val().length);
  if(input.val().length === 0 ) {
    sendButton.prop('disabled', true);
  } else {
    sendButton.prop('disabled', false);
  }
});

input.on('keyup', function() {
  if(input.val().length === 0 ) {
    sendButton.prop('disabled', true);
  } else {
    sendButton.prop('disabled', false);
  }
});

function escapeRegExp(string){
 return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

//send button

sendButton.on('click', function() {
  let id = JSON.stringify(Date.now());
  let message = escapeRegExp(input.val());
  let response = generateResponse(input.val());
  chatroom.appendMessage(id,'human',message);
  resetInput();
  window.setTimeout(function() {
    let id = JSON.stringify(Date.now());
    createTemplateAi(id, 'ai', response);
    chatroom.appendMessage(id,'ai',response);
    renderMessages();}, 1000);
  chatroom.setStorage(chatroom.messages);
  renderMessages();
  });

  input.on('keyup', function (event) {
    if(event.keyCode == 13){
      sendButton.click();
    }
  });


//delete button

allMessages.on('click', '.delete-button', function() {
  let targetId = parseInt(this.closest('li').id);
  chatroom.messages.forEach(message => {
    if (parseInt(message.id) === targetId) {
      let position = chatroom.messages.indexOf(message);
      chatroom.messages.splice(position, 1);
    }
    chatroom.setStorage(chatroom.messages);
  });
  renderMessages();
});

//edit button

allMessages.on('click', '.edit-button', function() {
  $(this).siblings('.body').prop('contenteditable', true);
  $(this).siblings('.body').focus();
});

//save edits on leaving the body

allMessages.on('blur', '.body',function() {
  $(this).prop('contenteditable', false);
  let targetId = parseInt(this.closest('li').id);
  let messageEdit = $(this).text();
  chatroom.messages.forEach(message => {
    if (parseInt(message.id) === targetId) {
      message.body = messageEdit;
    }
    chatroom.setStorage(chatroom.messages);
  });
});

//show more and show less buttons

$('main').on('click', '.show-more',function() {
  renderAllMessages();
  showMore.text('Show Less');
  showMore.prop('class', 'show-less');
});

$('main').on('click', '.show-less', function() {
  renderMessages();
  const showLess = $('.show-less');
  showLess.text('Show More');
  showLess.prop('class', 'show-more');
});

//responses for chatbot

let responses = {
  question: ['It is certain', 'It is decidedly so', 'Without a doubt',
  'Yes, definitely', 'You may rely on it', 'As I see it, yes', 'Most likely',
  'Outlook good', 'Yes', 'Signs point to yes','Reply hazy try again',
  'Ask again later','Better not tell you now', 'Cannot predict now',
  'Concentrate and ask again','Dont count on it','My reply is no',
  'My sources say no','Outlook not so good',
  'Very doubtful'],
  statement: ['Do you even know what you are talking about?',
  'You sound like a crazy person', 'You fool',
  'You are certainly entitled to your own opinions',
  'My cats breath smells like catfood', 'I like waffles', 'Good for you',
  'Dayyum you looking good today','Someone is bossy',
  'Have you thought about how they must feel','Rude','Think before you speak',
  'My mom says not to talk about that subject', 'Shh there are children around',
  'You and I are not so different','When pigs fly','If you insist',
  'I have to agree','Someone is oversharing', '#pluglife'
]
};

chatroom.getStorage();
renderMessages();
