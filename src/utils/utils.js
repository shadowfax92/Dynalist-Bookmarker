// @flow

const isNullOrUndefined = (obj: any) => {
  if (obj == undefined || obj == null) {
    return true
  } else {
    return false
  }
}

export { isNullOrUndefined }
