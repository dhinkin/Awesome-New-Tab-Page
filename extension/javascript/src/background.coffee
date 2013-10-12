# START :: Recently Closed Tabs & Tab Manager Widget

  onRemoved = (tabId, storage_data) ->
    # Cleanup old data
    localStorage.removeItem "recently_closed"

    # If RCTM is disabled, clear data and return
    if storage_data.settings.recently_closed is false
      storage.remove "closed_tabs"
      return

    open_tabs = storage_data.open_tabs
    closed_tabs = storage_data.closed_tabs or []
    disableRCTM = if typeof storage_data.settings isnt "undefined" and storage_data.settings.disableRCTM then storage_data.settings.disableRCTM else false

    tab = open_tabs.filter((tab) ->
      tab.id is tabId
    )[0]

    return if not tab or tab.incognito is true or tab.title is "" or (tab.url).indexOf("chrome://") isnt -1
    closed_tabs.unshift
      title: tab.title
      url: tab.url

    if closed_tabs.length > 15 then closed_tabs.pop()
    storage.set closed_tabs: closed_tabs
    getAllTabs()

  getAllTabs = ->
    chrome.tabs.getAllInWindow null, getAllTabs_callback

  getAllTabs_callback = (tabs) ->
    storage.set open_tabs: tabs

  chrome.tabs.onRemoved.addListener (tabId) ->
    storage.get ["open_tabs", "closed_tabs", "settings"], (storage_data) ->
      onRemoved(tabId, storage_data)

  chrome.tabs.onMoved.addListener getAllTabs
  chrome.tabs.onCreated.addListener getAllTabs
  chrome.tabs.onUpdated.addListener getAllTabs
  getAllTabs()

# START :: Tab Manager Widget

  $(window).bind "storage", (e) ->
    if e.originalEvent.key is "switch_to_tab"
      unless localStorage.getItem("switch_to_tab") is -1
        id = parseInt(localStorage.getItem("switch_to_tab"))
        chrome.tabs.getSelected null, (tab) ->
          chrome.tabs.remove tab.id  unless id is tab.id

        chrome.tabs.update id,
          active: true

        localStorage.setItem "switch_to_tab", -1
    if e.originalEvent.key is "close_tab"
      id = parseInt(localStorage.getItem("close_tab"))
      if localStorage.getItem("close_tab") isnt "-1"
        chrome.tabs.remove id
        localStorage.setItem "close_tab", "-1"
    if e.originalEvent.key is "pin_toggle"
      id = parseInt(localStorage.getItem("pin_toggle"))
      return false  if typeof id is "null"
      tabs = localStorage.getItem("open_tabs")
      tabs = (if not tabs? then [] else JSON.parse(tabs))
      tab = tabs.filter((tab) ->
        tab.id is id
      )[0]
      if typeof tab is "undefined"
        console.error "Tab wasn't found"
        return false

      # Invert pin state
      chrome.tabs.update id,
        pinned: not tab.pinned

      localStorage.setItem "pin_toggle", "null"

# START :: Get Installed Widgets

  window.reloadExtensions = (data) ->
    window.extensions = data
    window.installedWidgets = {}

    sayHelloToPotentialWidgets()

  buildWidgetObject = (_widget) ->
    extensions = window.extensions;
    widget = {}
    if not _widget.request or not _widget.sender
      console.error "buildWidgetObject:", "Sender missing."
      return null
    else unless _widget.request.body
      console.error "buildWidgetObject:", "Body missing."
      return null
    else unless _widget.request.body.poke
      console.error "buildWidgetObject:", "Poke version not defined."
      return null
    widget.pokeVersion = parseInt(_widget.request.body.poke)
    if widget.pokeVersion is "NaN" or widget.pokeVersion < 1 or widget.pokeVersion > 3
      console.error "buildWidgetObject:", "Invalid poke version."
      return null
    else if widget.pokeVersion is 1
      console.error "buildWidgetObject:", "Support for poke version 1 has been discontinued. Use poke version 3 instead."
      return null
    widget.height = parseInt(_widget.request.body.height)
    widget.width = parseInt(_widget.request.body.width)
    if not widget.width or not widget.height
      console.error "buildWidgetObject:", "Width or Height not defined."
      return null
    if widget.height is "NaN"
      console.error "buildWidgetObject:", "Invalid height."
      return null
    else if widget.width is "NaN"
      console.error "buildWidgetObject:", "Invalid width."
      return null
    else if widget.height > 3 or widget.width > 3
      console.error "buildWidgetObject:", "Width or Height too large."
      return null
    if _widget.sender.name
      widget.name = _widget.sender.name
    else
      if typeof _widget.sender.id is "string"
        widget.name = extensions.filter((ext) ->
          ext.id is _widget.sender.id
        )[0]
      if typeof widget.name isnt "undefined" and typeof widget.name.name is "string"
        widget.name = widget.name.name
      else
        console.error "buildWidgetObject:", "Widget name undefined."
        return null
    widget.id = _widget.sender.id
    widget.img = "chrome://extension-icon/" + widget.id + "/128/0"

    # Poke v2 Checks
    obj = _widget.request.body
    widget.v2 = {}
    if widget.pokeVersion >= 2 and parseInt(obj.v2.min_width) isnt "NaN" and parseInt(obj.v2.max_width) isnt "NaN" and parseInt(obj.v2.min_height) isnt "NaN" and parseInt(obj.v2.max_height) isnt "NaN"
      widget.v2.min_width = (if (parseInt(obj.v2.min_width) < TILE_MIN_WIDTH) then TILE_MIN_WIDTH else parseInt(obj.v2.min_width))
      widget.v2.min_width = (if (parseInt(obj.v2.min_width) > TILE_MAX_WIDTH) then TILE_MAX_WIDTH else parseInt(obj.v2.min_width))
      widget.v2.max_width = (if (parseInt(obj.v2.max_width) < TILE_MIN_WIDTH) then TILE_MIN_WIDTH else parseInt(obj.v2.max_width))
      widget.v2.max_width = (if (parseInt(obj.v2.max_width) > TILE_MAX_WIDTH) then TILE_MAX_WIDTH else parseInt(obj.v2.max_width))
      widget.v2.min_height = (if (parseInt(obj.v2.min_height) < TILE_MIN_HEIGHT) then TILE_MIN_HEIGHT else parseInt(obj.v2.min_height))
      widget.v2.min_height = (if (parseInt(obj.v2.min_height) > TILE_MAX_HEIGHT) then TILE_MAX_HEIGHT else parseInt(obj.v2.min_height))
      widget.v2.max_height = (if (parseInt(obj.v2.max_height) < TILE_MIN_HEIGHT) then TILE_MIN_HEIGHT else parseInt(obj.v2.max_height))
      widget.v2.max_height = (if (parseInt(obj.v2.max_height) > TILE_MAX_HEIGHT) then TILE_MAX_HEIGHT else parseInt(obj.v2.max_height))
      widget.v2.resize = obj.v2.resize
    else
      widget.v2.resize = false
    if widget.pokeVersion is 3
      if typeof _widget.request.body.v3 is "undefined"
        console.error "buildWidgetObject:", "v3 property is missing. v3 property is required in poke version 3."
        return
      else if typeof _widget.request.body.v3.multi_placement is "undefined"
        console.error "buildWidgetObject:", "v3.multi_placement property is missing. v3.multi_placement property is required in poke version 3."
        return
      widget.v3 = _widget.request.body.v3
    else
      widget.v3 = {}
      widget.v3.multi_placement = false
    ext = extensions.filter((ext) ->
      ext.id is widget.id
    )[0]
    widget.path = _widget.request.body.path
    widget.optionsUrl = ext.optionsUrl
    widget

  TILE_MIN_WIDTH = 1
  TILE_MAX_WIDTH = 3
  TILE_MIN_HEIGHT = 1
  TILE_MAX_HEIGHT = 3
  window.extensions = {}
  window.installedWidgets = {}
  chrome.management.getAll reloadExtensions

# START :: External Communication Stuff

  # Attempts to establish a connection to all installed widgets
  sayHelloToPotentialWidgets = (extensions) ->
    extensions = window.extensions;
    for i of extensions
      chrome.extension.sendMessage extensions[i].id, "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-poke"

  # Listens for responses
  onMessageExternal = (request, sender, sendResponse) ->
    if request.head and request.head is "mgmiemnjjchgkmgbeljfocdjjnpjnmcg-pokeback"
      widget = buildWidgetObject(
        request: request
        sender: sender
      )
      window.installedWidgets[widget.id] = widget if widget?
  chrome.extension.onMessageExternal.addListener onMessageExternal

# START :: App installed

  showAppsUI = ->
    tabs = chrome.extension.getViews(type: "tab")
    i = 0
    tab = undefined

    while tab = tabs[i]
      tab.showAppsWindow()
      i++
  chrome.management.onInstalled.addListener (ExtensionInfo) ->
    setTimeout showAppsUI, 1000  if ExtensionInfo.type is "hosted_app" or ExtensionInfo.type is "packaged_app" or ExtensionInfo.type is "legacy_packaged_app"

# START :: On App/Widget uninstalled

  removeWidgetInstances = (id) ->
    widgets = JSON.parse(localStorage.widgets)
    for i of widgets
      delete widgets[i]  if widgets[i].id is id
    localStorage.setItem "widgets", JSON.stringify(widgets)
  chrome.management.onUninstalled.addListener removeWidgetInstances
