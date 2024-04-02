

class ApiRes{
    constructor(){
        this.success = true
        this.message = ''
        this.data = {}
    }

    setSuccess(message=''){
        this.success = true
        this.message = message
        return this
    }

    setFailure(message=''){
        this.success = false
        this.message = message
        return this
    }

    setData(field, data){
        this.data[field] = data
        return this
    }

    setMultiData(fields, datas){
        for (let i = 0; i < fields.length; i++){
            this.data[fields[i]] = datas[i]
        }
        return this
    }
}

module.exports = ApiRes