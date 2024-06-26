
exports.formatDate = (date) =>{
    const year = date.getFullYear()
    const month = (`0${date.getMonth() + 1}`).slice(-2)
    const day = (`0${date.getDate()}`).slice(-2)
    const hours = (`0${date.getHours()}`).slice(-2)
    const minutes = (`0${date.getMinutes()}`).slice(-2)
    const seconds = (`0${date.getSeconds()}`).slice(-2)
    return `${year}${month}${day}${hours}${minutes}${seconds}`
}


exports.revertDateFormat = (dateString) =>{
    const year = dateString.slice(0, 4)
    const month = dateString.slice(4, 6)
    const day = dateString.slice(6, 8)
    const hours = dateString.slice(8, 10)
    const minutes = dateString.slice(10, 12)
    const seconds = dateString.slice(12, 14)

    return new Date(year, month, day, hours, minutes, seconds)
}