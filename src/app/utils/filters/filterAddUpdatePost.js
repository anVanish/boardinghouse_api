function filterAddUpdatePost(post){
    const filteredPost = {}
    if (post.title) filteredPost.title = post.title
    if (post.description) filteredPost.description = post.description
    if (post.categoryId) filteredPost.categoryId = post.categoryId
    if (post.price) filteredPost.price = post.price
    if (post.area) filteredPost.area = post.area
    if (post.renters) filteredPost.renters = post.renters
    filteredPost.images = post.images ? post.images : []
    filteredPost.video = post.video ? post.video : ""
    if (post.address) filteredPost.address = post.address
    if (post.userId) filteredPost.userId = post.userId

    return filteredPost
}

module.exports = filterAddUpdatePost