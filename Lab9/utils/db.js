
const fs = require('fs/promises');
const path = require('path');

const usersFile = path.join(__dirname, '..', 'users.json');

async function readUsers() {
    try {
        const data = await fs.readFile(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            await writeUsers([]);
            return [];
        }

        throw error;
    }
}

async function writeUsers(users) {
    await fs.writeFile(
        usersFile,
        JSON.stringify(users, null, 2),
        'utf8'
    );
}

module.exports = {
    readUsers,
    writeUsers
};
