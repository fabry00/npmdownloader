// App js
(function() {
  addLog(false,"Starting applciation");
    $.getJSON("port.json", function(data) {
        init(data.port);
        start(data.port);
    });

    $("#pkg_text").val('{\n' +
        '"name": "example",\n' +
        '"version": "1.0.0",\n' +
        '"private": true,\n' +
        '"dependencies": {\n' +
        '    "morgan": "^1.0.0"\n' +
        ' }\n' +
        '}'
    );

})();
var connected = false;
var socket = null;

function init(port) {
    addLog(false, "Waiting for server connection");
    setTimeout(
        function() {
            if (!connected) {
                $(".submitbt").attr("disabled", "disabled");
            }
        }, 1000
    );
    initSocket(port);

    $("#gitCpy").on("click", function() {
        showHide($("#gitUpload").attr("href"), $("#gitBtn").attr("href"))
    });
    $("#gitUpload").on("click", function() {
        showHide($("#gitCpy").attr("href"), $("#gitBtn").attr("href"))
    });
    $("#gitBtn").on("click", function() {
        showHide($("#gitCpy").attr("href"), $("#gitUpload").attr("href"))
    });

    $("#gitCpy").trigger("click");

    $("#clearconsole").on("click", function() {
        clear();
    });

      $("#download").on("click",function(){
        download(  $("#download").attr("data-link"));
      });
}

function download(link){
  window.location = HOST+":3003/download/"+link;
}

function showHide(obj, obj2) {

    if ($(obj).attr("aria-expanded") == "true") {
        $(obj).attr("aria-expanded", "false");
        $(obj).removeClass("in");
        $(obj).css("height", "0px");
    }
    if ($(obj2).attr("aria-expanded") == "true") {
        $(obj2).css("height", "0px");
        $(obj2).removeClass("in");
        $(obj2).attr("aria-expanded", "false");
    }

}

function clear() {
    $("#console_cnt").html("");
}

function addLog(isError, log) {
    console.log("addLog: " + isError + " log:" + log);
    var classIfno = "";
    var errorIcon = "<span class=\"glyphicon glyphicon-alert\" aria-hidden=\"true\"></span>";
    var infoIcon = "<span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>";
    info = "<span class=''>"+infoIcon+"</span>";
    if(isError){
       info = "<span class='alert-danger'>"+errorIcon+"</span>"
       classIfno = 'alert-danger';
    }
    var html = "<div class=\"row\">";
    html += "<div class=\"col col-md-1 "+classIfno+"\">" + info + "</div>";
    html += "<div class=\"col2 col-md-11\">" + log + "</div>";
    html += "</div>"
    $("#console_cnt").append(html);
    $("#console_cnt").scrollTop($("#console_cnt")[0].scrollHeight);
}

function initSocket(port) {
    if (typeof io == 'undefined') {
        var msg = "Server down, retry later!";
        showError(msg);
        addLog(true, msg);
        return;
    }
    socket = io.connect(HOST+':' + port);

    // Add a connect listener
    socket.on('connect', function() {
        $("#alertCont").hide();
        addLog(false, "connected to the server!");
        $(".submitbt").removeAttr("disabled");
        connected = true;
        /*setTimeout(function() {
            console.log("emit signal");
            socket.emit('test_msg', "msg from client");
        }, 5000);*/
    });

    // Add a disconnect listener
    socket.on('disconnect', function() {
        console.log('The client has disconnected!');
        addLog(true, "Client disconnected from the server, waiting for connection!");
        showError("Client disconnected from the server, waiting for connection!");
        $(".submitbt").attr("disabled", "disabled");
        connected = false;
    });
    // Add a connect listener
    socket.on('message', function(data) {
        console.log('Received a message from the server!', data);
        addLog(false, "Received a message from the server!");
    });
    socket.on('test_msg', function(data) {
        addLog(false,data.mes);
    });

    socket.on('err_msg', function(data) {
        console.log('Received err_msg!', data);
        addLog(true, data.mes);
        showError(data.mes);
    });

    socket.on('download_link', function(data) {
        console.log('download_link Received!', data.link);
        $("#prj_name").html(data.name);
        $("#prj_size").html(data.size);
        addLog(false, data.link);
        $("#download").attr("data-link",data.link);
        $("#download").removeAttr("disabled");
        //showError(data.mes);
    });

    socket.on('jobs', function(data) {
        console.log('jobs', data);
        $("#jobs").html(data.mes);
        //showError(data.mes);
    });

    socket.on('total_jobs', function(data) {
        console.log('total_jobs', data);
        $("#total_jobs").html(data.mes);
        //showError(data.mes);
    });

    socket.on('job_end', function(data) {
        console.log('job_end', data);
        addLog(false,"Job end");
        $("#loading").hide();
        $(".submitbt").removeAttr("disabled");
    });

}

function start(port) {
    this.port = port;
    console.log("REST PORT: " + port);

    // initialize with defaults
    $("#input-1").fileinput();

    $("#submit_text").on("click", function(e) {
        e.preventDefault();
        console.log("send text");
        var txt = $("#pkg_text").val();
        sendPackage("method_text", txt);
        return false;
    });

    function sendPackage(type, content) {
        $("#alertCont").hide();
        $(".submitbt").attr("disabled","disabled");
        $("#loading").show();
        $("#prj_name").html("");
        $("#prj_size").html("");
        socket.emit(type, content);

        /*$.ajax({
            type: 'POST',
            url: 'http://server:' + this.port + '/' + type,
            data: {
                content: content
            },
            dataType: 'json',
            success: function(data) {
                console.log("success: ", data);
            },
            error: function(error) {
                console.log("error: ", error.responseText);
                showError(error.responseText);
            }
        });*/
    }

    function hideError() {
        $("#alertCont").hide();
    }
}

function showError(err) {
    console.log("showError: " + err);
    $("#errcontainer").html(err);
    $("#alertCont").show();
}
