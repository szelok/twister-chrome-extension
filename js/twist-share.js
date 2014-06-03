var contentType = "application/json; charset=utf-8";
var authorization = "Basic " + btoa("user:pwd");
var serverUrl = "http://127.0.0.1:28332";
var currentWalletUser = "";

chrome.storage.local.get(
		{"current-wallet-user": currentWalletUser, "server-url": serverUrl},
		function(items) {
			currentWalletUser = items["current-wallet-user"];
			serverUrl = items["server-url"];
		});

$(document).ready(function() {
	chrome.tabs.query({
		active : true,
		currentWindow : true
	}, function(tabs) {
		$("#url").val(serverUrl);
		$("#wallet-user").val(currentWalletUser);
		$("#msg").val("@" + currentWalletUser + " shares " + tabs[0].url);
	});
	
	$("#send").click( function() {
		$("#status p").text("Sending now. Waiting for ack from server.");

		chrome.storage.local.set(
				{"current-wallet-user": $("#wallet-user").val(), "server-url": $("#url").val()},
				function() {
				});
		
		$.ajax({
			type : "POST",
			url : $("#url").val(),
			crossDomain : true,
			contentType : contentType,
			processData : false,
			dataType : "json",
			headers : {
				"Authorization" : authorization
			},
			data : JSON.stringify({
				method : "getlasthave",
				id : 1,
				params : [ $("#wallet-user").val() ]
			}),
			success : function(result, status) {
				console.log("status=" + status);
				var lastHave = result["result"];
				if (lastHave != undefined && lastHave[$("#wallet-user").val()] != undefined) {
					$.ajax({
						type : "POST",
						url : $("#url").val(),
						crossDomain : true,
						contentType : contentType,
						processData : false,
						dataType : "json",
						headers : {
							"Authorization" : authorization
						},
						data : JSON.stringify({
							method : "newpostmsg",
							id : 1,
							params : [ $("#wallet-user").val(), lastHave[$("#wallet-user").val()] + 1, $("#msg").val() ]
						}),
						success : function(undefined, status) {
							console.log("status=" + status);
							$("#status p").text("Sent Successfully");
						},
						error : function(undefined, status, msg) {
							var e = "Error: status=" + status + " msg=" + msg;
							console.log(e);
							$("#status p").text(e);
						}
					});
				} else {
					var e = "Error: " + $("#wallet-user").val() + " seems like not a valid user id";
					console.log(e);
					$("#status p").text(e);
				}
			},
			error : function(undefined, status, msg) {
				var e = "Error: status=" + status + " msg=" + msg;
				console.log(e);
				$("#status p").text(e);
			}
		}).fail(function(undefined, status, msg) {
			var e = "Error: status=" + status + " msg=" + msg;
			console.log(e);
			$("#status p").text(e);
		});

		event.preventDefault();
	});
});