var accessToken = "db6b486f323c410a82d597f2e1ad6a5c",
      subscriptionKey = "878cd060684e45099834389e8de74e63",
      baseUrl = "https://api.api.ai/v1/",
      $speechInput, // The input element, the speech box
      $recBtn, // Toggled recording button value
      recognition, // Used for accessing the HTML5 Speech Recognition API
      messageRecording = " я слушаю...",
      messageCouldntHear = "я не слышу",
      messageInternalError = "пока я немогу говорить, сначала надо набратся ума",
      messageSorry = "даже и сказать нечего";

$(document).ready(function() {

  $speechInput = $("#speech");
  $recBtn = $("#rec");
  
  $speechInput.keypress(function(event) {
    if (event.which == 13) {
      event.preventDefault();
      send();
    }
  });

  $recBtn.on("click", function(event) {
    switchRecognition();
  });
  
  $(".debug__btn").on("click", function() {
    $(this).next().toggleClass("is-active");
    return false;
  });  
});

function switchRecognition() {
  if (recognition) {
    stopRecognition();
  } else {
    startRecognition();
  }
}

function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.onstart = function(event) {
    respond(messageRecording);
    updateRec();
  };
  recognition.onresult = function(event) {
    recognition.onend = null;

    var text = "";
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
    }
    setInput(text);
    stopRecognition();
  };
  recognition.onend = function() {
    respond(messageCouldntHear);
    stopRecognition();
  };
  recognition.lang = "ru-RUS";
  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  updateRec();
}

function setInput(text) {
  $speechInput.val(text);
  send();
}

function updateRec() {
    $recBtn.html(recognition ? "<i class='fa fa-square'>" : "<i class='fa fa-circle'>");
}
function send() {
  var text = $speechInput.val();
  $.ajax({
    type: "POST",
    url: baseUrl + "query/",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    headers: {
      "Authorization": "Bearer " + accessToken,
      "ocp-apim-subscription-key": subscriptionKey
    },
    data: JSON.stringify({q: text, lang: "en", sessionId: "somerandomthing"}),
    success: function(data) {
      prepareResponse(data);
    },
    error: function() {
      respond(messageInternalError);
    }
  });
}
function prepareResponse(val) {
  
  var spokenResponse = val.result.speech;
  // actionResponse = val.result.action;
  // respond()
  respond(spokenResponse);
  
  var debugJSON = JSON.stringify(val, undefined, 2);
  debugRespond(debugJSON); // Print JSON to Debug window
}
function debugRespond(val) {
  $("#response").text(val);
}
function respond(val) {
  if (val == "") {
    val = messageSorry;
  }
  if (val !== messageRecording) {
    var msg = new SpeechSynthesisUtterance();
    msg.voiceURI = "native";
    msg.text = val;
    msg.lang = "en-US";
    window.speechSynthesis.speak(msg);
  }
  $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(val);
}
