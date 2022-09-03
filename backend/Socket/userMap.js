const mp = new Map()

const insertInMap = (key, value) => {
    mp.set(key, value)
    mp.set(value, key)
    console.log(mp.size, value)
}

const findValue = (key) => {
    return mp.get(key)
}

const removeKey = (key) => {
    mp.delete(key)
    // console.log(mp.values())
}

module.exports = {insertInMap, findValue, removeKey}