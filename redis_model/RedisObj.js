class RedisObj {
    constructor(key, redis) {
        this.key = key;
        this.redis = redis;
    }

    // read() {
    //     var data = this.redis.get(this.key);
    //     if(data) {
    //         var member_type = this.get_member_type();
    //         var JSON.parse(data);
    //     }
    // }

    save() {
        var vals = this.get_member_val();
        this.redis.set(this.key, JSON.s);
    }

    get_member_val() {
        var res;
        //for k, v 
    }

    delete() {
        this.redis.del(this.key);
    }

    to_object(data) {
        var res = {};
        for (var i = 0; i < data.length; i += 2) {
            var key = s[i];
            var value = s[i+1];
            res[key] = value;
        }
        return res;
    }

}