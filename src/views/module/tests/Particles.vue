<template>
  <div>
    <!--        粒子效果-->
    <Particles
      style="position: fixed; top: 0; left: 0; z-index: 0; width: 100vw; height: 100vh"
      id="tsparticles"
      :particlesInit="particlesInit"
      :particlesLoaded="particlesLoaded"
      :options="{
        background: {
          color: {
            value: '#0d47a1'
          }
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: 'push'
            },
            onHover: {
              enable: true,
              mode: 'repulse'
            },
            resize: true
          },
          modes: {
            bubble: {
              distance: 400,
              duration: 2,
              opacity: 0.8,
              size: 40
            },
            push: {
              quantity: 4
            },
            repulse: {
              distance: 200,
              duration: 0.4
            }
          }
        },
        particles: {
          color: {
            value: '#ffffff'
          },
          links: {
            color: '#ffffff',
            distance: 150,
            enable: true,
            opacity: 0.5,
            width: 1
          },
          collisions: {
            enable: true
          },
          move: {
            direction: 'none',
            enable: true,
            outMode: 'bounce',
            random: false,
            speed: 6,
            straight: false
          },
          number: {
            density: {
              enable: true,
              area: 800
            },
            value: 80
          },
          opacity: {
            value: 0.5
          },
          shape: {
            type: 'circle'
          },
          size: {
            random: true,
            value: 5
          }
        },
        detectRetina: true
      }"
    />
    <!--        <Particles-bg type="fountain" :num="5" :bg="true"/>-->
  </div>
</template>

<script>
import Particles from 'vue3-particles'
import { loadFull } from 'tsparticles'
export default {
  name: 'Particles',
    components:{
        Particles
    },
  setup() {
    const particlesInit = async (engine) => {
      await loadFull(engine)
    }

    const particlesLoaded = async (container) => {
      console.log('Particles container loaded', container)
    }
    return {
      particlesInit,
      particlesLoaded
    }
  }
}
</script>

<style scoped></style>
