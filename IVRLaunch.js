var IVRLaunch = {
		host: "api.five9.com",
		version: "ivr",
		domain: "",
		campaign: "",
		layout: null,
		messageError: "<div class='alert alert-error'><button type='button' class='pull-right' data-dismiss='alert'>&times;</button>@ErrorMsg@</div>",
//		messageError: "<div style='height: 49px; display: table-cell; vertical-align: middle; font-weight: bold; font-size: 30px;'>Please call us at +1 888.888.8888</div>",
		parameters: ""
};

IVRLaunch.debug = function() {
    if (typeof window.console != 'undefined') {
        window.console.log(arguments);
    }
};


IVRLaunch.checkAvailability = function() {
	/**
	 * Check if the Visual IVR is available
	 */
	 var host = $("#f9host").val();
	 var version = $("#f9version").val();
	 var domain = $("#f9domain").val();
	 var campaign = $("#f9campaign").val();
	 var parameters = $("#f9parameters").val();

	 if ( host !== "" ) {
	 	IVRLaunch.host = host;
	 }
	 
	 if ( version !== "" ) {
	 	IVRLaunch.version = version;
	 }
	 
	 if ( domain !== "" ) {
	 	IVRLaunch.domain = domain;
	 }
	 
	 if ( campaign !== "" ) {
	 	IVRLaunch.campaign = campaign;
	 }
	 
	 if ( parameters !== "" ) {
	 	IVRLaunch.parameters = parameters;
	 }

	try {
		localStorage.setItem("f9host", host);
		localStorage.setItem("f9version", version);
		localStorage.setItem("f9domain", domain);
		localStorage.setItem("f9campaign", campaign);
		localStorage.setItem("f9parameters", parameters);

		console.log("Five9 Visual IVR fields saved to local storage");
	} catch(e) {
		console.log("Five9 Visual IVR fields could not be saved to local storage");
	}
		 
	var url = "https://" + IVRLaunch.host + "/" + IVRLaunch.version + "/1/domains/" + IVRLaunch.domain + "/campaigns/?name=" + IVRLaunch.campaign;

	$.ajax({
		url: url,
		type: "GET",
		dataType: "json",
		crossDomain: true,
		success: function(data, textStatus, jqXHR) {
			var jsonMessage = data;
			
			IVRLaunch.debug(jsonMessage);
			
			if (jsonMessage.error == null && jsonMessage.count > 0) {
				var items = jsonMessage.items;
				if (items[0].is_visual_ivr_enabled) {
					IVRLaunch.onAvailable(items[0].selfURL);
				} else {
					IVRLaunch.onUnAvailable("Visual IVR is not enabled for the campaign");			
				}
			} else {
				IVRLaunch.onUnAvailable(jsonMessage.error);			
			}
		},
		error: function(jqXHR, textStatus, errorThrown) {
			IVRLaunch.onUnAvailable(textStatus + " " + jqXHR.status + ": " + errorThrown);
		}
	});	
//	$.get(url, function(data) {
//		var jsonMessage = JSON.parse(data);
//		
//		IVRLaunch.debug(jsonMessage);
//		
//		if (jsonMessage.error == null && jsonMessage.count > 0) {
//			var items = jsonMessage.items;
//			if (items[0].is_visual_ivr_enabled) {
//				IVRLaunch.onAvailable(items[0].selfURL);
//			} else {
//				IVRLaunch.onUnAvailable();			
//			}
//		} else {
//			IVRLaunch.onUnAvailable();			
//		}
//	})
//	.fail(function(jqXHR, textStatus, errorThrown) {
//		IVRLaunch.onUnAvailable();
//	});	
};


IVRLaunch.onAvailable = function(url) {
	/**
	 * Add the container to the body
	 */
	$("body").append(IVRLaunch.layout);
	$("body").find("#blockAccess").height($("body").height());
	
	$("#vivrContainer").hide(); 

	/**
	 * Attach the close event 
	 */
	$("#buttonVIVRCloseVIVR").on("click", function() { IVRLaunch.close(); });
	$("#vivrContainer").ready(function() { $("#vivrContainer").show(); });
	
	
	/**
	 * Center the window in the browser frame
	 */
	var x = ($(window).width() - $(".vivrConsole").width()) / 2;
	var y = ($(window).height() - $(".vivrConsole").height()) / 2;        
	
	$(".vivrConsole").css("top", y);
	$(".vivrConsole").css("left", x);
	
	/**
	 * Add VIVR to page
	 */
	// $("#vivrContainer").attr("data", url + "/new_ivr_session");

	var new_ivr_session_url = url + "/new_ivr_session";
	
	if ( IVRLaunch.paramters !== "" ) {
		new_ivr_session_url += "?" + IVRLaunch.parameters;
	}
	
	$("#objectContainer").append("<object id=\"vivrContainer\" type=\"text/html\" width=\"100%\" height=\"100%\" data=\"" + new_ivr_session_url + "\"></object>");

};


IVRLaunch.onUnAvailable = function(errorMsg) {
	/**
	 * The Visual IVR is not accessible, present the contact phone
	 */
	 var text = IVRLaunch.messageError.replace("@ErrorMsg@", errorMsg)
	 
	$("#checkVIVRError").html(text);
};


IVRLaunch.close = function() {
	/**
	 * Remove the entire container from the body
	 */
	$("body").find("#blockAccess").remove();
};


IVRLaunch.init = function() {
	$.support.cors = true;
	
	$("#checkVIVR").on("click", function() { IVRLaunch.checkAvailability(); });
	
	/**
	 * Load the Visual IVR container
	 */
    	$.get("vivrContainer.html" + "?seconds=" + (new Date()).getMilliseconds(), function(data) {
    		IVRLaunch.layout = data;
	});	

	try
	{	
		IVRLaunch.host = localStorage.getItem("f9host");
		IVRLaunch.version = localStorage.getItem("f9version");
		IVRLaunch.domain = localStorage.getItem("f9domain");
		IVRLaunch.campaign = localStorage.getItem("f9campaign");
		IVRLaunch.parameters = localStorage.getItem("f9parameters");
		
		$("#f9host").val(IVRLaunch.host);
		$("#f9version").val(IVRLaunch.version);
		$("#f9domain").val(IVRLaunch.domain);
		$("#f9campaign").val(IVRLaunch.campaign);
		$("#f9parameters").val(IVRLaunch.parameters);
		
		console.log("Five9 Visual IVR fields retrieved from local storage");
	} catch(e) {
		console.log("Five9 Visual IVR fields could not be retrieved from local storage");
	}
};


$(document).ready(function() {
	IVRLaunch.init();
});

