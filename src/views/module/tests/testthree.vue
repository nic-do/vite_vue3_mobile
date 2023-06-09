<script setup name="testthree">
import {
  ref,
  computed,
  watch,
  defineProps,
  getCurrentInstance,
  provide,
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  reactive,
  onMounted
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import JoyStick from '@/components/threejs/joy-stick/joy-stick.vue'
import Is from '@/utils/is'
const props = defineProps(['relationKey'])
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('testthree-relation-Symbol')
const { linkChildren } = useChildren(relationKey)
const calledByChild = function () {}
// 向子组件提供数据和方法
linkChildren({ calledByChild })
/////////////////////////////////////

const i18n_t = inject('i18n_t')

const navDef = reactive({
  nav: PageNavDef.config({
    show: true,
    clickable: true,
    leftArrow: false,
    placeholder: true,
    title: computed(() => {
      // 直接赋值 无响应式，是否有其他方式？？？
      return i18n_t('main.nav.title')
    }),
    leftText: computed(() => {
      return i18n_t('main.nav.leftText')
    }),
    clickLeft: function () {
      return true
    }
  })
})
const containerRef = ref('containerRef')
//透传nav
provide('navParams', navDef)
onMounted(() => {
  // nextTick(function () {
  //   animate()
  // })
})
onActivated(() => {})
onDeactivated(() => {})

import * as THREE from 'three';
import TWEEN from 'three/addons/libs/tween.module.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 2000 );

const controls = new OrbitControls( camera, renderer.domElement );

const scene = new THREE.Scene();

const matFloor = new THREE.MeshPhongMaterial( { color: 0x808080 } );
const matBox = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );

const geoFloor = new THREE.PlaneGeometry( 2000, 2000 );
const geoBox = new THREE.BoxGeometry( 3, 1, 2 );

const mshFloor = new THREE.Mesh( geoFloor, matFloor );
mshFloor.rotation.x = - Math.PI * 0.5;
const mshBox = new THREE.Mesh( geoBox, matBox );

const ambient = new THREE.AmbientLight( 0x111111 );

const spotLight1 = createSpotlight( 0xFF7F00 );
const spotLight2 = createSpotlight( 0x00FF7F );
const spotLight3 = createSpotlight( 0x7F00FF );

let lightHelper1, lightHelper2, lightHelper3;

nextTick(function (){


    init();
    containerRef.value.appendChild( renderer.domElement );
    render();
    animate();
})
function init() {

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    camera.position.set( 46, 22, - 21 );

    spotLight1.position.set( 15, 40, 45 );
    spotLight2.position.set( 0, 40, 35 );
    spotLight3.position.set( - 15, 40, 45 );

    lightHelper1 = new THREE.SpotLightHelper( spotLight1 );
    lightHelper2 = new THREE.SpotLightHelper( spotLight2 );
    lightHelper3 = new THREE.SpotLightHelper( spotLight3 );

    mshFloor.receiveShadow = true;
    mshFloor.position.set( 0, - 0.05, 0 );

    mshBox.castShadow = true;
    mshBox.receiveShadow = true;
    mshBox.position.set( 0, 5, 0 );

    scene.add( mshFloor );
    scene.add( mshBox );
    scene.add( ambient );
    scene.add( spotLight1, spotLight2, spotLight3 );
    scene.add( lightHelper1, lightHelper2, lightHelper3 );

    // document.body.appendChild( renderer.domElement );
    window.addEventListener( 'resize', onWindowResize );

    controls.target.set( 0, 7, 0 );
    controls.maxPolarAngle = Math.PI / 2;
    controls.update();

}

function createSpotlight( color ) {

    const newObj = new THREE.SpotLight( color, 2 );

    newObj.castShadow = true;
    newObj.angle = 0.3;
    newObj.penumbra = 0.2;
    newObj.decay = 2;
    newObj.distance = 50;

    return newObj;

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function tween( light ) {

    new TWEEN.Tween( light ).to( {
        angle: ( Math.random() * 0.7 ) + 0.1,
        penumbra: Math.random() + 1
    }, Math.random() * 3000 + 2000 )
        .easing( TWEEN.Easing.Quadratic.Out ).start();

    new TWEEN.Tween( light.position ).to( {
        x: ( Math.random() * 30 ) - 15,
        y: 15,//( Math.random() * 10 ) +
        z: ( Math.random() * 30 ) - 15
    }, Math.random() * 3000 + 2000 )
        .easing( TWEEN.Easing.Quadratic.Out ).start();
    console.log('----',light.position)
}

function animate() {

    tween( spotLight1 );
    tween( spotLight2 );
    tween( spotLight3 );
    setTimeout( animate, 5000 );

}

function render() {

    TWEEN.update();

    if ( lightHelper1 ) lightHelper1.update();
    if ( lightHelper2 ) lightHelper2.update();
    if ( lightHelper3 ) lightHelper3.update();

    renderer.render( scene, camera );

    requestAnimationFrame( render );

}

</script>
<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div>我是testthree,测试官网例子用</div>
      <div ref="containerRef"></div>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
