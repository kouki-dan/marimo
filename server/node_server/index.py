#!/usr/local/bin/python 
# coding: utf-8 

import MySQLdb
import cgi,re

con = MySQLdb.connect(host = "localhost",db = "rank",user = "rank_twitter",passwd = "ぱっすわーど（あくようげんきん！)",charset = "utf8")
cur = con.cursor(MySQLdb.cursors.DictCursor)

num = cur.execute("SELECT twitterID,rank,screen_name FROM rank ORDER BY rank DESC")
res = cur.fetchall()

html = """<!DOCTYPE html>
<head>
<meta charset="UTF-8">
<title>ranking</title>
</head>
<body>
<table>
%s
</table>
</body>
"""


table_row = """<tr><td>%d</td><td>%s</td><td>%d</td></tr>"""
count = 1
table = "<tr><td>rank</td><td>twitterID</td><td>rating</td></tr>"
tw_link = '<a href="http://twitter.com/%s">%s</a>'
for x in res:
  s = x["screen_name"].encode("utf-8")
  s = re.sub("'","&#39",cgi.escape(s,True))
  table += table_row % (
            count,
            tw_link % (s,s),
            x["rank"]
            )
  count += 1


print "Content-type:text/html;charset=utf-8;"
print
print html % table

