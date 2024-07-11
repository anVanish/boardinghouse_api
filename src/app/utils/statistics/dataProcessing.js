exports.getData = (revenue) => {
    return (revenue && revenue[0]) ? revenue : null
}

exports.getSingleData = (revenue)=>{
    return (revenue && revenue[0] && revenue[0].total) ? revenue[0].total : 0
}