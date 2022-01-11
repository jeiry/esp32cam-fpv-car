/* eslint-disable */
import './websocketcar.css'

export default {
    components: {
    },
    data() {
        return {
            url: "",
            websocket: null,
            ledon: false,
            status: 0,
            u: '',
            p: '',
            port: "",
            canvas1: '',
            ctx1: '',
            canvas2: '',
            ctx2: '',
        }
    },
    mounted() {
        this.u = this.$route.params.u //你的websocket用户名
        this.p = this.$route.params.p //你的websocke密码
        this.port = this.$route.params.port //你的websocke端口
        this.initWebSocket();
        ////
        document.body.addEventListener(
            "touchstart",
            function (e) {
              if (e.target.id == "canvas1") {
                
                this.ctrlleft(e.targetTouches[0].pageX,e.targetTouches[0].pageY)
              }else if (e.target.id == "canvas2") {
                console.log('touchstart',e.targetTouches[0].pageX,e.targetTouches[0].pageY)
                this.ctrlright(e.targetTouches[0].pageX,e.targetTouches[0].pageY)
              }
            }.bind(this),
            false
          );
          document.body.addEventListener(
            "touchend",
            function (e) {
              if (e.target.id == "canvas1") {
                console.log("touchend");
                this.action(0)
              }
            }.bind(this),
            false
          );
          document.body.addEventListener(
            "touchmove",
            function (e) {
              if (e.target.id == "canvas1") {
                
                // console.log('touchmove',e.targetTouches[0].pageX,e.targetTouches[0].pageY)
              }
            }.bind(this),
            false
          );

        ////

        this.canvas1 = document.getElementById("canvas1");
        this.ctx1 = canvas1.getContext('2d');
        this.drawl(this.ctx1, 0);

        this.canvas2 = document.getElementById("canvas2");
        this.ctx2 = canvas2.getContext('2d');
        this.drawr(this.ctx2, 0);
    },

    created() {
        var _this = this;
        document.addEventListener("keydown", _this.watchKeyDown);
        document.addEventListener("keypress", _this.watchKeyPress);
        document.addEventListener("keyup", _this.watchKeyUp);
    },
    destroyed() {
        //移除监听回车按键
        var _this = this;
        document.removeEventListener("keydown", _this.watchKeyDown);
        document.removeEventListener("keypress", _this.watchKeyPress);
        document.removeEventListener("keyup", _this.watchKeyUp);
    },

    methods: {
        watchKeyDown(e) {
            var keyNum = window.event ? e.keyCode : e.which;
            console.log("--", keyNum)
            if (keyNum == 13) {
                if (this.ledon == false) {
                    this.action(10)
                    this.ledon = true
                } else {
                    this.action(11)
                    this.ledon = false
                }

            } else if (keyNum == 66) {
                this.action(12)

            }
        },
        watchKeyPress(e) {
            var keyNum = window.event ? e.keyCode : e.which;
            console.log("====",keyNum)
            if (keyNum == 119) {
                // 前
                if (this.status != 119) {
                    this.status = 119
                    this.action(1)
                }
            } else if (keyNum == 115) {
                // 后
                if (this.status != 115) {
                    this.status = 115
                    this.action(4)
                }
            } else if (keyNum == 97) {
                // 左
                if (this.status != 97) {
                    this.status = 97
                    this.action(2)
                }
            } else if (keyNum == 100) {
                // 右
                if (this.status != 100) {
                    this.status = 100
                    this.action(3)
                }
            }else if (keyNum == 11) {
                if (this.ledon == false) {
                    this.action(10)
                    this.ledon = true
                } else {
                    this.action(11)
                    this.ledon = false
                }
            }
            

            // }
        },
        watchKeyUp(e) {
            if (this.status != 0) {
                this.status = 0
                this.websocket.send('{"action":"action","left":"stop","right":"stop"}');
            }

        },
        initWebSocket() {
            var that = this
            var wsUri = "ws://ws.yoyolife.fun:" + this.port + "/";
            this.websocket = new WebSocket(wsUri);
            this.websocket.onopen = function (evt) {
                that.onOpen(evt)
            };
            this.websocket.onclose = function (evt) {
                that.onClose(evt)
            };
            this.websocket.onmessage = function (evt) {
                that.onMessage(evt)
            };
            this.websocket.onerror = function (evt) {
                that.onError(evt)
            };
        },
        onOpen(evt) {
            this.websocket.send('{"action":"login","username":"' + this.u + '","password":"' + this.p + '","type":"web"}');
            console.log("CONNECTED")
        },
        onClose(evt) {
            console.log("DISCONNECTED")
        },
        onMessage(evt) {
            // console.log(evt.data)
            //创建FileReader对象，该对象时html5中的特有对象，详细用法可以//参照html5相关资料
            var reader = new FileReader();

            //设置FileReader对象的读取文件回调方法
            reader.onload = function (eve) {
                //判断文件是否读取完成
                if (eve.target.readyState == FileReader.DONE) {
                    //读取文件完成后，创建img标签来显示服务端传来的字节数//组
                    var img = document.getElementById("show");
                    //读取文件完成后内容放在this===当前
                    //fileReader对象的result属性中，将该内容赋值img标签//浏览器就可以自动解析内容格式并且渲染在浏览器中
                    img.src = this.result;
                    //将标签添加到id为show的div中否则，即便是有img也看不见
                    // document.getElementById("show") = img;
                }
            };

            //调用FileReader的readAsDataURL的方法自动就会触发onload事件
            reader.readAsDataURL(event.data);
        },
        onError(evt) {
            console.log(evt.data)
        },
        keyup(e){
            console.log('keyup',e)
        },
        action(e) {
            console.log(e)
            if (e == 0) {
                this.websocket.send('{"action":"action","left":"stop","right":"stop"}');
            } else if (e == 1) {
                this.websocket.send('{"action":"action","left":"forward","right":"forward"}');
            } else if (e == 2) {
                this.websocket.send('{"action":"action","left":"forward","right":"backward"}');
            } else if (e == 3) {
                this.websocket.send('{"action":"action","left":"backward","right":"forward"}');
            } else if (e == 4) {
                this.websocket.send('{"action":"action","left":"backward","right":"backward"}');
            } else if (e == 10) {
                this.websocket.send('{"action":"led4","cmd":"on"}');
            } else if (e == 11) {
                this.websocket.send('{"action":"led4","cmd":"off"}');
            } else if (e == 12) {
                this.websocket.send('{"action":"bee","cmd":"on"}');
            }

        },
        drawl(ctx) {

            ctx.fillStyle = "#FFFF";
            ctx.beginPath();
            ctx.arc(70,40,20,0,Math.PI*2,true);
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(25,85,20,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(115,85,20,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(70,125,20,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();
        },
        drawr(ctx) {

            ctx.fillStyle = "#FFFF";
            ctx.beginPath();
            ctx.arc(25,127,20,0,Math.PI*2,true);
            ctx.lineWidth = 6;
            ctx.stroke();
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(85,127,20,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.arc(145,127,20,0,Math.PI*2,true);
            ctx.stroke();
            ctx.closePath();
            ctx.fill();
        },
        ctrlleft(x,y){
            if(x > 64 && y > 222 && x < 90 && y < 249){
                this.action(1)
            }else if(x > 24 && y > 270 && x < 45 && y < 298){
                this.action(2)
            }else if(x > 111 && y > 267 && x < 136 && y < 298){
                this.action(3)
            }else if(x > 67 && y > 308 && x < 90 && y < 338){
                this.action(4)
            }
        },
        ctrlright(x,y){
            if(x > 220 && y > 312 && x < 248 && y < 340){
                this.action(10)
            }else if(x > 280 && y > 312 && x < 306 && y < 340){
                this.action(11)
            }else if(x > 343 && y > 312 && x < 365 && y < 340){
                this.action(12)
            }
        }
    }
}
