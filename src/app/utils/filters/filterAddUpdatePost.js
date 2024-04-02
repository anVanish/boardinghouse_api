function filterAddUpdatePost(post){
    const filteredPost = {}
    if (post.title) filteredPost.title = post.title
    if (post.description) filteredPost.description = post.description
    if (post.categoryId) filteredPost.categoryId = post.categoryId
    if (post.price) filteredPost.price = post.price
    if (post.area) filteredPost.area = post.area
    if (post.renters) filteredPost.renters = post.renters
    if (post.images) filteredPost.images = post.images
    if (post.address) filteredPost.address = post.address

    return filteredPost
}

module.exports = filterAddUpdatePost