// If you want to prevent dragging, uncomment this section
/*
 function preventBehavior(e) 
 { 
 e.preventDefault(); 
 };
 document.addEventListener("touchmove", preventBehavior, false);
 */

/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
 see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
 for more details -jm */
/*
 function handleOpenURL(url)
 {
 // TODO: do something with the url passed in.
 }
 */

/*
 * OpenLayers.Map
 */
var map;

var navSymbolizer = new OpenLayers.Symbolizer.Point({
													pointRadius : 10,
													externalGraphic : "css/images/15x15_Blue_Arrow.png",
													fillOpacity: 1,
													rotation: 0
													});

var navStyle = new OpenLayers.StyleMap({
									   "default" : new OpenLayers.Style(null, {
																		rules : [ new OpenLayers.Rule({
																									  symbolizer : navSymbolizer
																									  })]
																		})
									   });

var navigationLayer = new OpenLayers.Layer.Vector("Navigation Layer",
{
  styleMap: navStyle
});

/*OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
	defaultHandlerOptions: {
		'single': true,
		'double': false,
		'pixelTolerance': 0,
		'stopSingle': false,
		'stopDouble': false
	},
					
	initialize: function(options) {
		this.handlerOptions = OpenLayers.Util.extend(
		 {}, this.defaultHandlerOptions
		);
		OpenLayers.Control.prototype.initialize.apply(
		  this, arguments
		); 
		this.handler = new OpenLayers.Handler.Click(
			this, {
				'click': this.trigger
			}, this.handlerOptions
		);
	}, 
											
	trigger: function(e) {
		navSymbolizer.rotation += 10;
		navigationLayer.redraw();
	}
										
});*/

var WGS84 = new OpenLayers.Projection("EPSG:4326");
var WGS84_google_mercator = new OpenLayers.Projection("EPSG:900913");

function onBodyLoad()
{		
    document.addEventListener("deviceready", onDeviceReady, false);
}

var geolocationSuccess = function(position){
	var lon = position.coords.longitude;
	var lat = position.coords.latitude;
	
	var currentPoint = new OpenLayers.Geometry.Point(lon, lat).transform(WGS84, WGS84_google_mercator);
	var currentPosition = new OpenLayers.Feature.Vector(currentPoint);
	
	navigationLayer.addFeatures([currentPosition]);
	
	map.setCenter(new OpenLayers.LonLat(position.coords.longitude, position.coords.latitude)
				  .transform(WGS84, WGS84_google_mercator), 17);
}

var geolocationError = function(error){
	//error handling
}

var compassSuccess = function(heading){
	navSymbolizer.rotation = heading.magneticHeading;
	navigationLayer.redraw();
}

var compassError = function(error){
	//error handling
	if(error.code == CompassError.COMPASS_INTERNAL_ERR)
		alert("compass internal error");
	else if(error.code == CompassError.COMPASS_NOT_SUPPORTED)
		alert("compass not supported");
	
}

/* When this function is called, PhoneGap has been initialized and is ready to roll */
/* If you are supporting your own protocol, the var invokeString will contain any arguments to the app launch.
 see http://iphonedevelopertips.com/cocoa/launching-your-own-application-via-a-custom-url-scheme.html
 for more details -jm */

var getDeviceUID = function() {
    window.plugins.MyPlugin.getUDID(
        function(udid)      { alert("Passed "+udid.value); return udid.value; },
        function(errorCode) { alert("Failed"); return -1; } );
}

function onDeviceReady()
{
    //ChildBrowser code to open Google.com
    //var cb = ChildBrowser.install();
    //if(cb != null) { window.plugins.childBrowser.showWebPage("http://google.com"); }
        
	// do your thing!
	var docHeight = $(window).height();
	var headerHeight = $("#header").height();
	var footerHeight = $("#footer").height();
	var mapHeight = docHeight - headerHeight - footerHeight - 50;
	
	$("#map").height(mapHeight +"px");
	$("#canvas").height(mapHeight + "px");
	
	
	var maxResolution = 15543.0339;
	var maxExtent = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508);
	var restrictedExtent = maxExtent.clone();
	var touchNavOptions = {
	dragPanOptions: {
	interval: 0, //non-zero kills performance on some mobile phones
	enableKinetic: true
	}
	};
	
	var options = {
	div: "map",
	projection: WGS84,
		numZoomLevels : 20,
	maxResolution: maxResolution,
	maxExtent: maxExtent,
	restrictedExtent: restrictedExtent,
	controls: [
			   new OpenLayers.Control.TouchNavigation(touchNavOptions),
			   //new OpenLayers.Control.ZoomPanel()
			   ],
	layers: [new OpenLayers.Layer.OSM(), navigationLayer]
		//center: new OpenLayers.LonLat(-77.020000, 38.890000).transform(WGS84, WGS84_google_mercator),
		//zoom: 2
	};
	map = new OpenLayers.Map(options);
	
	navigator.geolocation.watchPosition(geolocationSuccess, geolocationError, 
	{
		enableHighAccuracy: true,
		maximumAge: 3000
	});
	
	var compassOptions = {
	frequency: 3000
	};
	
	//navigator.compass.watchHeading(compassSuccess, compassError, compassOptions);
	OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, 
	{
		defaultHandlerOptions : 
		{
			'single' : true, 'double' : false, 'pixelTolerance' : 0, 'stopSingle' : false, 'stopDouble' : false 
		},
		initialize : function (options) 
		{
			this.handlerOptions = OpenLayers.Util.extend( {}, this.defaultHandlerOptions );
			OpenLayers.Control.prototype.initialize.apply( this, arguments );
			this.handler = new OpenLayers.Handler.Click( this, {
				'click' : this.trigger 
			},
				this.handlerOptions );
			},
				trigger : function (e) 
				{
					var lonlat = map.getLonLatFromViewPortPx(e.xy);
					//alert("You clicked near " + lonlat.lat + " N, " + + lonlat.lon + " E");
					navigator.camera.getPicture(function (imageURI) 
					{
						clearQueueDialog();
						addToQueueDialog(imageURI);
						// TODO: This sometimes flashes the map
						$.mobile.changePage('#queue-dialog', 'pop');
					},
						function () { }, 
						{
							quality : 100,
							destinationType : Camera.DestinationType.FILE_URI,
							// DEBUG: This should be CAMERA to force a new pic
							sourceType : Camera.PictureSourceType.SAVEDPHOTOALBUM,
							allowEdit : false
						});
		}
	});

	var click = new OpenLayers.Control.Click();
	map.addControl(click);
	click.activate();
	
	$('#queue-dialog').live('pagehide', function() {
		// TODO: Refresh map
	});
}

function clearQueueDialog() {
	$('#queue-dialog li').not('#queue-list-item-archetype').remove();
}

function addToQueueDialog(imageURI) {
	var $clone = $('#queue-list-item-archetype').clone();	
	$clone.removeAttr('id');
	$clone.find('img').attr('src', imageURI);
	$('#queue-dialog ul').append($clone);
	$clone.show();
}

$(document).ready(function() {
	var $queue_item;

	$('.queue-list-item').live('click', function(e) {
		$queue_item = $(this);
	});

	$('.status-list-item').live('click', function(e) {
		// See the text for the currently selected queue list item
		var $h3 = $queue_item.find('h3');
		$h3.text($(this).text());
	});

	$('#status-submit-button').live('click', function(e) {
		var valid = 0;
		var items = new Array();
		$('#queue-dialog li').find('h3').filter(':visible').each(function() {
			if ($(this).text() !== 'Select a Status') {
				++valid;
				items.push($(this));
			}
		});

		if (valid === 0) {
			navigator.notification.alert('You must set the status for at least one location');
			e.preventDefault();
			e.stopPropagation();
			$(this).removeClass('ui-btn-active');
		}
		else {
			var names = 'Submitted';
			items.forEach(function(elem) {
				// Submit them to the server
				names += '\n' + $(elem).text();
			});
			navigator.notification.alert(names, function() { }, 'Debug', 'Okay');
		}		
	});
});
