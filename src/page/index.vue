<template>
  <div class="index flex" :style="{width: size+'px'}">
    <img :width="size" :height="size" :src="processedImg"/>
    <label>
      <b>五星大小:</b>
      <el-slider :disabled="!gotImg" v-model="hqSize" :max="size/2" :min="50" @input="generate()"></el-slider>
    </label>
    <label>
      <b>渐变大小:</b>
      <el-slider :disabled="!gotImg" v-model="jbSize" :max="size*1.5" :min="size*0.5" @input="generate()"></el-slider>
    </label>
    <label>
      <b>渐变位置:</b>
      <el-slider :disabled="!gotImg" v-model="jbPos" :max="100" :min="-200" @input="generate()"></el-slider>
    </label>
    <label>
      <b>渐变区间:</b>
      <el-slider :disabled="!gotImg" v-model="jbOffset" :max="8" :min="2" @input="generate()"></el-slider>
    </label>
    <div class="operate flex">
      <el-button class="choose" type="primary" @click="$refs.input.click()">选择图片</el-button>
      <el-button v-if="canSave" class="save" type="primary" @click="save">下载</el-button>
    </div>
    <el-link class="github" href="https://github.com/yunyuyuan/gq-avatar" target="_blank" type="primary"><svg class="icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M512 42.666667A464.64 464.64 0 0 0 42.666667 502.186667 460.373333 460.373333 0 0 0 363.52 938.666667c23.466667 4.266667 32-9.813333 32-22.186667v-78.08c-130.56 27.733333-158.293333-61.44-158.293333-61.44a122.026667 122.026667 0 0 0-52.053334-67.413333c-42.666667-28.16 3.413333-27.733333 3.413334-27.733334a98.56 98.56 0 0 1 71.68 47.36 101.12 101.12 0 0 0 136.533333 37.973334 99.413333 99.413333 0 0 1 29.866667-61.44c-104.106667-11.52-213.333333-50.773333-213.333334-226.986667a177.066667 177.066667 0 0 1 47.36-124.16 161.28 161.28 0 0 1 4.693334-121.173333s39.68-12.373333 128 46.933333a455.68 455.68 0 0 1 234.666666 0c89.6-59.306667 128-46.933333 128-46.933333a161.28 161.28 0 0 1 4.693334 121.173333A177.066667 177.066667 0 0 1 810.666667 477.866667c0 176.64-110.08 215.466667-213.333334 226.986666a106.666667 106.666667 0 0 1 32 85.333334v125.866666c0 14.933333 8.533333 26.88 32 22.186667A460.8 460.8 0 0 0 981.333333 502.186667 464.64 464.64 0 0 0 512 42.666667"></path></svg>Github</el-link>
  </div>
  
  <input ref="input" style="display: none" type="file" accept="image/*" @input="inputImg"/>
  <canvas :width="size" :height="size" ref="canvas" style="display: none"/>
  
  <el-dialog class="dialog" v-if="showPicker" :model-value="true" title="裁剪图片" :close-on-click-modal="false">
    <cropper :show="showPicker" :stamp="stamp" :originImg="originImg" @getImg="getImg"/>
    <template #footer>
      <el-button @click="stamp=Date.now()" type="primary">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import Cropper from "../components/cropper.vue";
import IconImg from '../assets/icon.jpg'
import CN1Img from '../assets/CN1.png'
import CN2Img from '../assets/CN2.png'
import {getDataUrl} from "../utils"
import fileSaver from 'file-saver'
import _ from 'lodash'

const size = 500;
const scale = 369/303;

export default {
  name: "index",
  components: {Cropper},
  data(){
    return{
      canvas: null as null | HTMLCanvasElement,
      stamp: 0,
      size,
      showPicker: false,
      originImg: null as File | null,
      gotImg: null,
      processedImg: IconImg,
      processedBlob: null,
      canSave: false,
      hqSize: 150,
      jbSize: size*1.2,
      jbPos: 0,
      jbOffset: 4,
      
      CNImg: null
    }
  },
  created() {
    const img = new Image(369, 303);
    img.src = CN2Img;
    this.CNImg = img;
  },
  mounted (){
    this.canvas = this.$refs.canvas;
  },
  methods: {
    async inputImg(){
      const img: File | undefined = this.$refs.input.files[0];
      if (img) {
        this.originImg = await getDataUrl(img);
        this.showPicker = true;
      }
      this.$refs.input.value = '';
    },
    async getImg (blob: Blob){
      this.showPicker = false;
      const img = new Image(size, size);
      img.src = await getDataUrl(blob);
      img.onload = () => {     
        this.gotImg = img;
        this.generate();
        this.canSave = true;
      }
    },
    generate:  _.throttle(function () {
      const img = this.gotImg;
      const ctx = this.canvas.getContext('2d');
      const {hqSize, jbSize, jbPos, jbOffset} = this;
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const radgrad = ctx.createRadialGradient(0,jbPos,0,0,jbPos+100, jbSize*1.414/1.5);
      radgrad.addColorStop(0, '#d80203');
      radgrad.addColorStop(jbOffset/10, 'rgba(216,2,3,0.8)');
      radgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = radgrad;
      ctx.fillRect(0,0,size,size);
      ctx.drawImage(this.CNImg, 0, 0, this.CNImg.width, this.CNImg.height, 20, 20, hqSize*scale, hqSize);
      this.processedImg = this.canvas?.toDataURL('image/png', 1);
      this.canvas?.toBlob((res: Blob) => {
        this.processedBlob = res;
      }, 'image/png', 1);
    }, 100),
    save (){
      if (this.processedBlob) {
        fileSaver.saveAs(this.processedBlob, 'avatar.png');
      }
    }
  }
}
</script>

<style scoped lang="scss">
.index{
  flex-direction: column;
  margin: auto;
  height: 100%;
  img{
    margin-top: 20px;
  }
  label{
    display: flex;
    align-items: center;
    width: 100%;
    b{
      margin-right: 10px;
    }
    div{
      flex-grow: 1;
    }
  }
  .operate{
    margin: 10px 0;
    button{
      &.save{
        margin-left: 20px;
      }
    }
  }
  .github{
    margin: auto auto 10px auto;
    ::v-deep >span{
      display: flex;
      align-items: center;
    }
    svg{
      width: 30px;
      height: 30px;
      margin-right: 10px;
    }
  }
}
</style>
