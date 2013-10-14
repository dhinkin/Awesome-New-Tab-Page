# Awesome New Tab Page
# Copyright 2011-2013 Awesome HQ, LLC & Michael Hart
# All rights reserved.
# http://antp.co http://awesomehq.com

# Error logging with getsentry.com
  if chrome && chrome.app.getDetails().id is "mgmiemnjjchgkmgbeljfocdjjnpjnmcg"
    Raven.config("https://daa268858eb148978bcf2b39fb26891c@app.getsentry.com/14013",
      tags:
        version: chrome.app.getDetails().version
    ).install()

# Utility functions
  window.util = {};
  window.util.toArray = (list) ->
    Array::slice.call list or [], 0

# Variables that are relatively static
  window.stock_widgets =
    webstore:
      where: [2, 4]
      size: [1, 1]
      type: "app"
      isApp: true
      name: "Chrome Web Store"
      color: "rgba(0, 16, 186, 1)"
      id: "webstore"
      stock: true
      img: "app.webstore.png"
      simg: "app.webstore.png"
      appLaunchUrl: "https://chrome.google.com/webstore?utm_source=webstore-app&utm_medium=awesome-new-tab-page"

    getwidgets:
      where: [2, 3]
      size: [1, 1]
      type: "app"
      isApp: true
      name: "Get Widgets"
      color: "rgba(0, 160, 60, 1)"
      id: "getwidgets"
      stock: true
      img: "/images/antp-flat-128.png"
      simg: "/images/antp-flat-128.png"
      appLaunchUrl: "http://dev.antp.co/widgets"

    tutorial:
      where: [0, 0]
      size: [2, 2]
      type: "iframe"
      isApp: false
      stock: true
      name: "Tutorial"
      id: "tutorial"
      path: "widgets/tutorial/widget.tutorial.html"

    clock:
      where: [1, 2]
      size: [1, 1]
      type: "iframe"
      isApp: false
      stock: true
      name: "Clock"
      id: "clock"
      path: "widgets/clock/widget.clock.html"

    google:
      where: [0, 2]
      size: [1, 2]
      type: "iframe"
      isApp: false
      stock: true
      name: "Google"
      id: "google"
      path: "widgets/google/widget.google.html"

    facebook:
      where: [0, 4]
      size: [1, 1]
      type: "app"
      isApp: true
      stock: true
      name: "Facebook"
      name_show: false
      color: "rgba(19, 54, 131,  1)"
      img: "/widgets/facebook/widget.facebook.png"
      simg: "/widgets/facebook/widget.facebook.png"
      appLaunchUrl: "http://www.facebook.com/"
      id: "facebook"

    twitter:
      where: [1, 4]
      size: [1, 1]
      type: "app"
      isApp: true
      stock: true
      name: "Twitter"
      name_show: false
      color: "rgba(51, 204, 255,  1)"
      img: "/widgets/twitter/widget.twitter.png"
      simg: "/widgets/twitter/widget.twitter.png"
      appLaunchUrl: "http://www.twitter.com/"
      id: "twitter"

  window.palette = [
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
  ]

  window.gradient = ", -webkit-gradient( linear, right bottom, left top, color-stop(1, rgba(255, 255, 255, .04)), color-stop(0, rgba(255, 255, 255, 0.35)) )"

# display messages to be displayed on page refresh
  if localStorage.msg
    msg = JSON.parse(localStorage.msg)
    setTimeout (->
      $.jGrowl msg.message,
        header: msg.title

    ), 500
    localStorage.removeItem "msg"

# Reload page
  window.reload = ->
    window.location.reload true

# Generate a GUID-style string
  window.new_guid = ->
    S4 = ->
      (((1 + Math.random()) * 0x10000) | 0).toString(16).substring 1
    S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()

# Function to merge all of the properties from one object into another
# Object.merge(object, object)
  if typeof Object.merge isnt "function"
    Object.merge = (o1, o2) ->
      for i of o2
        o1[i] = o2[i]
      o1

# Log errors to console
  _e = (_eNum) ->
    console.error "Error #" + _eNum

# START :: URL Handler
  url_handler = false
  $(document).on "mousedown", ".url", (e) ->
    url = $(this).attr("data-url")
    if url and typeof (url) is "string" and url isnt ""
      url_handler = url
    else
      url_handler = false
    $(this).attr "href", url
    $(this).attr "href", null  if (e.which is 2) or (e.ctrlKey is true and e.which isnt 3)

  $(document).on "mouseup", document, (e) ->
    url_handler = false

  $(document).on "mouseup", ".url", (e) ->

    # Ctrl + Click = Open in new tab
    if e.which isnt 3
      e.which = 2  if e.ctrlKey is true
      e.which = 3  if e.metaKey is true
    url = $(this).attr("data-url")
    if url and typeof (url) is "string" and url isnt "" and url_handler and url_handler is url
      if e.shiftKey isnt true
        if e.which is 1
          if $(this).attr("onleftclick") is "pin"
            chrome.tabs.getCurrent (tab) ->
              chrome.tabs.create
                url: (url)
                pinned: true

              chrome.tabs.remove tab.id

          else if $(this).attr("onleftclick") is "newtab"
            $(this).attr "href", "#"
            chrome.tabs.create
              url: (url)
              active: false

          else if url.match(/^(http:|https:|chrome-extension:)/)
            window.location = url
          else

            # Left click, open a new one and close the current one
            chrome.tabs.getCurrent (tab) ->
              chrome.tabs.create url: (url)
              chrome.tabs.remove tab.id

        else if e.which is 2
          chrome.tabs.create
            url: (url)
            active: false

    else if (not url or url is "") and ($(this).closest(".app").attr("type") is "app" or $(this).closest(".app").attr("type") is "packaged_app")
      if e.which is 1 or e.which is 2
        app = $(this).closest(".app")
        chrome.management.launchApp app.attr("id")  if app.length > 0
        if e.which is 1
          chrome.tabs.getCurrent (tab) ->
            chrome.tabs.remove [tab.id]

    $(this).delay(100).queue ->
      $(this).attr "href", url

    url_handler = false

  # END :: URL Handler
