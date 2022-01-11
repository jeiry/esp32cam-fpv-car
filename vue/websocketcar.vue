<template>
  <div class="main_websocket" >
    <div class="imgdiv" @contextmenu.prevent="">
      <div class="ctrl">
          <div class="left"><canvas id="canvas1"></canvas></div>
          <div class="right"><canvas id="canvas2"></canvas></div>
      </div>
      <!--pic_fill.png是图片还没加载出来时的图，自行替换 -->
      <img id="show" style="width: 100%" src="@/assets/pic_fill.png" /> 
    </div>

    <el-row>
      控制: w向前 s向后 a和d分别是左右，回车是开灯<br />
      按钮b是蜂鸣器响起
      <p></p>
    </el-row>
  </div>
</template>
<script src="./websocketcar.js"></script>
