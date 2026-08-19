/**
 * signup.js
 * KUTS Ecosystem
 */

class SignupService {

    register(formData) {

        // 1
        this.validate(formData);

        // 2
        const referrer =
            ReferralService.validateCode(formData.referralCode);

        // 3
        const user = this.createUser(formData, referrer);

        // 4
        WalletService.createWallet(user.id);

        // 5
        SubscriptionService.create(user.id);

        // 6
        UserStorage.save(user);

        // 7
        EventBus.publish("UserRegistered", {

            userId: user.id,

            referrerId:
                referrer?.id || null

        });

        return user;
    }

    validate(formData) {

        if (!formData.firstName)
            throw new Error("First name required");

        if (!formData.email)
            throw new Error("Email required");
    }

    createUser(formData, referrer) {

        return {

            id: ID.generateUserID(),

            profile: {

                firstName: formData.firstName,

                lastName: formData.lastName,

                email: formData.email,

                phone: formData.phone

            },

            referral: {

                referralCode:
                    formData.referralCode,

                referredBy:
                    referrer?.id || null,

                status:
                    referrer
                    ? "REFERRED"
                    : "NONE"

            },

            subscription: {

                plan: "FREE",

                status: "PENDING"

            },

            status: "ACTIVE",

            createdAt:
                new Date().toISOString()

        };
    }

}

const Signup = new SignupService();