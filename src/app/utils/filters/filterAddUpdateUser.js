
function filterAddUpdateUser(user){
    const filteredUser = {}
    if (user.name) filteredUser.name = user.name
    if (user.phone) filteredUser.phone = user.phone
    if (user.img) filteredUser.img = user.img
    if (user.gender) filteredUser.gender = user.gender
    if (user.birthday) filteredUser.birthday = user.birthday
    return filteredUser
}

module.exports = filterAddUpdateUser