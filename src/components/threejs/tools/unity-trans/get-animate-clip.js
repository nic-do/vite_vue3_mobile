// interface AnimationClip {
//   name: '';
//   duration: 0;
//   tracks: [];
//   uuid: '';
// }
const get_three_js_track_type = {
  scale: 'vector',
  quaternion: 'quaternion',
  position: 'vector'
}

const parse_unity_curve = (curve, curve_type) => {
  const type = get_three_js_track_type[curve_type]
  const name = curve.path.split('/').slice(-1) + '.' + curve_type
  const values = []
  const times = []

  for (let cc of curve.curve.m_Curve) {
    times.push(cc.time)
    if (curve_type == 'quaternion') {
      values.push(cc.value.x)
      values.push(-cc.value.y)
      values.push(-cc.value.z)
      values.push(cc.value.w)
    } else if (curve_type == 'position') {
      values.push(-cc.value.x * 100)
      values.push(cc.value.y * 100)
      values.push(cc.value.z * 100)
    } else if (curve_type == 'scale') {
      values.push(cc.value.x)
      values.push(cc.value.y)
      values.push(cc.value.z)
    }
  }

  // if (curve_type == "quaternion") {
  //   return new THREE.AnimationClip(name, times, values);
  // }

  // if (curve_type == "position") {
  //   return new THREE.VectorKeyframeTrack(name, times, values);
  // }

  return {
    type,
    name,
    times,
    values
  }
}

//待验证
const getAnimateClip = (THREE,obj, type, morphTargetDictionary) => {
  const data = {
    name: '',
    duration: 0,
    tracks: [],
    uuid: '18A2138E-2ABF-4B83-AA15-C1D85BCE2F76'
  }
  data.name = obj.AnimationClip.m_Name
  data.duration =
    obj.AnimationClip.m_AnimationClipSettings.m_StopTime -
    obj.AnimationClip.m_AnimationClipSettings.m_StartTime
  if (obj.AnimationClip.m_ScaleCurves.length > 0) {
    for (const curve of obj.AnimationClip.m_ScaleCurves) {
      data.tracks.push(parse_unity_curve(curve, 'scale'))
    }
  }

  if (obj.AnimationClip.m_RotationCurves.length > 0) {
    for (const curve of obj.AnimationClip.m_RotationCurves) {
      data.tracks.push(parse_unity_curve(curve, 'quaternion'))
    }
  }

  if (obj.AnimationClip.m_PositionCurves.length > 0) {
    for (const curve of obj.AnimationClip.m_PositionCurves) {
      data.tracks.push(parse_unity_curve(curve, 'position'))
    }
  }

  if (obj.AnimationClip.m_FloatCurves.length > 0) {
    for (const item of obj.AnimationClip.m_FloatCurves) {
      let name = ''
      if (type === 'fbx') {
        name =
          item.path.split('/').slice(-1) +
          '.morphTargetInfluences[' +
          morphTargetDictionary[item.attribute.replace('blendShape.', '')] +
          ']'
      } else if (type === 'glb') {
        name =
          item.path.split('/').slice(-1) +
          '.morphTargetInfluences[' +
          morphTargetDictionary[item.attribute.split('.').slice(-1)[0]] +
          ']'
      }

      const values = []
      const times = []

      const firstCC = item.curve.m_Curve[0]
      const lastCC = item.curve.m_Curve.slice(-1)[0]

      times.push(firstCC.time)
      times.push(lastCC.time)

      values.push(/e-/.test(firstCC.value) ? 0 : firstCC.value / 100)
      values.push(/e-/.test(lastCC.value) ? 0 : lastCC.value / 100)
      const track = new THREE.NumberKeyframeTrack(name, times, values)
      data.tracks.push(track)
    }
  }
  return data
}
// Unity动画转Three.js动画
export { getAnimateClip }
