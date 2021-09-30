<template>
  <div class="cropper">
    <img :src="originImg" @load="init" ref="img" alt/>
  </div>
</template>

<script lang="ts">
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

export default {
  name: "cropper",
  props: {
    stamp: Number,
    originImg: String,
  },
  data (){
    return {
      cropper: null as Cropper|null,
    }
  },
  emits: ['getImg'],
  watch: {
    '$props.stamp' (){
      this.cropper
        .getCroppedCanvas()
        .toBlob(async (blob) => {
          this.$emit('getImg', blob)
      })
    }
  },
  methods: {
    init (){
      this.cropper = new Cropper(this.$refs.img, {
        aspectRatio: 1,
        autoCropArea: 1,
        viewMode: 1,
        movable: false,
        zoomable: false,
      })
    }
  },
}
</script>

<style scoped lang="scss">
.cropper{
  height: 400px;
  img{
    display: block;
    max-width: 100%;
    height: 100%;
  }
}
</style>
