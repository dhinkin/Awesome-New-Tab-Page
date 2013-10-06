/** Awesome New Tab Page
  *   antp.co
  *   Copyright 2011-2013 Michael Hart (h4r7.me)
  * Want to make it even more awesome?
  *   github.antp.co
  *
  * Licensed under GPL v3:
  *   http://www.gnu.org/licenses/gpl-3.0.txt
  *   Further Restrictions:
  *     To make use of or modify the below code in any way:
  *     - You agree to leave this copyright and license notice intact without
  *       modification.
  *     - You agree to mark your modified versions as modified from the original
  *       version.
  *     - You agree not to misrepresent the origin of this material or your
  *       relationship with the authors of this project or the project itself.
  *       You agree not to use the "Awesome New Tab Page" name (or a confusingly
  *       similar name) or logo.
  **/


// Utility Functions
  var util = util || {};

  util.toArray = function(list) {
    return Array.prototype.slice.call(list || [], 0);
  };

// localStorage shortcuts
  var store = {
    // store.set("key", "obj")
    set: function(key, obj) {
      return localStorage.setItem(
        key,
        JSON.stringify(obj)
      );
    },
    // store.get("key")
    get: function(key) {
      return JSON.parse(
        localStorage.getItem(key)
      );
    }
  }

// Variables that are relatively static

  var stock_widgets = {
    webstore: {
      where: [2,4],
      size: [1,1],
      type: "app",
      isApp: true,
      enabled: true,
      name: "Chrome Web Store",
      color: "rgba(0, 16, 186, 1)",
      id: "webstore",
      stock: true,
      img: "app.webstore.png",
      simg: "app.webstore.png",
      appLaunchUrl: "https://chrome.google.com/webstore?utm_source=webstore-app&utm_medium=awesome-new-tab-page"
    },
    getwidgets: {
      where: [2,3],
      size: [1,1],
      type: "app",
      isApp: true,
      enabled: true,
      name: "Get Widgets",
      color: "rgba(0, 160, 60, 1)",
      id: "webstore",
      stock: true,
      img: "/images/antp-flat-128.png",
      simg: "/images/antp-flat-128.png",
      appLaunchUrl: "http://dev.antp.co/widgets"
    },
    tutorial: {
      where: [0,0],
      size: [2,2],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Tutorial",
      id: "tutorial",
      path: "widgets/tutorial/widget.tutorial.html"
    },
    clock: {
      where: [1,2],
      size: [1,1],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Clock",
      id: "clock",
      path: "widgets/clock/widget.clock.html"
    },
    notepad: {
      where: [2,2],
      size: [1,1],
      type: "iframe",
      isApp: false,
      enabled: false,
      stock: true,
      name: "Notepad",
      id: "notepad",
      path: "widgets/notepad/widget.notepad.html"
    },
    google: {
      where: [0,2],
      size: [1,2],
      type: "iframe",
      isApp: false,
      stock: true,
      name: "Google",
      id: "google",
      path: "widgets/google/widget.google.html"
    },
    facebook: {
      where: [0,4],
      size: [1,1],
      type: "app",
      isApp: true,
      stock: true,
      name: "Facebook",
      name_show: false,
      color: "rgba(19, 54, 131,  1)",
      img: "/widgets/facebook/widget.facebook.png",
      simg: "/widgets/facebook/widget.facebook.png",
      appLaunchUrl: "http://www.facebook.com/",
      id: "facebook"
    },
    twitter: {
      where: [1,4],
      size: [1,1],
      type: "app",
      isApp: true,
      stock: true,
      name: "Twitter",
      name_show: false,
      color: "rgba(51, 204, 255,  1)",
      img: "/widgets/twitter/widget.twitter.png",
      simg: "/widgets/twitter/widget.twitter.png",
      appLaunchUrl: "http://www.twitter.com/",
      id: "twitter"
    }
  };

  var palette =
    [
      "rgba(51,   153,  51,    1)",
      "rgba(229,  20,   0,     1)",
      "rgba(27,   161,  226,   1)",
      "rgba(240,  150,  9,     1)",
      "rgba(230,  113,  184,   1)",
      "rgba(153,  102,  0,     1)",
      "rgba(139,  207,  38,    1)",
      "rgba(255,  0,    151,   1)",
      "rgba(162,  0,    225,   1)",
      "rgba(0,    171,  169,   1)"
    ];

  var gradient = ", -webkit-gradient( linear, right bottom, left top, color-stop(1, rgba(255, 255, 255, .04)), color-stop(0, rgba(255, 255, 255, 0.35)) )";

  // For Google Analytics
  var _gaq = _gaq || [];

// Check if there are stored widgets
if( localStorage.getItem("widgets") === null ) {
  // If not, use stock widgets

  // Remove disabled widgets
  var _stock_widgets = {};
  for ( var w in stock_widgets ) {
    if ( stock_widgets[w].enabled !== false ) {
      _stock_widgets[w] = stock_widgets[w];
    }
  }

  store.set("widgets", _stock_widgets );
}

// display messages to be displayed on page refresh
var msg = localStorage.msg;
if (msg) {
  msg = JSON.parse(msg);
  setTimeout(function() {
    $.jGrowl(msg.message, { header: msg.title });
  }, 500);
  localStorage.removeItem("msg");
}

// Load widget settings
var widgets = JSON.parse(localStorage.getItem("widgets"));

var extensions;
// Get all installed extensions and apps
chrome.management.getAll( function(data) {
  extensions = data;
});

// Reload page
function reload() {
  window.location.reload( true );
}

// Save changes to the widgets variable in localStorage & optionally refresh
function localStorageSync(refresh) {
  localStorage.setItem("widgets", JSON.stringify( widgets ));

  if(refresh === true) {
    $(window).trigger("antp-widgets");
  }
}

// Generate a GUID-style string, such as "96b78e42-df07-b6a1-50d1-e8848fa5f788"
function new_guid() {
  var S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// Function to merge all of the properties from one object into another
// Object.merge(object, object)
if (typeof Object.merge !== "function") {
  Object.merge = function (o1, o2) {
    for(var i in o2) { o1[i] = o2[i]; }
    return o1;
  };
}

function _e(_eNum) {
  console.log("Error #"+_eNum);
}

/* URL Handler :: Start */

  var url_handler = false;
  $(document).on("mousedown", ".url", function(e) {

    var url = $(this).attr("data-url");

    if ( url && typeof(url) === "string" && url !== "" ) {
      url_handler = url;
    } else {
      url_handler = false;
    }

    $(this).attr("href", url);

    if ( ( e.which === 2 )
    ||   ( e.ctrlKey === true && e.which !== 3 ) ) {
      $(this).attr("href", null);
    }
  });

  $(document).on("mouseup", document, function(e) {
    url_handler = false;
  });

  $(document).on("mouseup", ".url", function(e) {

    // Ctrl + Click = Open in new tab
    if ( e.which !== 3 ) {
      if ( e.ctrlKey === true ) {
      	e.which = 2;
      }
      if (e.metaKey === true ) {
        e.which = 3;
      }
    }

    var url = $(this).attr("data-url");

    if ( url && typeof(url) === "string" && url !== ""
    &&   url_handler && url_handler === url ) {

      if ( e.shiftKey !== true ) {
        if ( e.which === 1 ) {
          if ( $(this).attr("onleftclick") === "pin" ) {
            chrome.tabs.getCurrent(function(tab) {
              chrome.tabs.create({ url: (url), pinned: true });
              chrome.tabs.remove( tab.id );
            });
          } else if ($(this).attr("onleftclick") === "newtab") {
            $(this).attr("href", "#");
            chrome.tabs.create({ url: (url), active: false });
          } else if ( url.match(/^(http:|https:|chrome-extension:)/) ) {
            window.location = url;
          } else {
            // Left click, open a new one and close the current one
            chrome.tabs.getCurrent(function(tab) {
              chrome.tabs.create({ url: (url) });
              chrome.tabs.remove( tab.id );
            });
          }
        } else if ( e.which === 2 ) {
          chrome.tabs.create({ url: (url), active: false });
        }
      }
    }
    else if ((!url || url === "") && ($(this).closest(".app").attr("type") == "app" || $(this).closest(".app").attr("type") == "packaged_app")) {
      if (e.which == 1 || e.which == 2) {
        var app = $(this).closest(".app");
        if (app.length > 0)
          chrome.management.launchApp(app.attr("id"));

        if (e.which == 1)
          chrome.tabs.getCurrent(function(tab) {
            chrome.tabs.remove([tab.id]);
          });
      }
    }

    $(this).delay(100).queue(function() {
      $(this).attr("href", url);
    });

    url_handler = false;
  });

  /* URL Handler :: End */

/* START :: Preferences */

  var DEFAULTS = { // uses localStorage keys
    "perm-grid":        true,
    "hideScrollbar":    false,
    "hideLeftButtons":  false,
    "disableHscroll":   false,
    "hideRCTM":         false,
  };

  var preference = {
    get: function(key) {
      var value = localStorage.getItem(key);

      if ( !value && DEFAULTS[key] ) {
        localStorage.setItem(key, DEFAULTS[key]);
        return DEFAULTS[key];
      }

      var yesorno = {
        "yes": true,
        "no": false,
        "true": true,
        "false": false
      }

      if ( typeof yesorno[value] === "boolean" ) {
        return yesorno[value];
      }

      return value;
    },
    set: function(key, value) {
      if ( value === null ) {
        localStorage.removeItem(key);
        return;
      }

      localStorage.setItem(key, value);
    }
  };

  /* END :: Preferences */
