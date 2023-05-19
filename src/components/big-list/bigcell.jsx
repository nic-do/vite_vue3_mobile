import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    avatar: {
      type: String
    },
    message: {
      type: String
    },
    index: {
      type: Number
    }
  },
  setup(props) {
    const render = () => {
      return (
        <div>
          <div>
            <img src="{props.avatar}" key="{avatar_ + props.index}" alt="avatar" class="image" />
          </div>
          <div style="word-break: break-word;color:blue">{props.message}</div>
        </div>
      )
    }
    return render
  }
})
