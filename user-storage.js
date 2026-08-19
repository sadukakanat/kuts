// user-storage.js

const USER_KEY = "kuts_users";

class UserStorage {

    static getAll() {
        return JSON.parse(localStorage.getItem(USER_KEY)) || [];
    }

    static save(user) {
        const users = this.getAll();
        users.push(user);
        localStorage.setItem(USER_KEY, JSON.stringify(users));
    }

    static findById(userId) {
        return this.getAll().find(u => u.id === userId);
    }

    static findByEmail(email) {
        return this.getAll().find(u => u.profile.email === email);
    }

}