# Load Google Analytics
  _gaq = _gaq or []
  _gaq.push ["_setAccount", "UA-26076327-1"]
  _gaq.push ["_trackPageview"]

  (->
    ga = document.createElement("script")
    ga.type = "text/javascript"
    ga.async = true
    ga.src = "https://ssl.google-analytics.com/ga.js"
    s = document.getElementsByTagName("script")[0]
    s.parentNode.insertBefore ga, s
  )()
