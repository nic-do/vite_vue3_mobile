<template>
  <a-entity ref="entity"></a-entity>
</template>

<script>
export default {
  name: 'Entity',
  props: {
    geometry: {
      type: Object,
      required: false,
      default: () => {}
    },
    material: {
      type: Object,
      required: false,
      default: () => {}
    },
    position: {
      type: Object,
      required: false,
      default: () => ({ x: 0, y: 0, z: 0 })
    }
  },
  data() {
    return {
      entity: {}
    }
  },
  mounted() {
    this.entity = this.$refs.entity
    this.updateAttribute('geometry', this.geometry)
    this.updateAttribute('material', this.material)
    this.updateAttribute('position', this.position)
  },
  watch: {
    geometry() {
      this.updateAttribute('geometry', this.geometry)
    },
    material() {
      this.updateAttribute('material', this.material)
    },
    position() {
      this.updateAttribute('position', this.position)
    }
  },
  methods: {
    updateAttribute(key, values) {
      console.log(this.entity)
      this.entity.setAttribute(key, values)
    }
  }
}
</script>
