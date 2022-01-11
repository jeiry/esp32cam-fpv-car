# esp32cam-fpv-car

硬件连接web成功时向websocket发送一个登录包json是
```
webSocket.sendTXT(" {\"action\":\"login\",\"username\":\"" + String(wusername) + "\",\"password\":\"" + String(wpassword) + "\",\"type\":\"cam\"}");
```
type是cam

web端登陆websocket后向服务器发一个登录包json是
```
 this.websocket.send('{"action":"login","username":"' + this.u + '","password":"' + this.p + '","type":"web"}');
```

我这提供的服务器只能一个硬件登陆，也只能一个控制端登录。

# 接线部分

电机驱动在这购买

https://item.taobao.com/item.htm?spm=a1z09.2.0.0.442b2e8dPcmqgz&id=40142079797&_u=b2jm2j62133

A1 -- gpio12

A2 -- gpio13

A3 -- gpio15

A4 -- gpio14

gpio2是蜂鸣器


其它io不要再接线了，因为接了后摄像头就不能用了
