URL shortener microservice
==========================

How to use
----------

A service for creating short urls. You create short urls by visiting `/new/<url>`, where `<url` is the url of the site you are looking to create a short url for.

If you then visit `/<shorturl>`, where `<shorturl>` is the short url, you will be sent to the webpage on the database.

Example creation usage
----------------------
`https://matts-url-shortener.glitch.me/new/https://www.google.co.uk/`

Example creation output
-----------------------
`{"original_url":"https://www.google.com","short_url":3763}`

Usage
-----
`https://matts-url-shortener.glitch.me/3763`

Redirects to
------------
`https://www.google.com`

Made by [Matt K](https://github.com/yobananaboy)
