// models/user-model.js

class User {

    constructor(data) {

        this.id = data.id;

        this.profile = data.profile;

        this.referral = data.referral;

        this.subscription = data.subscription;

        this.wallet = data.wallet;

        this.status = "ACTIVE";

        this.createdAt = new Date().toISOString();
    }

}