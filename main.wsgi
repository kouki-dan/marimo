
# coding:utf-8

import tweepy
import sys
import os

consumer_key = "**********************"
consumer_secret = "******************************************"
access_token = "628871113-****************************************"
access_token_secret = "******************************************"

def setup_api():
  auth = tweepy.OAuthHandler(consumer_key,consumer_secret)
  auth.set_access_token(access_token,access_token_secret)
  return tweepy.API(auth)

def put_image(image_path,status):
  api = setup_api()
  path = os.path.abspath(image_path)
  result = api.status_update_with_media(path,status=status)
  ret = {}
  ret["display_url"] = result.entities["media"][0]["display_url"]
  return ret

import cgi
import re
import random
import string
import json
import time
import base64

def randstr(n=3):
  strs = string.digits+string.letters
  return "".join([strs[random.randrange(len(strs))] for x in range(n)])

def application(environ,start_response):
  error = "{'error':'error'}"
  start_response("200 OK",[
                           ("Content-Type","application/json"),
                           ("Access-Control-Allow-Origin","*"),
                           ("Access-Control-Allow-Headers","Content-Type"),
                          ])
  method = environ.get("REQUEST_METHOD","")

  if method == "POST":
    wsgi_input = environ["wsgi.input"]
    content_length = int(environ.get("CONTENT_LENGTH",0))
    query = dict(cgi.parse_qsl(wsgi_input.read(content_length)))

    if not re.match("^[a-zA-Z_]*$",query["id"]):
      return error

    filename = "./picture/f"+str(int(time.time()))+query["id"]+randstr()+".png"
    
    status = "%(name)s(生後%(day)s日) by @%(id)s " % query
    #query["image"]を保存。ファイル名はf+今の日付+ユーザーID+ランダム文字列+".png"

    picture = query["picture"]
    picture = picture.replace(" ","+") #for base64
    picture = base64.b64decode(picture)

    os.chdir("/var/www/marimo")
    f = open(filename,"wb")
    f.write(picture)
    f.close()
    #tweepyでimageを投稿。

    #put_imageの戻り値をjsonで表示
    ret = put_image(filename,status)
    return json.dumps(ret)

  return error

#self.api.last_response = resp
#result.entities["media"][0]["display_url"]


